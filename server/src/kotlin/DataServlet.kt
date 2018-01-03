package com.countdownzone.api

import com.countdownzone.cache.*
import java.io.*
import java.nio.file.Files
import java.nio.file.Paths
import java.net.URLConnection
import java.net.URL
import javax.servlet.*
import javax.servlet.http.*
import kotlinx.serialization.*
import kotlinx.serialization.json.JSON
import kotlinx.serialization.Serializable

@Serializable
data class SourceData(val location: String)

@Serializable
data class URLSourceData(val location: String, val url: String)

@Serializable
data class GHSourceData(val location: String, val repo: String)

class DataServlet() : HttpServlet() {

	val userAgentStr = "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.4; en-US; rv:1.9.2.2) Gecko/20100316 Firefox/3.6.2"

	/**
	 * Fetches a file named {target} for a given schedule source. The result is NOT cached by this method.
	 */
	private fun fetch(source: String, target: String): ByteArray {
		// Location should always be stored in the JSON
		var sourceJsonStr = String(getSourceJson(source))
		val sourceData = JSON.nonstrict.parse<SourceData>(sourceJsonStr)
		val location = sourceData.location
		val file: ByteArray
		when (location) {
			"local" -> {
				val path = Paths.get("data/$source/$target")
				file = Files.readAllBytes(path)
			}
			"web" -> {
				val urlData = JSON.parse<URLSourceData>(sourceJsonStr)
				val url = "${urlData.url}/api/data/${source}/${target.split('.')[0]}"
				// the following 4 lines are used to get data from an outside source
				val connection: URLConnection = URL(url).openConnection()
				// required to prevent 403 error
				connection.setRequestProperty("User-Agent", userAgentStr);
				val inputStream: InputStream = connection.getInputStream()
				file = inputStream.readBytes()
			}
			"github" -> {
				val ghData = JSON.parse<GHSourceData>(sourceJsonStr)
				val pieces: List<String> = ghData.repo.split('/')
			    val usernameRepo = pieces.slice(0..2).joinToString("/")
			    var path = pieces.slice(2..pieces.size).joinToString("/")
				val url = "https://raw.githubusercontent.com/${usernameRepo}/master/${path}/${target}"
			    val connection: URLConnection = URL(url).openConnection()
				val inputStream: InputStream = connection.getInputStream()
				file = inputStream.readBytes()
			}
			else -> return ByteArray(0)
		}
		return file
	}

	private val getSourceJson: (String) -> ByteArray = cache({
		source -> File(getServletContext().getRealPath(".") + "/data/${source}/source.json").readBytes()
		})
	private val getCorrection: (String) -> ByteArray = cache({ source -> fetch(source, "correction.txt") })
	private val getSchedules: (String) -> ByteArray = cache({ source -> fetch(source, "schedules.bell") })
	private val getCalendar: (String) -> ByteArray = cache({ source -> fetch(source, "calendar.bell") })
	// Unlike the javascript analog, this does not parse this as a JSON object
	private val getMeta: (String) -> ByteArray = cache({ source -> fetch(source, "meta.json") })

	override fun doGet(req: HttpServletRequest, resp: HttpServletResponse) {
		val pathInfo = req.getPathInfo().trim('/')
		val segments = pathInfo.split("/")
		if (segments.size != 2) {
			send404(resp)
			return
		}
		val source = segments[0]
		val target = segments[1]
		if (target !in arrayOf("meta", "correction", "calendar", "schedules")) {
			send404(resp)
			return
		}
		val cout: ServletOutputStream = resp.getOutputStream()
		val contents: ByteArray = when (target) {
			"meta" -> getMeta(source)
			"correction" -> getSchedules(source)
			"calendar" -> getCalendar(source)
			"schedules" -> getSchedules(source)
			else -> ByteArray(0)
		}
		cout.use { it.write(contents) }
	}

}