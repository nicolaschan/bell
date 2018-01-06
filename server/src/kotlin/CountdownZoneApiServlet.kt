package com.countdownzone.api

import com.countdownzone.utils.*
import java.nio.file.Files
import java.nio.file.Paths
import java.io.*
import javax.servlet.*
import javax.servlet.http.*

private val JSON = JsonWrapper()

data class CachedFile(val timestamp: Long, val content: ByteArray)

/**
 * An extension of the HttpServlet class that provides some additional utility methods
 */
abstract class CountdownZoneApiServlet() : HttpServlet() {

    /**
     * Returns a java.io.File object representing the file stored at a given relative path.
     */
    fun retrieveFileObj(fileName: String): File {
        return File(getServletContext().getRealPath("."), fileName)
    }

    /**
     * Attempts to retrieve the data stored in a file specified at the given path, relative to
     * the root of the server.
     */
    fun retrieveFile(fileName: String): ByteArray {
        val path = Paths.get(getServletContext().getRealPath(fileName))
        return Files.readAllBytes(path)
    }

    /**
     * Checks if the file at the specified relative path is a file.
     */
    fun fileExists(fileName: String): Boolean {
        return File(getServletContext().getRealPath(fileName)).isFile()
    }

    private fun setRespContentType(fileName: String, resp: HttpServletResponse) {
        val path = Paths.get(getServletContext().getRealPath(fileName))
        val pathStr = path.toString()
        // For some reason doesn't work otherwise
        when {
            pathStr.endsWith(".css") -> resp.setContentType("text/css")
            pathStr.endsWith(".json") -> resp.setContentType("application/json")
            else -> resp.setContentType(Files.probeContentType(path))
        }
    }

    // May delete this in the future to prevent memory leaks
    protected val fileCache = mutableMapOf<String, CachedFile>()

    /**
     * Serves a file as a byte array to an HTTP response. Also sets the content-type header.
     */
    fun serveFile(fileName: String, resp: HttpServletResponse) {
        setRespContentType(fileName, resp)
        val cout: ServletOutputStream = resp.getOutputStream()
        val file: ByteArray = retrieveFile(fileName)
        cout.use { it.write(file) }
    }

    fun serveFileCached(fileName: String, resp: HttpServletResponse, time: Int = 60) {
        when {
            fileName in fileCache -> {
                var query = fileCache[fileName]!!
                val now = System.currentTimeMillis()
                if (now - query.timestamp > 1000 * time) {
                    fileCache.clear()
                    query = CachedFile(now, retrieveFile(fileName))
                    fileCache[fileName] = query
                }
                setRespContentType(fileName, resp)
                val cout: ServletOutputStream = resp.getOutputStream()
                cout.use { it.write(query.content) }
            }
            else -> serveFile(fileName, resp)
        }
    }

    fun serveJSON(obj: Any, resp: HttpServletResponse) {
        val cout = resp.getWriter()
        resp.setContentType("application/json")
        cout.println(JSON.toJson(obj))
    }

    /**
     * Sends a 404: FILE NOT FOUND error.
     * Also has a 1% chance of sending 418: I'M A TEAPOT.
     */
    fun send404(resp: HttpServletResponse) {
        if (Math.random() < 0.01) {
            resp.sendError(418)
        } else {
            resp.sendError(HttpServletResponse.SC_NOT_FOUND)
        }
    }
}