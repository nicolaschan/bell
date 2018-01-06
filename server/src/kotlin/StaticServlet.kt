package com.countdownzone.api

import java.io.*
import javax.servlet.*
import javax.servlet.http.*

class StaticServlet() : CountdownZoneApiServlet() {

    val pages = setOf<String>("/blog", "/classes", "/client-mithril", "/enter", "/index", "/periods", "/settings", "/stats")
    val pagesWithXt = pages.map { it + ".html" }
    val xtUrl = "https://chrome.google.com/webstore/detail/belllahsclub-extension/pkeeekfbjjpdkbijkjfljamglegfaikc"
    var ghUrl = "https://github.com/nicolaschan/bell"
    val redirects = mapOf<String, String>("/xt" to xtUrl, "/extension" to xtUrl, "/gh" to ghUrl)

    override fun doGet(req: HttpServletRequest, resp: HttpServletResponse) {
        val uri = req.getRequestURI()
        var fileToServe: String = "./static" + "/" + when(uri) {
            "/" -> "/index.html"
            in pages -> uri + ".html"
            in pagesWithXt -> uri
            in redirects.keys -> {
                resp.sendRedirect(redirects[uri])
                return
            }
            else -> {
                send404(resp)
                return
            }
        }
        serveFile(fileToServe, resp)
    }

}