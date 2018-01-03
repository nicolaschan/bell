package com.countdownzone.api

import java.io.*
import javax.servlet.*
import javax.servlet.http.*
import java.nio.file.Paths
/*import kotlinx.serialization.*
import kotlinx.serialization.json.JSON
import kotlinx.serialization.Serializable*/
// Because kotlinx seems to have issues with abstract classes, I turn to a different library
import com.google.gson.*

private val JSON = Gson()

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
// For some reason, the serialization library does not seem to handle serialization for abstract classes very well.
// It's also not that well documented. Thus, I turn to this SUPER DUPER UNSAFE manual JSON generation method.
/*private fun toJson(obj: SentMeta): String {
	val firstHalf = "{\"name\"=\"${obj.name}\",\"id\"=\"${obj.id}\","
	val secondHalf = when (obj) {
		is SentSchoolMeta -> "\"periods\"=${JSON.toJson(obj.periods)}}"
		is SentCustomMeta -> "\"type\"=\"${obj.type}\"}"
		else -> throw IllegalArgumentException("No implementation for requisite SentMeta type")
	}
	return firstHalf + secondHalf
}
private fun toJsonArray(objs: List<SentMeta>): String {
	var s = StringBuilder("[")
	for (i in 0..objs.size) {
		if (i != 0) {
			s.append(",")
		}
		s.append(toJson(objs[i]))
	}
	s.append("]")
	return s.toString()
}*/

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
		val cout: PrintWriter = resp.getWriter()
		cout.println(JSON.toJson(sources))
	}	

	protected fun sendSourcesNames(resp: HttpServletResponse) {
		val dataDir: File = retrieveFileObj("data/")
		val dirs: Array<String> = dataDir.list(object : FilenameFilter {
			override fun accept(dir: File, name: String): Boolean = File(dir, name).isDirectory()
		})
		val cout: PrintWriter = resp.getWriter()
		cout.println(JSON.toJson(dirs))
	}


	override fun doGet(req: HttpServletRequest, resp: HttpServletResponse) {
		val target: String = req.getPathInfo().trim('/')
		when (target) {
			"" -> sendSources(resp)
			"names" -> sendSourcesNames(resp)
			else -> resp.getWriter().println("Cannot get ${target}")
		}		
	}
}