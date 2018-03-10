"use strict";
var version = "v1::";
var urlsToCache = [
  ""
];
self.addEventListener("install", function(event) {
  event.waitUntil(
    caches
      .open(version + "install")
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
      .then(function() {
      })
  );
});
self.addEventListener("fetch", function(event) {
  if (event.request.method !== "GET") {
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
            .open(version + "fetch")
            .then(function add(cache) {
              cache.put(event.request, cacheCopy);
            })
            .then(function() {
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
