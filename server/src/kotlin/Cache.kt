package com.countdownzone.cache

/**
 * Caches the results of calling a function for a given amount of time.
 * A new Cache instance should be kept for every function
 */
class Cache(val func: (String) -> ByteArray, val time: Int = 60) {

	val cached = mutableMapOf<String, ByteArray>()
	var previousCheck: Long = 0L

	fun value(arg: String): ByteArray {
		val now = System.currentTimeMillis()
		if (now - previousCheck > 1000 * time) {
			cached.clear()
		}
		var result = cached[arg] ?: func(arg)
		if (!cached.containsKey(arg)) {
			previousCheck = now
			cached.put(arg, result)
		}
		return result
	}
}

class ProducerCache(val func: () -> ByteArray, val time: Int = 60) {

	// only a single result is ever cached
	var cached = ByteArray(0)
	var previousCheck: Long = 0L

	fun value(): ByteArray {
		val now = System.currentTimeMillis()
		if (now - previousCheck > 1000 * time) {
			cached = func()
		}
		return cached
	}

}

fun cache(func: (String) -> ByteArray, time: Int = 60): (String) -> ByteArray {
	val thisCache = Cache(func, time)
	return { arg -> thisCache.value(arg) }
}

fun cache(func: () -> ByteArray, time: Int = 60): () -> ByteArray {
	val thisCache = ProducerCache(func, time)
	return thisCache::value
}