package com.countdownzone.api

import com.countdownzone.utils.*
import java.io.*
import javax.servlet.*
import javax.servlet.http.*
import java.nio.file.Paths

private val JSON = JsonWrapper()

/**
 * Static typing makes JSON manipulation a little harder. As such, the ReceivedMeta class
 * represents a JSON object found in a file, which is then translated into a SentMeta object.
 * This function is responsible for that conversion.
 */
fun convertMeta(rec: ReceivedMeta, id: String): SentMeta {
	return when(rec) {
		is SchoolMeta -> SentSchoolMeta(rec.name, id, rec.periods)
		is CustomMeta -> SentCustomMeta(rec.name, id, rec.type)
		else -> throw IllegalArgumentException("No implementation for requisite SentMeta type")
	}
}

abstract class ReceivedMeta() {
	abstract val name: String
}
data class SchoolMeta(override val name: String, val periods: Array<String>) : ReceivedMeta()
data class CustomMeta(override val name: String, val type: String) : ReceivedMeta()

abstract class SentMeta() {
	abstract val name: String
	abstract val id: String
}
data class SentSchoolMeta(override val name: String, override val id: String, val periods: Array<String>) : SentMeta()
data class SentCustomMeta(override val name: String, override val id: String, val type: String) : SentMeta()

// This class extends DataServlet for access to the fetch and getMeta methods, if something goes wrong it's because of that
class APISourcesServlet() : DataServlet() {

	protected fun sendSources(resp: HttpServletResponse) {
		val dataDir: File = retrieveFileObj("data/")
 		val dirs: Array<String> = dataDir.list(object : FilenameFilter {
			override fun accept(dir: File, name: String): Boolean = File(dir, name).isDirectory()
		})
		val sources: List<SentMeta> = dirs.map {
			val file = String(getMeta(it))
			return@map convertMeta(try {
				// temporary fix
				val result = JSON.fromJson(file, SchoolMeta::class.java)
				if (result.periods == null) {
					throw JsonSyntaxException("Could not convert to SchoolMeta")
				}
				result
			} catch (e: JsonSyntaxException) {
				JSON.fromJson(file, CustomMeta::class.java)
			}, it)
		}
		serveJSON(sources, resp)
	}	

	protected fun sendSourcesNames(resp: HttpServletResponse) {
		val dataDir: File = retrieveFileObj("data/")
		val dirs: Array<String> = dataDir.list(object : FilenameFilter {
			override fun accept(dir: File, name: String): Boolean = File(dir, name).isDirectory()
		})
		serveJSON(dirs, resp)
	}


	override fun doGet(req: HttpServletRequest, resp: HttpServletResponse) {
		val target: String = req.getPathInfo().trim('/')
		when (target) {
			"" -> sendSources(resp)
			"names" -> sendSourcesNames(resp)
			else -> resp.getWriter().print("Cannot get ${target}")
		}		
	}
}