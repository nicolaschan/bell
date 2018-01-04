package com.countdownzone.api

import com.countdownzone.cache.*
import java.io.*
import javax.servlet.*
import javax.servlet.http.*
import java.security.MessageDigest
import kotlinx.serialization.*
import kotlinx.serialization.json.JSON
import kotlinx.serialization.Serializable
import me.nimavat.shortid.ShortId

// https://stackoverflow.com/questions/9655181/how-to-convert-a-byte-array-to-a-hex-string-in-java
private val hexArray: CharArray = "0123456789ABCDEF".toCharArray()
private fun bytesToHex(bytes: ByteArray): String {
    val hexChars: CharArray = CharArray(bytes.size * 2)
    for (j in bytes.indices) {
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
            "uuid" -> {
                resp.setContentType("application/json")
                resp.getWriter().println(JSON.stringify(IdObj(ShortId.generate())))
            }
            "time" -> {
                resp.setContentType("application/json")
                resp.getWriter().println(JSON.stringify(TimeObj(System.currentTimeMillis())))
            }
            else -> send404(resp)
        }
    }
}