// NUVIO_CHROMIUM_TARGET builds for one newer TV generation only (for example
// 94 for LG webOS TV 23). The JavaScript is then compiled for that engine and
// carries far fewer transforms and polyfills, and the startup gate refuses
// older engines with a clear message instead of failing on syntax.
const chromiumTargetOverride = Number.parseInt(process.env.NUVIO_CHROMIUM_TARGET || "", 10);
const hasChromiumTargetOverride =
  Number.isFinite(chromiumTargetOverride) && chromiumTargetOverride > 56;

export const compatibilityPolicy = Object.freeze({
  tizenSupportYear: 2018,
  webOsSupportYear: 2020,
  webOsRequiredVersion: "5.0.0",
  tizenInstallMinimumVersion: "2.3",
  tizenRequiredVersion: "4.0",
  chromiumVersion: hasChromiumTargetOverride ? chromiumTargetOverride : 56,
  webOsChromiumVersion: hasChromiumTargetOverride ? chromiumTargetOverride : 68,
  webOsServiceNodeVersion: 8
});
