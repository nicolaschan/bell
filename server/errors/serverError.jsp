<%@ page isErrorPage="true" %>
<!DOCTYPE HTML>
<html>
  <head>
    <%
    String title = "An error occurred";
    if (exception != null) {
      String exceptionType = exception.getClass().getCanonicalName();
      switch (exceptionType) {
        case "java.io.FileNotFoundException":
        case "java.io.IOException":
          title = "File Not Found";
          break;
        case "com.google.gson.JsonSyntaxException":
        case "kotlinx.serialization.SerializationException":
          title = "Error Processing Data";
          break;
      }
    }
    %>
    <title>${title}</title>
    <link rel="stylesheet" href="default.css">
  </head>
  <body>
    <jsp:useBean id="errorBean" class="ErrorBean" scope="request">
      <jsp:setProperty name="errorBean" property="sentException">
        <jsp:attribute name="errorBean">
          exception
        </jsp:attribute>
      </jsp:setProperty>
    </jsp:useBean>
    <hr class="line">
    <p><b>Something went wrong.</b> The error was hopefully logged in our databases so we can fix it.</p>
    <hr class="line"><h3>Apache Tomcat</h3>
  </body>
</html>