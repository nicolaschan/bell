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

fun cache(func: (String) -> ByteArray, time: Int = 60): (String) -> ByteArray {
	val thisCache = Cache(func, time)
	return { arg -> thisCache.value(arg) }
}