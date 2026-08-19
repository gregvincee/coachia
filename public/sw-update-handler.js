/* Permet à l’interface d’activer explicitement une version PWA en attente. */
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
