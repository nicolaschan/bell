class Cache {
  constructor (defaultTtlSeconds = 60) {
    this.defaultTtlSeconds = defaultTtlSeconds
    this.cache = {}
  }

  async get (key, f) {
    const cached = this.cache[key]
    if (cached) {
      if (Date.now() > cached.expires) {
        this.invalidate(key)
      }
      return cached.value
    }
    if (f == null) {
      return null
    }
    const value = await f(key)
    this.set(key, value, this.defaultTtlSeconds)
    return value
  }

  cached (f) {
    return (key) => {
      return this.get(key, f)
    }
  }

  set (key, value, ttlSeconds = 60) {
    if (Object.keys(this.cache).length > 1000) {
      // clear the cache if it's too big
      this.cache = {}
    }
    this.cache[key] = {
      value,
      expires: Date.now() + ttlSeconds * 1000
    }
  }

  invalidate (key) {
    delete this.cache[key]
  }
}

module.exports = Cache
