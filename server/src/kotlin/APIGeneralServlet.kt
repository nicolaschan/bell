package com.countdownzone.api

import com.countdownzone.cache.*
import java.io.*
import javax.servlet.*
import javax.servlet.http.*
import java.security.MessageDigest
import me.nimavat.shortid.ShortId
import kotlinx.serialization.*
import kotlinx.serialization.json.JSON
import kotlinx.serialization.Serializable

// https://stackoverflow.com/questions/9655181/how-to-convert-a-byte-array-to-a-hex-string-in-java
private val hexArray: CharArray = "0123456789ABCDEF".toCharArray()
private fun bytesToHex(bytes: ByteArray): String {
    val hexChars: CharArray = CharArray(bytes.size * 2)
    for (j in 0 until bytes.size) {
        val v: Int = bytes[j].toInt() and 0xFF
        hexChars[j * 2] = hexArray[(v ushr 4).toInt()]
        hexChars[j * 2 + 1] = hexArray[(v and 0x0F).toInt()]
    }
    return String(hexChars)
}

@Serializable data class IdObj(val id: String)
@Serializable data class TimeObj(val time: Long)

// This class extends DataServlet for access to the fetch and getMeta methods, if something goes wrong it's because of that
class APIGeneralServlet() : DataServlet() {

	val availableGet = setOf<String>("stats", "version", "message", "uuid", "time")
	val availablePost = setOf<String>("analytics", "errors")

	private fun _getVersionHash(): ByteArray {
		var md = MessageDigest.getInstance("MD5")
		val md5Sum: ByteArray = md.digest(retrieveFile("data/version.txt"))
		return md5Sum
	}
	/**
	 * Gets a hashed version of the current version string.
	 */
	protected val getVersion: () -> ByteArray = cache ( ::_getVersionHash )

	protected fun sendVersion(resp: HttpServletResponse) {
		val cout: PrintWriter = resp.getWriter()
		cout.println(bytesToHex(getVersion()).toLowerCase())
	}

	override fun doGet(req: HttpServletRequest, resp: HttpServletResponse) {
		val target: String = req.getPathInfo().trim('/')
		when (target) {
			"stats" -> TODO()
			"version" -> sendVersion(resp)
			"message" -> serveFileCached("data/message.json", resp)
			"uuid" -> resp.getWriter().println(JSON.stringify(IdObj(ShortId.generate())))
			"time" -> resp.getWriter().println(JSON.stringify(TimeObj(System.currentTimeMillis())))
			else -> resp.getWriter().println("Cannot get ${target}")
		}
	}

	override fun doPost(req: HttpServletRequest, resp: HttpServletResponse) {
		val target: String = req.getPathInfo().trim('/')

	}
}