export function registerServiceWorker() {
  if (typeof globalThis !== "undefined" && "serviceWorker" in navigator) {
    globalThis.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          // eslint-disable-next-line no-console
          console.log("Service Worker registered:", registration);
        })
        .catch((error) => {
          console.error(
            "Service Worker registration failed:",
            JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
          );
        });
    });
  }
}
