/**
 * Takes a function and caches its results for a set
 * number of seconds.
 *
 * @param  {Function} f Function to cache
 * @param  {number} time Time to cache (seconds)
 * @return {Function} Cached version of the function
 */
const cache = function (f, time = 60) {
  let cacheReset = Date.now()
  let cache = {}

  return function () {
    if (Date.now() - cacheReset > 1000 * time) {
      // cache has expired, so reset it
      cacheReset = Date.now()
      cache = {}
    }

    const argumentString = JSON.stringify(arguments)
    if (!cache[argumentString]) {
      // item is not in the cache, so add it
      cache[argumentString] = f.apply(null, arguments)
    }

    return cache[argumentString]
  }
}

module.exports = cache
