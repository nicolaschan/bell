package com.countdownzone.api

import com.countdownzone.utils.*
import java.io.*
import javax.servlet.*
import javax.servlet.http.*
import java.security.MessageDigest
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

data class IdObj(val id: String)
data class TimeObj(val time: Long)

// This class extends DataServlet for access to the fetch and getMeta methods, if something goes wrong it's because of that
class APIGeneralServlet() : DataServlet() {

    val availableGet = setOf<String>("stats", "version", "message", "uuid", "time")

    private val previousCheck: Long = 0L
    private val lastVersion = ByteArray(0)

    /**
     * Gets and caches hashed version of the current version string.
     */
    protected fun getVersion(): ByteArray {
        val now = System.currentTimeMillis()
        if (now - previousCheck > 1000 * 60) {
            var md = MessageDigest.getInstance("MD5")
            val md5Sum: ByteArray = md.digest(retrieveFile("data/version.txt"))
            return md5Sum
        } else {
            return lastVersion
        }
    }

    protected fun sendVersion(resp: HttpServletResponse) {
        val cout: PrintWriter = resp.getWriter()
        resp.setContentType("text/plain")
        cout.print(bytesToHex(getVersion()).toLowerCase())
    }

    override fun doGet(req: HttpServletRequest, resp: HttpServletResponse) {
        val target: String = req.getPathInfo().trim('/')
        when (target) {
            "stats" -> TODO()
            "version" -> sendVersion(resp)
            "message" -> serveFileCached("data/message.json", resp)
            "uuid" -> serveJSON(IdObj(ShortId.generate()), resp)
            "time" -> serveJSON(TimeObj(System.currentTimeMillis()), resp)
            else -> send404(resp)
        }
    }
}