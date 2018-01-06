package com.countdownzone.api

import java.nio.file.Files
import java.nio.file.Paths
import java.io.*
import javax.servlet.*
import javax.servlet.http.*

class ResourceServlet() : CountdownZoneApiServlet() {

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
		var fileToServe: String = "static"
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
		if (!fileExists(fileToServe)) {
			send404(resp)
			return
		}
		serveFile(fileToServe, resp)
	}

}