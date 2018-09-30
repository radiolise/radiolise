"use strict";
var version = "(7)";
var urlsToCache = [
  "",
  ".",
  "css/chic.css",
  "css/chic-dark.css",
  "css/core.css",
  "css/fontawesome-all.css",
  "css/fontawesome-all.min.css",
  "css/pure.css",
  "css/pure-dark.css",
  "img/logo.png",
  "img/logo.svg",
  "img/spin.svg",
  "js/core.js",
  "js/hls.min.js",
  "js/i18next.min.js",
  "js/i18nextXHRBackend.min.js",
  "js/jquery.min.js",
  "locales/be.json",
  "locales/de.json",
  "locales/ru.json",
  "manifest.json",
  "webfonts/fa-brands-400.eot",
  "webfonts/fa-brands-400.svg",
  "webfonts/fa-brands-400.ttf",
  "webfonts/fa-brands-400.woff",
  "webfonts/fa-brands-400.woff2",
  "webfonts/fa-regular-400.eot",
  "webfonts/fa-regular-400.svg",
  "webfonts/fa-regular-400.ttf",
  "webfonts/fa-regular-400.woff",
  "webfonts/fa-regular-400.woff2",
  "webfonts/fa-solid-900.eot",
  "webfonts/fa-solid-900.svg",
  "webfonts/fa-solid-900.ttf",
  "webfonts/fa-solid-900.woff",
  "webfonts/fa-solid-900.woff2",
  "webfonts/FiraSans-Bold.ttf",
  "webfonts/FiraSans-Medium.ttf",
  "webfonts/FiraSans-Regular.ttf"
];
self.addEventListener("install", function(event) {
  event.waitUntil(
    caches
      .open(version)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});
self.addEventListener("fetch", function(event) {
  var request = event.request;
  if (request.method !== "GET" || !request.url.startsWith(self.location.origin)) {
    return;
  }
  event.respondWith(
    caches
      .match(event.request)
      .then(function(cached) {
        var networked = fetch(event.request)
          .then(fetchedFromNetwork, unableToResolve)
          .catch(unableToResolve);
        return cached || networked;
        function fetchedFromNetwork(response) {
          var cacheCopy = response.clone();
          caches
            .open(version)
            .then(function add(cache) {
              cache.put(event.request, cacheCopy);
            });
          return response;
        }
        function unableToResolve () {
          return new Response("<!DOCTYPE html><html><head><title>Service Unavailable</title><meta charset=\"utf-8\"><meta content=\"width=device-width, initial-scale=1, user-scalable=0\" name=\"viewport\"></head><body><h1 style=\"text-align: center\">Service Unavailable</h1><p style=\"text-align: justify\">Unfortunately, your request couldn’t be completed by the service worker. Please try again later. You may <a href=\"https://gitlab.com/radiolise/radiolise.gitlab.io/issues/new\">create a new issue</a> if the problem persists.</p></body></html>", {
            status: 503,
            statusText: "Service Unavailable",
            headers: new Headers({
              "Content-Type": "text/html"
            })
          });
        }
      })
  );
});
self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys
            .filter(function (key) {
              return !key.startsWith(version);
            })
            .map(function (key) {
              return caches.delete(key);
            })
        );
      })
  );
});
