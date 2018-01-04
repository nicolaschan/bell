package com.countdownzone.analytics

import com.countdownzone.api.CountdownZoneApiServlet
import java.io.*
import javax.servlet.*
import javax.servlet.http.*
import java.sql.*
import java.sql.JDBCType as JDBCType
import javax.sql.*
import javax.naming.*
import java.net.URLDecoder
/*
import kotlinx.serialization.*
import kotlinx.serialization.json.JSON
import kotlinx.serialization.Serializable
*/
import com.google.gson.*
import nl.basjes.parse.useragent.*

private val JSON = Gson()
private fun Gson.stringify(obj: Any?) = JSON.toJson(obj)

data class ReceivedAnalytics(val id: String?, val userAgent: String?, val theme: String?, val source: String?)
data class User(val id: String?, val userAgent: String?, val theme: String?, val source: String?, val ip: String?)
// Unsure how kotlinx.serialization works with inheritance
data class ReceivedError(val error: String?, val id: String?, val userAgent: String?, val theme: String?, val source: String?)
data class Error(val error: String?, val id: String?, val userAgent: String?, val theme: String?, val source: String?, val ip: String?)

data class Success(val success: Boolean)
val successJson = JSON.stringify(Success(true))
data class Fail(val success: Boolean, val msg: String)
private fun getFailJson(msg: String) = JSON.stringify(Fail(false, msg))

// For stats requests
data class BrowserStats(val browser: String?, val count: Int)
data class DeviceStats(val device: String?, val count: Int)
data class OSStats(val os: String?, val count: Int)
data class SourceStats(val source: String?, val count: Int)
data class ThemeStats(val theme: String?, val count: Int)
data class TotalHits(val date: Date, val count: Int)
data class UniqueHits(val date: Date, val count: Int)
data class Stats(val browserStats: List<BrowserStats>,
                 val deviceStats: List<DeviceStats>,
                 val osStats: List<OSStats>,
                 val sourceStats: List<SourceStats>,
                 val themeStats: List<ThemeStats>,
                 val totalHits: List<TotalHits>,
                 val uniqueHits: List<UniqueHits>)
// unused
/*@Serializable data class DBUser(val userId: String,
                                val userAgent: String,
                                val browser: String,
                                val device: String,
                                val os: String,
                                val theme: String,
                                val source: String,
                                val ip: String,
                                val timestamp: Timestamp)*/

private fun convert(obj: ReceivedAnalytics, req: HttpServletRequest): User {
    val forwardedFor = req.getHeader("x-forwarded-for")
    val ip: String = forwardedFor ?: req.getRemoteAddr()
    return User(obj.id, obj.userAgent, obj.theme, obj.source, ip)
}

private fun convert(obj: ReceivedError, req: HttpServletRequest): Error {
    val forwardedFor = req.getHeader("x-forwarded-for")
    val ip: String = forwardedFor ?: req.getRemoteAddr()
    return Error(obj.error, obj.id, obj.userAgent, obj.theme, obj.source, ip)
}

// https://stackoverflow.com/questions/1812891/java-escape-string-to-prevent-sql-injection
// https://stackoverflow.com/questions/4279632/how-to-configure-sqlite-in-tomcat-6

// Uses only pooled connections because those are good
class AnalyticsHandler() : CountdownZoneApiServlet() {

    var dbName = "java:/comp/env/"
    var usePg = false
    val uaa: UserAgentAnalyzer = UserAgentAnalyzer.newBuilder()
            .withField("DeviceName") // device
            .withField("AgentName") // browser
            .withField("OperatingSystemName") // OS
            .build()

    /**
     * A map of query strings that should be used if postgres is enabled.
     */
    val pgQueries = mapOf<String, String>(
        "init-hits" to """CREATE TABLE IF NOT EXISTS hits (
            id SERIAL,
            userId TEXT, 
            userAgent TEXT, 
            browser TEXT, 
            device TEXT, 
            os TEXT, 
            theme TEXT, 
            source TEXT, 
            ip TEXT, 
            timestamp TIMESTAMP WITH TIME ZONE
        )""",

        "init-errs" to """CREATE TABLE IF NOT EXISTS errors (
            id SERIAL,
            userId TEXT, 
            userAgent TEXT, 
            browser TEXT, 
            device TEXT, 
            os TEXT, 
            theme TEXT, 
            source TEXT, 
            ip TEXT,
            error TEXT,
            timestamp TIMESTAMP WITH TIME ZONE
        )""",
        // needed to work around kotlin string templating
        "rec-hit" to """INSERT INTO hits (userId, userAgent, browser, device, os, theme, source, ip, timestamp) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, TIMESTAMP 'now')""",

        "rec-err" to """INSERT INTO errors (userId, userAgent, browser, device, os, theme, source, ip, error, timestamp) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TIMESTAMP 'now')""",

        "browser-stats" to """WITH users_timestamp AS (
                SELECT userId, MAX(timestamp) AS timestamp
                FROM hits GROUP BY userId),
            users AS (
                SELECT hits.userId, hits.userAgent, hits.browser, hits.device, hits.os, hits.theme, hits.source, hits.ip, hits.timestamp
                FROM hits, users_timestamp 
                WHERE hits.userId = users_timestamp.userId AND hits.timestamp = users_timestamp.timestamp
                ORDER BY hits.timestamp
            )
            SELECT browser, COUNT(DISTINCT userId) AS count FROM users GROUP BY browser""",

        "os-stats" to """WITH users_timestamp AS (
                SELECT userId, MAX(timestamp) AS timestamp
                FROM hits GROUP BY userId),
            users AS (
                SELECT hits.userId, hits.userAgent, hits.browser, hits.device, hits.os, hits.theme, hits.source, hits.ip, hits.timestamp
                FROM hits, users_timestamp 
                WHERE hits.userId = users_timestamp.userId AND hits.timestamp = users_timestamp.timestamp
                ORDER BY hits.timestamp
            )
            SELECT os, count(DISTINCT userId) AS count FROM users GROUP BY os""",

        "device-stats" to """WITH users_timestamp AS (
                SELECT userId, MAX(timestamp) AS timestamp
                FROM hits GROUP BY userId),
            users AS (
                SELECT hits.userId, hits.userAgent, hits.browser, hits.device, hits.os, hits.theme, hits.source, hits.ip, hits.timestamp
                FROM hits, users_timestamp 
                WHERE hits.userId = users_timestamp.userId AND hits.timestamp = users_timestamp.timestamp
                ORDER BY hits.timestamp
            )
            SELECT device, count(DISTINCT userId) AS count FROM users GROUP BY device""",

        "theme-stats" to """WITH users_timestamp AS (
                SELECT userId, MAX(timestamp) AS timestamp
                FROM hits GROUP BY userId),
            users AS (
                SELECT hits.userId, hits.userAgent, hits.browser, hits.device, hits.os, hits.theme, hits.source, hits.ip, hits.timestamp
                FROM hits, users_timestamp 
                WHERE hits.userId = users_timestamp.userId AND hits.timestamp = users_timestamp.timestamp
                ORDER BY hits.timestamp
            )
            SELECT theme, count(DISTINCT userId) AS count FROM users GROUP BY theme""",

        "source-stats" to """WITH users_timestamp AS (
                SELECT userId, MAX(timestamp) AS timestamp
                FROM hits GROUP BY userId),
            users AS (
                SELECT hits.userId, hits.userAgent, hits.browser, hits.device, hits.os, hits.theme, hits.source, hits.ip, hits.timestamp
                FROM hits, users_timestamp 
                WHERE hits.userId = users_timestamp.userId AND hits.timestamp = users_timestamp.timestamp
                ORDER BY hits.timestamp
            )
            SELECT source, count(DISTINCT user) AS count FROM users GROUP BY source""",

        "users" to """WITH users_timestamp AS (
                SELECT userId, MAX(timestamp) AS timestamp
                FROM hits GROUP BY userId),
            users AS (
                SELECT hits.userId, hits.userAgent, hits.browser, hits.device, hits.os, hits.theme, hits.source, hits.ip, hits.timestamp
                FROM hits, users_timestamp 
                WHERE hits.userId = users_timestamp.userId AND hits.timestamp = users_timestamp.timestamp
                ORDER BY hits.timestamp
            )
            SELECT * FROM users""",

        "total-daily-hits" to """SELECT timestamp::date AS date, count(*) AS count 
            FROM hits GROUP BY date""",

        "unique-daily-hits" to """SELECT timestamp::date AS date, count(DISTINCT userId) AS count 
            FROM hits GROUP BY date"""
        )


    /**
     * A map of query strings that should be used if 
     */
    val sqliteQueries = mapOf<String, String>(
        "init-hits" to """CREATE TABLE IF NOT EXISTS hits (user, userAgent, browser, device, os, theme, source, ip, timestamp DATETIME)""",
        "init-errs" to """CREATE TABLE IF NOT EXISTS errors (user, userAgent, browser, device, os, theme, source, ip, error, timestamp DATETIME)""",
        "rec-err" to """INSERT INTO errors VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"))""",
        "rec-hit" to """INSERT INTO hits VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime("now"))""",
        "browser-stats" to """WITH users AS (SELECT user, userAgent, browser, device, os, theme, source, ip, timestamp FROM hits GROUP BY user HAVING timestamp = MAX(timestamp)) SELECT browser, count(DISTINCT user) AS count FROM users GROUP BY browser""",
        "os-stats" to """WITH users AS (SELECT user, userAgent, browser, device, os, theme, source, ip, timestamp FROM hits GROUP BY user HAVING timestamp = MAX(timestamp)) SELECT os, count(DISTINCT user) AS count FROM users GROUP BY os""",
        "device-stats" to """WITH users AS (SELECT user, userAgent, browser, device, os, theme, source, ip, timestamp FROM hits GROUP BY user HAVING timestamp = MAX(timestamp)) SELECT device, count(DISTINCT user) AS count FROM users GROUP BY device""",
        "theme-stats" to """WITH users AS (SELECT user, userAgent, browser, device, os, theme, source, ip, timestamp FROM hits GROUP BY user HAVING timestamp = MAX(timestamp)) SELECT theme, count(DISTINCT user) AS count FROM users GROUP BY theme""",
        "source-stats" to """WITH users AS (SELECT user, userAgent, browser, device, os, theme, source, ip, timestamp FROM hits GROUP BY user HAVING timestamp = MAX(timestamp)) SELECT source, count(DISTINCT user) AS count FROM users GROUP BY source""",
        "users" to """SELECT user, userAgent, browser, device, os, theme, source, ip, timestamp FROM hits GROUP BY user HAVING timestamp = MAX(timestamp)""",
        "total-daily-hits" to """SELECT DATE(timestamp, "localtime") AS date, count(*) AS count FROM hits GROUP BY date""",
        "unique-daily-hits" to """SELECT DATE(timestamp, "localtime") AS date, count(DISTINCT user) AS count FROM hits GROUP BY date"""
        )

    var queries: Map<String, String> = sqliteQueries

    init {
        for (k in pgQueries.keys) {
            if (k !in sqliteQueries.keys) {
                throw IllegalStateException("Query for $k found in pgQueries but not sqliteQueries")
            }
        }
        for (k in sqliteQueries.keys) {
            if (k !in pgQueries.keys) {
                throw IllegalStateException("Query for $k found in sqliteQueries but not pgQueries")
            }
        }
    }

    override fun init() {
        val initDbName = getInitParameter("db-name")
        if (initDbName != null) {
            dbName += initDbName
        }
        val initUsePg = getInitParameter("pg-enabled")
        usePg = initUsePg != null && initUsePg == "true"
        if (usePg) {
            queries = pgQueries
        }
        val conn = getDbConnection()
        conn.use {
            val stmt: Statement = it.createStatement()
            stmt.addBatch(queries["init-hits"])
            stmt.addBatch(queries["init-errs"])
            stmt.executeBatch()
        }
    }

    private fun getDbConnection(): Connection {
        val ctx: Context = InitialContext()
        val ds: DataSource = ctx.lookup(dbName) as DataSource
        return ds.getConnection()
    }

    // Closes connection after
    private fun dbQuery(queryString: String, params: Array<Pair<Any?, String>> = arrayOf()): ResultSet {
        val conn = getDbConnection()
        conn.use {
            return dbQuery(conn, queryString, params)
        }
    }

    // Someday, we will need to rigorously know the type of our information. That day is not today.
    // Also, jdbc is 1-indexed

    // Does not close connection
    // TODO fix type signature to account for situatoin with multiple values that are the same
    private fun dbQuery(conn: Connection, queryString: String, params: Array<Pair<Any?, String>> = arrayOf()): ResultSet {
        val stmt: PreparedStatement = conn.prepareStatement(queryString)
        for (i in params.indices) {
            val (value, type) = params[i]
            if (value == null) {
                val typeStr = when (type) {
                    "int" -> "INTEGER"
                    "string" -> if (usePg) "LONGVARCHAR" else "VARCHAR"
                    else -> type
                }
                stmt.setNull(i + 1, JDBCType.valueOf(typeStr).ordinal)
            } else {
                when (type) {
                    "int" -> stmt.setInt(i + 1, value as Int)
                    "string" -> stmt.setString(i + 1, value as String)
                    "timestamp" -> stmt.setTimestamp(i + 1, value as Timestamp)
                    else -> stmt.setString(i + 1, value.toString())
                }
            }
        }
        return stmt.executeQuery()
    }

    // The inclusion of having an array of types is unfortunate, but a necessary hack for now
    private fun dbUpdate(updateString: String, params: Array<Pair<Any?, String>> = arrayOf()) {
        val conn = getDbConnection()
        conn.use {
            val stmt: PreparedStatement = conn.prepareStatement(updateString)
            for (i in params.indices) {
                val (value, type) = params[i]
                if (value == null) {
                    val typeStr = when (type) {
                        "int" -> "INTEGER"
                        "string" -> if (usePg) "LONGVARCHAR" else "VARCHAR"
                        else -> type
                    }
                    stmt.setNull(i + 1, JDBCType.valueOf(typeStr).ordinal)
                } else {
                    when (type) {
                        "int" -> stmt.setInt(i + 1, value as Int)
                        "string" -> stmt.setString(i + 1, value as String)
                        "timestamp" -> stmt.setTimestamp(i + 1, value as Timestamp)
                        else -> stmt.setString(i + 1, value.toString())
                    }
                }
            }
            stmt.executeUpdate()
        }
    }

    override fun doGet(req: HttpServletRequest, resp: HttpServletResponse) {
        val uri = req.getRequestURI().trim('/')
        when (uri) {
            "api/stats" -> sendStats(resp)
            else -> send404(resp)
        }
    }

    private val postableNames = arrayOf<String>("api/analytics", "api/errors")
    override fun doPost(req: HttpServletRequest, resp: HttpServletResponse) {
        val uri = req.getRequestURI().trim('/')
        when (uri) {
            "api/analytics" -> recordHit(req, resp)
            "api/errors" -> recordError(req, resp)
            else -> send404(resp)
        }
    }

    // URL encoding means we hopefully don't need to do sanitizing
    // https://stackoverflow.com/questions/29381446/convert-parse-url-parameteres-to-json-in-java
    private fun reqBodyToJson(req: HttpServletRequest): String {
        var paramIn: String = req.getReader().use { it.readText() }
        paramIn = paramIn.replace("=", "\":\"").replace("&", "\",\"")
        return URLDecoder.decode("{\"" + paramIn + "\"}", req.getCharacterEncoding())
    }

    fun recordHit(req: HttpServletRequest, resp: HttpServletResponse) {
        val reqJson = reqBodyToJson(req)
        var succeeded: Boolean
        var errMsg = ""
        try {
            val user: User = convert(JSON.fromJson(reqJson, ReceivedAnalytics::class.java), req)
            val userAgent: UserAgent = uaa.parse(user.userAgent)
            val device = userAgent.get("DeviceName").getValue()
            val browser = userAgent.get("AgentName").getValue()
            val os = userAgent.get("OperatingSystemName").getValue()
            dbUpdate(queries["rec-hit"]!!, arrayOf<Pair<Any?, String>>(
                user.id to "string",
                user.userAgent to "string",
                browser to "string",
                device to "string",
                os to "string",
                user.theme to "string",
                user.source to "string",
                user.ip to "string"
                ))
            succeeded = true
        }
        catch (e: JsonSyntaxException) {
            succeeded = false
            errMsg = e.message ?: "Error in JSON parsing"
        } catch(e: SQLException) {
            succeeded = false
            errMsg = e.message ?: "Error in SQL query"
            throw e
        }
        resp.setContentType("application/json")
        val cout: PrintWriter = resp.getWriter()
        cout.println(if (succeeded) successJson else getFailJson(errMsg))
    }

    fun recordError(req: HttpServletRequest, resp: HttpServletResponse) {
        var reqJson = reqBodyToJson(req)
        var succeeded: Boolean
        var errMsg = ""
        try {
            val user: Error = convert(JSON.fromJson(reqJson, ReceivedError::class.java), req)
            val userAgent: UserAgent = uaa.parse(user.userAgent)
            val device = userAgent.get("DeviceName").getValue()
            val browser = userAgent.get("AgentName").getValue()
            val os = userAgent.get("OperatingSystemName").getValue()
            dbUpdate(queries["rec-err"]!!, arrayOf<Pair<Any?, String>>(
                user.id to "string",
                user.userAgent to "string",
                browser to "string",
                device to "string",
                os to "string",
                user.theme to "string",
                user.source to "string",
                user.ip to "string",
                user.error to "string"
                ))
            succeeded = true
        }
        catch (e: JsonSyntaxException) {
            succeeded = false
            errMsg = e.message ?: "Error in JSON parsing"
        } catch(e: SQLException) {
            succeeded = false
            errMsg = e.message ?: "Error in SQL query"
        }
        resp.setContentType("application/json")
        val cout: PrintWriter = resp.getWriter()
        cout.println(if (succeeded) successJson else getFailJson(errMsg))
    }

    fun getBrowserStats(conn: Connection): List<BrowserStats> {
        val rs = dbQuery(conn, queries["browser-stats"]!!)
        val lst = mutableListOf<BrowserStats>()
        while (rs.next()) {
            lst.add(BrowserStats(rs.getString("browser"), rs.getInt("count")))
        }
        return lst
    }

    fun getOSStats(conn: Connection): List<OSStats> {
        val rs = dbQuery(conn, queries["os-stats"]!!)
        val lst = mutableListOf<OSStats>()
        while (rs.next()) {
            lst.add(OSStats(rs.getString("os"), rs.getInt("count")))
        }
        return lst
    }

    fun getDeviceStats(conn: Connection): List<DeviceStats> {
        val rs = dbQuery(conn, queries["device-stats"]!!)
        val lst = mutableListOf<DeviceStats>()
        while (rs.next()) {
            lst.add(DeviceStats(rs.getString("device"), rs.getInt("count")))
        }
        return lst
    }

    fun getThemeStats(conn: Connection): List<ThemeStats> {
        val rs = dbQuery(conn, queries["theme-stats"]!!)
        val lst = mutableListOf<ThemeStats>()
        while (rs.next()) {
            lst.add(ThemeStats(rs.getString("theme"), rs.getInt("count")))
        }
        return lst
    }

    fun getSourceStats(conn: Connection): List<SourceStats> {
        val rs = dbQuery(conn, queries["source-stats"]!!)
        val lst = mutableListOf<SourceStats>()
        while (rs.next()) {
            lst.add(SourceStats(rs.getString("source"), rs.getInt("count")))
        }
        return lst
    }

    //fun getUsers() { dbQuery(queries["users"]) }

    fun getTotalDailyHits(conn: Connection): List<TotalHits> {
        val rs = dbQuery(conn, queries["total-daily-hits"]!!)
        val lst = mutableListOf<TotalHits>()
        while (rs.next()) {
            lst.add(TotalHits(rs.getDate("date"), rs.getInt("count")))
        }
        return lst
    }

    fun getUniqueDailyHits(conn: Connection): List<UniqueHits> {
        val rs = dbQuery(conn, queries["unique-daily-hits"]!!)
        val lst = mutableListOf<UniqueHits>()
        while (rs.next()) {
            lst.add(UniqueHits(rs.getDate("date"), rs.getInt("count")))
        }
        return lst
    }

    fun sendStats(resp: HttpServletResponse) {
        val conn = getDbConnection()
        conn.use {
            val stats = Stats(getBrowserStats(conn),
                              getDeviceStats(conn),
                              getOSStats(conn),
                              getSourceStats(conn),
                              getThemeStats(conn),
                              getTotalDailyHits(conn),
                              getUniqueDailyHits(conn))
            val cout: PrintWriter = resp.getWriter()
            cout.println(JSON.stringify(stats))
        }
    }

}
