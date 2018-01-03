package com.countdownzone.api

import java.nio.file.Files
import java.nio.file.Paths
import java.io.*
import javax.servlet.*
import javax.servlet.http.*
import kotlinx.serialization.*
import kotlinx.serialization.json.JSON

/**
 * Serves a file as a byte array to an HTTP response. Also sets the content-type header.
 */
fun serveFile(fileName: String, resp: HttpServletResponse) {
	val path = Paths.get(fileName)
	// For some reason doesn't work otherwise
	if (path.toString().endsWith(".css")) {
		resp.setContentType("text/css")
	}
	else {
		resp.setContentType(Files.probeContentType(path))
	}
	val cout: ServletOutputStream = resp.getOutputStream()
	val file: ByteArray = Files.readAllBytes(path)
	cout.use { it.write(file) }
}

/**
 * Sends a 404: FILE NOT FOUND error.
 * Also has a 1% chance of sending 418: I'M A TEAPOT.
 */
fun send404(resp: HttpServletResponse) {
	if (Math.random() < 0.01) {
		resp.sendError(418)
	}
	else {
		resp.sendError(HttpServletResponse.SC_NOT_FOUND)
	}
}

class ResourceServlet() : HttpServlet() {

	// Note: the values are actually not used because the keys are hard to obtain,
	// Files.probecontentType is used for the MIME type instead
	val resources = mapOf<String, String>("/favicons/" to "/image/png",
										  "/bin/" to "/text/javascript",
										  "/css/" to "/text/css",
										  "/img/" to "/image/png")
	val aliasResources = mapOf<String, String>("/icons/" to "/icons/",
											   "/fonts/" to "/fonts/")
	
	override fun doGet(req: HttpServletRequest, resp: HttpServletResponse) {
		val uri = req.getRequestURI()
		var fileToServe: String = getServletContext().getRealPath("./static")
		if (true in resources.keys.map { uri.startsWith(it) }) {
			fileToServe += uri
		}
		else if (uri.startsWith("/icons/")) {
			fileToServe += uri
		}
		else if (uri.startsWith("/fonts/")) {
			fileToServe += uri
		}
		else {
			send404(resp)
			return
		}
		if (!File(fileToServe).isFile()) {
			send404(resp)
			return
		}
		serveFile(fileToServe, resp)
	}

}