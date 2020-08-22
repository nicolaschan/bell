/* global self, caches, fetch, clients */
// Based on https://serviceworke.rs/strategy-network-or-cache_service-worker_doc.html

const VERSION = require('../package.json').version
var CACHE = `cache-${VERSION}`
const SimpleLogger = require('./SimpleLogger').default
const logger = new SimpleLogger()

const cachedResources = [
  '/',
  '/offline',
  '/css/style-mithril.css',
  '/bin/client-mithril.js',
  '/timesync/timesync.js',
  '/icons/iconfont/MaterialIcons-Regular.woff2',
  '/fonts/roboto/Roboto-Regular.woff2',
  '/api/error',
  '/api/sources',
  '/api/sources/names'
]

async function fromCache (request) {
  var cache = await caches.open(CACHE)
  var matching = await cache.match(request)
  if (!matching) {
    return fromCache('/') // Match routes such as "/lahs" or generally "/:source"
    // throw new Error(`No cached data for ${request.method}: ${request.url}`)
  }
  return matching
}

function fromNetwork (request, timeout) {
  return new Promise((resolve, reject) => {
    var timeoutId = setTimeout(reject, timeout)
    fetch(request).then(function (response) {
      clearTimeout(timeoutId)
      if (request.method === 'GET') {
        caches.open(CACHE).then(cache => {
          cache.put(request, response.clone())
        })
      }
      resolve(response.clone())
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
  evt.respondWith(
    fromNetwork(evt.request, 6000)
      .catch(function (e) {
        logger.log(`${evt.request.url} serving from cached`, 'ServiceWorker')
        return fromCache(evt.request)
      })
      .catch(function (e) {
        return fromCache('/api/error')
      })
  )
})
self.addEventListener('notificationclick', function (event) {
  const clickedNotification = event.notification
  clickedNotification.close()

  const promiseChain = clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  }).then((windowClients) => {
    if (windowClients[0]) {
      return windowClients[0].focus()
    } else {
      return clients.openWindow(new URL('/', self.location.origin).href)
    }
  })
  event.waitUntil(promiseChain)
})
