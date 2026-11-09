# Nuvio TV B2

Veränderte Fassung von [Nuvio TV](https://github.com/NuvioMedia/NuvioTVSmart) (GPL-3.0),
abgestimmt auf den **LG OLED55B29LA** mit **webOS TV 23 (8.3.0, Chromium 94)**.
Installiert sich als eigene App `space.nuvio.webosb2` neben der offiziellen Nuvio-App.

## Installation (Homebrew Channel)

Im Homebrew Channel unter _Einstellungen → Repositories_ diese Adresse hinzufügen:

```
https://raw.githubusercontent.com/MasterOfDeaster/nuvio-tv-b2/main/webosbrew/apps.json
```

Oder die IPK direkt installieren: [`webosbrew/space.nuvio.webosb2_1.3.904_all.ipk`](webosbrew/space.nuvio.webosb2_1.3.904_all.ipk)

## Was anders ist

- **Sparsamer Modus für LG-Geräte mit α5/α7-Chip** (OLED A, OLED B1–B3, UHD/NanoCell-LCD),
  erkannt am Modellnamen. Die offizielle App stuft den B2 (α7 Gen5) nach Baujahr als „modern“
  ein und zeigt alle Effekte. Hier bekommt er:
  - keine Unschärfe-Ebenen (backdrop-filter) hinter der Seitenleiste,
  - nur eine Hintergrundbild-Ebene statt Überblendung zweier Vollbilder,
  - kurze Einblendung statt gleitender Seitenwechsel,
  - sofortiges Zuklappen der Poster,
  - gebremste Wiederholung beim Gedrückthalten der Pfeiltasten, damit sich keine Eingaben stauen.
    Das Layout bleibt das moderne, Funktionen fallen nicht weg.
- **Ruhiger beim Durchblättern:** Hintergrundbild und Titel-Logo der Startseite werden erst geladen,
  wenn der Fokus kurz stehen bleibt, nicht mehr für jedes Poster, über das man nur hinwegscrollt.
  Die Reihen bekommen wie auf webOS 22 keine eigene erzwungene Grafikebene mehr.
- **Auf dem OLED B2 gemessen und entlastet (1.3.903):**
  - Startseite: die Reihen sind wieder eigene Stapelkontexte (`isolation`), dadurch 40 statt
    rund 440 Grafikebenen. Karten laden `w500`- statt `w1280`-Bilder, Titel-Logos `w500`
    statt Originalgröße, große WebP-Kacheln werden im Worker verkleinert.
    Beim Blättern ca. 51 statt 33 Bilder pro Sekunde.
  - Streamliste: Badge-Bilder als `blob:`-URL statt jedes Mal Base64 zu parsen, die
    virtuelle Liste baut sich nur noch am Rand neu auf. Lange Listen ca. 42 statt 7 Bilder
    pro Sekunde.
  - Player: schnelles Mehrfach-Spulen wird zu einem Sprung zusammengefasst,
    Untertitel-Dialog reagiert schneller.
- **Großes IMDb-Badge auf den Postern (1.3.904):** Nuvio zeichnet die IMDb-Wertung selbst
  (scharfer Text, etwa doppelt so groß wie eingebrannte Rating-Poster). Poster von
  Rating-Diensten (AIORatings, RPDB, Top-Posters) mit IMDb-ID werden durch das normale Poster
  aus dem Stremio-Posterarchiv ersetzt, damit keine drei kleinen Wertungen mehr im Bild stehen.
  Die IMDb-Wertung aus den Katalogen wird dafür nicht mehr verworfen.
- **Für Chromium 94 übersetzt** statt für Chromium 56 (Haupt-Bundle 3,73 → 3,48 MB,
  Polyfills 153 → 100 KB). Ältere Fernseher bekommen beim Start eine Meldung.

Die Änderungen stehen in den Commits nach dem ersten. Der erste ist der unveränderte Stand
von NuvioTVSmart `bd73c02f7fa95542485ae108a1eb5f3cc63d3a66`.

## Selbst bauen

```bash
curl -LO https://github.com/NuvioMedia/NuvioTVSmart/releases/download/1.3.9/NuvioTV-webOS-1.3.9.ipk
python3 tools/build-nuvio-b2.py . NuvioTV-webOS-1.3.9.ipk out
```

Die offizielle Release-IPK liefert nur `nuvio.env.js` (öffentliche Dienst-Schlüssel), die im Quellcode fehlt.
Das Skript läuft unter macOS, Linux und Windows (unter Windows `python` statt `python3`).

---

## Original-README von Nuvio TV

<div align="center">

  <img src="assets/brand/app_logo_wordmark.png" alt="Nuvio" width="300" />

  <p>
    A free, open-source media app for your phone, your desktop, and the TV you already own.
    <br />
    Bring your own sources. Nuvio turns them into a library with artwork, ratings, subtitles, and your place saved on every screen.
  </p>

[Website](https://nuvio.tv) · [GitHub releases](https://github.com/NuvioMedia/NuvioTVSmart/releases/latest) · [Support Nuvio](https://nuvio.tv/support)

</div>

## Get Nuvio TV

Nuvio TV supports **Samsung Tizen TVs from 2018 onward (Tizen 4+)** and **LG webOS TVs from 2020 onward (webOS 5+)**.
The startup compatibility baseline is Samsung Tizen 4.0 / Chromium 56 and LG webOS 5.0 / Chromium 68 when the platform reports those versions.

Platform capabilities are intentionally version-dependent:

- **Samsung Tizen 4.x** — the app and direct playback are supported, but torrent/P2P playback is unavailable by design. Some advanced audio and subtitle features may also be limited.
- **Samsung Tizen 5.x, including 5.5** — torrent/P2P playback is supported through the bundled local EngineFS service only. The PluginService, plugin execution, and remote plugin pull/push synchronization are disabled; the Plugins screen is not available.
  The Node 4.4.3 service runtime observed on Tizen 5.5 is incompatible with the current PluginService syntax and URL APIs. Experimental legacy transports are not included; plugin support starts at Tizen 6.0.
- **Samsung Tizen 6+** — torrent/P2P and the packaged PluginService are supported. Plugin execution requires the packaged service plus the TV runtime's Worker and WebAssembly support. Tizen 6 and later use the same current Tizen service pipeline.
- **LG webOS 5.x** — torrent/P2P and the packaged plugin service are supported, with the limited plugin resource quotas used by the older webOS runtime.
- **LG webOS 6+** — torrent/P2P and the packaged plugin service are supported with the modern plugin resource quotas.

On Tizen 5+ and LG webOS, torrent/P2P uses only the bundled local companion service; no external torrent streaming server is configured or required.

- [Nuvio TV Installer](https://github.com/NuvioMedia/NuvioTVSmart/releases/latest) for Windows, macOS, and Linux
- [Samsung Tizen WGT](https://github.com/NuvioMedia/NuvioTVSmart/releases/latest) for manual installation
- [LG webOS Homebrew repository](https://raw.githubusercontent.com/NuvioMedia/NuvioTVWebOS/main/webosbrew/apps.json)
- [LG webOS IPK](https://github.com/NuvioMedia/NuvioTVSmart/releases/latest) for manual installation

## Build from source

```bash
git clone https://github.com/NuvioMedia/NuvioTVSmart.git NuvioTVSmart
cd NuvioTVSmart
npm install
npm run build
```

Build TV packages with:

```bash
npm run package:tizen
npm run package:tizen:store
npm run package:webos
```

`package:tizen` creates the unsigned WGT used by development and the Nuvio TV Installer. The installer signs it locally for the target TV before installation. `package:tizen:store` is a separate Seller Office build: it requires Tizen Studio/Web CLI and a configured security profile, and creates the signed Store package with the local EngineFS service included so Tizen 5+ retains torrent/P2P playback. Tizen 4 still reports P2P as unsupported at runtime. Nuvio TV is built with JavaScript, HTML, CSS, and platform TV APIs. Building requires Node.js and npm; package installation additionally requires the relevant Tizen or webOS tools.

## License

[GNU General Public License v3.0](./LICENSE)
