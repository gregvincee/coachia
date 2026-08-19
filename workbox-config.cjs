module.exports = {
  globDirectory: "dist",
  globPatterns: ["**/*.{html,js,css,json,png,webp,ico,svg,ttf,woff,woff2}"],
  swDest: "dist/sw.js",
  cleanupOutdatedCaches: true,
  clientsClaim: true,
  skipWaiting: false,
  importScripts: ["/sw-update-handler.js"],
  navigateFallback: "/offline.html",
  navigateFallbackDenylist: [/^\/api\//],
  maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
};
