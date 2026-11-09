#!/usr/bin/env python3
"""Builds "Nuvio TV B2": Nuvio TV (GPL-3.0, https://github.com/NuvioMedia/NuvioTVSmart)
tuned for the LG OLED55B29LA on webOS TV 23 (Chromium 94), as a separate app
(space.nuvio.webosb2) so the official app can stay installed.

Changes (see the commits of this repository):
  * JavaScript compiled for Chromium 94 instead of Chromium 56 (smaller bundle, fewer
    transforms and polyfills; the start-up gate refuses older TVs with a message).
  * LG alpha5/alpha7 models (OLED A/B1-B3, UHD/NanoCell LCD) start in the
    performance-constrained profile: no blur layers, single hero artwork layer, no
    sliding route animations, instant poster collapse, throttled D-pad hold repeat.

Usage: tools/build-nuvio-b2.py <this repository> <official release ipk> <out dir>
The official release ipk only supplies nuvio.env.js (public service keys), which the
source tree does not contain.
"""
import json, os, shutil, subprocess, sys, tarfile

repo, official_ipk, out = (os.path.abspath(a) for a in sys.argv[1:4])
here = os.path.dirname(os.path.abspath(__file__))
OLD, NEW = 'space.nuvio.webos', 'space.nuvio.webosb2'
CHROMIUM = '94'
# Bump for every B2 build of the same upstream version. The app version becomes
# MAJOR.MINOR.(PATCH*100 + B2_REVISION), e.g. upstream 1.3.9 + revision 2 = 1.3.902,
# so the Homebrew Channel offers each B2 build as an update.
B2_REVISION = 5
work = os.path.join(out, 'work')
shutil.rmtree(work, ignore_errors=True)
os.makedirs(work)


def run(cmd, **kw):
    print('+', ' '.join(cmd))
    # npm is npm.cmd on Windows; resolve it so subprocess finds it without a shell.
    cmd = [shutil.which(cmd[0]) or cmd[0]] + list(cmd[1:])
    subprocess.run(cmd, check=True, **kw)


def extract_ipk(ipk, dest):
    """`ar x` + `tar xzf data.tar.gz -C data`, in Python so it also runs on Windows."""
    print('+ extract', ipk)
    with open(ipk, 'rb') as f:
        if f.read(8) != b'!<arch>\n':
            raise SystemExit(f'{ipk}: not an ar archive')
        while True:
            header = f.read(60)
            if len(header) < 60:
                break
            name = header[:16].decode().strip().rstrip('/')
            size = int(header[48:58].decode().strip())
            body = f.read(size)
            if size % 2:
                f.read(1)
            with open(os.path.join(dest, name), 'wb') as out_file:
                out_file.write(body)
    os.makedirs(os.path.join(dest, 'data'))
    with tarfile.open(os.path.join(dest, 'data.tar.gz')) as tar:
        tar.extractall(os.path.join(dest, 'data'))


# 1. Source patch + build
patch_file = os.path.join(here, 'nuvio-b2.patch')
if not os.path.exists(patch_file):
    print('Source tree already contains the B2 changes.')
elif subprocess.run(['git', 'apply', '--check', patch_file], cwd=repo).returncode == 0:
    run(['git', 'apply', os.path.join(here, 'nuvio-b2.patch')], cwd=repo)
else:
    print('Patch already applied or not applicable; continuing with the tree as it is.')
env = dict(os.environ, NUVIO_CHROMIUM_TARGET=CHROMIUM)
run(['npm', 'ci', '--no-audit', '--no-fund'], cwd=repo, env=env)
run(['npm', 'run', 'build'], cwd=repo, env=env)

# 2. Public service keys from the official release
ex = os.path.join(work, 'official')
os.makedirs(ex)
extract_ipk(official_ipk, ex)
shutil.copy(os.path.join(ex, 'data/usr/palm/applications', OLD, 'nuvio.env.js'),
            os.path.join(repo, 'dist', 'nuvio.env.js'))

# 3. Official packaging pipeline (stages app + both services, builds the ipk)
run(['node', 'scripts/package-webos.mjs'], cwd=repo, env=env)
version = json.load(open(os.path.join(repo, 'dist', 'appinfo.json')))['version']
built = os.path.join(repo, f'{OLD}_{version}_all.ipk')

# 4. Re-id as a separate app
src = os.path.join(work, 'built')
os.makedirs(src)
extract_ipk(built, src)
data = os.path.join(src, 'data')
stage = os.path.join(work, 'stage')
os.makedirs(stage)
app_dst = os.path.join(stage, 'app')
shutil.copytree(os.path.join(data, 'usr/palm/applications', OLD), app_dst)
services = []
for name in sorted(os.listdir(os.path.join(data, 'usr/palm/services'))):
    new_name = NEW + name[len(OLD):]
    shutil.copytree(os.path.join(data, 'usr/palm/services', name), os.path.join(stage, new_name))
    services.append(new_name)

for root, _, files in os.walk(stage):
    for fn in files:
        if fn.endswith(('.json', '.js', '.cjs', '.mjs', '.html')) and not fn.endswith('.min.js'):
            p = os.path.join(root, fn)
            s = open(p, encoding='utf-8').read()
            s2 = s.replace(OLD + '.', NEW + '.').replace('"' + OLD + '"', '"' + NEW + '"')
            if s2 != s:
                open(p, 'w', encoding='utf-8').write(s2)

ai_path = os.path.join(app_dst, 'appinfo.json')
ai = json.load(open(ai_path))
ai['id'] = NEW
major, minor, patch = (int(x) for x in version.split('.'))
b2_version = f'{major}.{minor}.{patch * 100 + B2_REVISION}'
ai['version'] = b2_version
ai['title'] = 'Nuvio TV B2'
ai['services'] = [s for s in services if s.endswith('.service') and 'plugin' not in s]
json.dump(ai, open(ai_path, 'w'), indent=2)

with open(os.path.join(app_dst, 'NUVIO-B2-NOTICE.txt'), 'w') as f:
    f.write(f'Nuvio TV B2 {b2_version}: modified build of Nuvio TV {version} (GPL-3.0, '
            'https://github.com/NuvioMedia/NuvioTVSmart), tuned for LG OLED B2 / webOS TV 23. '
            'Source: https://github.com/MasterOfDeaster/nuvio-tv-b2\n')

ares = os.path.join(repo, 'node_modules', '@webos-tools', 'cli', 'bin', 'ares-package.js')
compat = os.path.join(repo, 'scripts', 'node24-ares-compat.cjs')
run(['node', '--require', compat, ares, app_dst] + [os.path.join(stage, s) for s in services] + ['-o', out])
print('OK:', [f for f in os.listdir(out) if f.endswith('.ipk')])
