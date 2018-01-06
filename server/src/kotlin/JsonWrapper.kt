package com.countdownzone.utils

import com.google.gson.Gson

/**
 * Defines a unified interface for JSON operations, making it easier to use a single library under the hood.
 */
class JsonWrapper() {

    private val JSON: Gson = Gson()

    inline fun <reified T> parse(s: String): T = fromJson(s, T::class.java)

    fun stringify(obj: Any?) = toJson(obj)

    fun <T> fromJson(s: String, clazz: Class<T>): T = JSON.fromJson(s, clazz)

    fun toJson(obj: Any?) = JSON.toJson(obj)
}

typealias JsonSyntaxException = com.google.gson.JsonSyntaxException