<html>
<head><title>Another happy landing</title></head>
<body>
  <h2>You should never see this page. If you do, that means someone messed up.</h2>
  <%
    int num = (int) (3 * Math.random());
    String fault;
    switch (num) {
      case 0: fault = "Jonathan"; break;
      case 1: fault = "Nicolas"; break;
      default: fault = "nginx";
    }
  %>
  <p>We rolled a die to see whom to blame. As such, it is <b><%= fault %>'s</b> fault. </p>
</body>
</html>
