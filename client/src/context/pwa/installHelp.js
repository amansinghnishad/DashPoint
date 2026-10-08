export function getPwaInstallHelp(isIOSDevice = false) {
  if (isIOSDevice) {
    return "On iPhone or iPad, open the Share menu and choose Add to Home Screen.";
  }

  if (typeof window !== "undefined" && window.isSecureContext === false) {
    return "To install DashPoint, open localhost during development or use the deployed HTTPS address.";
  }

  return "This browser hasn't offered an install prompt. Open DashPoint in Chrome or Edge, then choose Install DashPoint from the browser menu. Embedded browser windows may not support installation.";
}
