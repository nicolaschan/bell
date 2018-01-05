#!/usr/local/bin/python3

"""This script generates the web.xml file, to be placed in web/WEB-INF.
This script also makes the language strip on the github repository more colorful.

Usage: ./build_webxml.py
"""

import json
import os

config = {}
with open("../config.json", 'r') as config_file:
    config = json.load(config_file)

pg = config["postgres"]
if all([pg, pg["enabled"], pg["host"]]):
    DB_URL = ("jdbc:postgresql://" + pg["host"] + ":" + str(pg.get("port", 5432))
            + "/" + config.get("database", "bell"))
else:
    DB_URL = "jdbc:sqlite:/{0}/analytics.sqlite".format(os.environ["CATALINA_HOME"])

DB_NAME="jdbc/" + config.get("database", "bell")
USE_POSTGRES = bool(config["postgres"] and config["postgres"]["enabled"])

def build_web_xml():
    with open("web/WEB-INF/web.xml", 'w') as web_xml, open("web/META-INF/context.xml", 'w') as ctx_xml:
        def line(txt, ind_level):
            web_xml.write(" " * (4 * ind_level) + txt + "\n")
        def cline(txt, ind_level):
            ctx_xml.write(" " * (4 * ind_level) + txt + "\n")

        def make_servlet(name, clazz, level):
            line("<servlet>", level)
            line("<servlet-name>{0}</servlet-name>".format(name), level + 1)
            line("<servlet-class>{0}</servlet-class>".format(clazz), level + 1)
            line("</servlet>\n", level)

        mapped = {}
        def make_mapping(mapping, pattern, level):            
            line("<servlet-mapping>", level)
            line("<servlet-name>{0}</servlet-name>".format(mapping), level + 1)
            if isinstance(pattern, set) or isinstance(pattern, list):
                for p in pattern:
                    assert p not in mapped, "Cannot map {0} twice".format(p)
                    line("<url-pattern>{0}</url-pattern>".format(p), level + 1)
            else:
                assert pattern not in mapped, "Cannot map {0} twice".format(pattern)
                line("<url-pattern>{0}</url-pattern>".format(pattern), level + 1)
            line("</servlet-mapping>\n", level)

        api_names = ["stats", "sources", "version", "message", "uuid", "time",
                     "errors", "themes"]

        def generate_servlet_names():
            lvl = 1
            line("<!-- Static views and redirects -->", lvl)
            make_servlet("static", "com.countdownzone.api.StaticServlet", lvl)
            line("<!-- Static resources -->", lvl)
            make_servlet("resources", "com.countdownzone.api.ResourceServlet", lvl)
            line("<!-- API servlets -->", lvl)
            make_servlet("api-general", "com.countdownzone.api.APIGeneralServlet", lvl)
            make_servlet("api-sources", "com.countdownzone.api.APISourcesServlet", lvl)
            line("<!-- Analytics servlets -->", lvl)
            web_xml.write("""
    <servlet>
        <servlet-name>analytics</servlet-name>
        <servlet-class>com.countdownzone.analytics.AnalyticsHandler</servlet-class>
        <load-on-startup>1</load-on-startup>
    </servlet>
""")
            line("<!-- Data servlet -->", lvl)
            make_servlet("data", "com.countdownzone.api.DataServlet", lvl)
            line("<!-- Timesync servlet -->", lvl)
            make_servlet("timesync", "com.countdownzone.timesync.TimesyncServlet", lvl)


        static_links = ["", "/", "/m", "/periods", "/classes", "/enter", "/settings", "/blog",
                        "/xt", "/extension", "/gh", "/stats"]
        resources = ["/favicons", "/bin", "/css", "/img", "/icons", "/fonts"]
        analytics = ["/api/analytics", "/api/errors", "/api/stats"]
        def generate_servlet_mappings():
            lvl = 1
            line("<!-- Mappings for static views -->", lvl)
            make_mapping("static", static_links, lvl)
            line("<!-- Mappings for static resources -->", lvl)
            make_mapping("resources", [x + "/*" for x in resources], lvl)
            line("<!-- Mappings for /api requests -->", lvl)
            make_mapping("api-general", "/api/*", lvl)
            make_mapping("api-sources", "/api/sources/*", lvl)
            line("<!-- Mapping for /api/data requests -->", lvl)
            make_mapping("data", "/api/data/*", lvl)
            line("<!-- Mapping for analytics requests -->", lvl)
            make_mapping("analytics", analytics, lvl)
            line("<!-- Mapping for timesync servlet -->", lvl)
            make_mapping("timesync", "/timesync/*", lvl)

        def make_filters_with_mapping():
            lvl = 1
            line("<filter>", lvl)
            line("<filter-name>cache-control</filter-name>", lvl + 1)
            line("<filter-class>com.countdownzone.server.HeaderFilter</filter-class>", lvl+1)
            line("</filter>", lvl)
            line("<filter-mapping>", lvl)
            line("<filter-name>cache-control</filter-name>", lvl+1)
            line("<url-pattern>/*</url-pattern>", lvl)
            line("</filter-mapping>", lvl)

        # has side effect of writing to context.xml
        def build_jdbc():
            if USE_POSTGRES:
                ctx = """
<Context>
    <Resource name="{0}"
              auth="Container"
              type="javax.sql.DataSource"
              driverClassName="org.postgresql.Driver"
              factory="org.apache.tomcat.dbcp.dbcp2.BasicDataSourceFactory"
"""
                def prop(name, value):
                    nonlocal ctx
                    ctx += "\n              " + name + "=\"" + value + "\""
                pg = config["postgres"]
                if pg:
                    if pg["host"]:
                        prop("url", DB_URL)
                    if pg["user"]:
                        prop("username", pg["user"])
                    if pg["password"]:
                        prop("password", pg["password"])
                ctx += "/>\n"
                ctx_xml.write(ctx.format(DB_NAME))
            else:
                ctx = """
<Context>  
    <Resource name="{0}" 
              auth="Container" 
              type="javax.sql.DataSource" 
              driverClassName="org.sqlite.JDBC"
              url="{1}"
              factory="org.apache.tomcat.dbcp.dbcp2.BasicDataSourceFactory">
    </Resource>
"""
                ctx_xml.write(ctx.format(DB_NAME, DB_URL))
            ctx_xml.write("""<Resource name="bean/ErrorBean" auth="Container"
    type="com.countdownzone.server.ErrorBean"
    factory="org.apache.naming.factory.BeanFactory"
    dbURL="{0}"
    usePostgres="{1}"/>)""".format(DB_URL, str(USE_POSTGRES).lower()))
            web = """
    <resource-ref>
        <description>Analytics database</description>
        <res-ref-name>{0}</res-ref-name>
        <res-type>javax.sql.DataSource</res-type>
        <res-auth>Container</res-auth>
    </resource-ref>
    <resource-env-ref>
        <description>Object factory for ErrorBean instances</description>
        <resource-env-ref-name>
            bean/ErrorBean
        </resource-env-ref-name>
        <resource-env-ref-type>
            com.countdownzone.server.ErrorBean
        </resource-env-ref-type>
    </resource-env-ref>
"""
            web_xml.write(web.format(DB_NAME))

        def make_http_error_tag(code, file, lvl):
            line("<error-page>", lvl)
            line("<error-code>{0}</error-code>".format(str(code)), lvl + 1)
            line("<location>{0}</location>".format("/errors/" + str(file)), lvl + 1)
            line("</error-page>\n", lvl)

        def make_java_error_tag(exception_type, file, lvl):
            line("<error-page>", lvl)
            line("<exception-type>{0}</exception-type>".format(exception_type), lvl + 1)
            line("<location>{0}</location>".format("/errors/" + str(file)), lvl + 1)
            line("</error-page>\n", lvl)

        def generate_error_tags():
            lvl = 1
            line("<!-- Responses to error codes -->", lvl)
            make_http_error_tag(404, "error404.jsp", lvl)
            make_http_error_tag(418, "teapot.jsp", lvl)
            make_java_error_tag("java.lang.Exception", "serverError.jsp", lvl)

        web_xml.write(
"""
<!DOCTYPE web-app>
<web-app>
    <display-name>countdown.zone</display-name>
    <description>
        A bell timer.
    </description>
    <context-param>
        <param-name>db-name</param-name>
        <param-value>{0}</param-value>
    </context-param>
    <context-param>
        <param-name>pg-enabled</param-name>
        <param-value>{1}</param-value>
    </context-param>
""".format(DB_NAME, str(USE_POSTGRES).lower()))
        generate_error_tags()
        generate_servlet_names()
        generate_servlet_mappings()
        make_filters_with_mapping()
        build_jdbc()
        line("</web-app>", 0)
        cline("</Context>", 0)

build_web_xml()