/* global self, caches, fetch */
// Based on https://serviceworke.rs/strategy-network-or-cache_service-worker_doc.html

const VERSION = 'v3.1.2'
var CACHE = `cache-${VERSION}`
const SimpleLogger = require('./SimpleLogger')
const logger = new SimpleLogger()

const cachedResources = [
  '/',
  '/offline',
  '/css/style-mithril.css',
  '/bin/client-mithril.js',
  '/timesync/timesync.js',
  '/icons/iconfont/MaterialIcons-Regular.woff2',
  '/fonts/roboto/Roboto-Regular.woff2'
]

const urlMatch = function (url, ...matching) {
  url = url.split('/').slice(3)
  for (let i = 0; i < matching.length; i++) {
    if (url[i] !== matching[i]) {
      return false
    }
  }
  return true
}

async function fromCache (request) {
  var cache = await caches.open(CACHE)
  var matching = await cache.match(request)
  if (!matching) {
    console.log(request.url, urlMatch(request.url, 'api'))
    if (urlMatch(request.url, 'api')) {
      throw new Error('No cached data')
    } else {
      return caches.match('/offline')
    }
  }
  return matching
}

function fromNetwork (request, timeout) {
  return new Promise((resolve, reject) => {
    var timeoutId = setTimeout(reject, timeout)
    fetch(request).then(function (response) {
      clearTimeout(timeoutId)
      resolve(response)
    }, reject)
  })
}

self.addEventListener('install', evt => {
  logger.log(`New ServiceWorker ${VERSION} is being installed`, 'ServiceWorker')
  self.skipWaiting()
  evt.waitUntil(caches.open(CACHE).then(cache => {
    cache.addAll(cachedResources)
  }))
})
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(key => {
        if (key !== CACHE) {
          return caches.delete(key)
        }
      })))
      .then(() => {
        logger.log(`Ready to use cache ${CACHE}`, 'ServiceWorker')
      })
  )
})
self.addEventListener('fetch', function (evt) {
  evt.respondWith(fromNetwork(evt.request, 2000).catch(function () {
    logger.log(`${evt.request.url} serving from cached`, 'ServiceWorker')
    return fromCache(evt.request)
  }))
})
