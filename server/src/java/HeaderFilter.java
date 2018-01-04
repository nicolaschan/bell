// Taken from https://stackoverflow.com/questions/2876250/tomcat-cache-control/2876899#2876899

package com.countdownzone.server;

import javax.servlet.*;
import javax.servlet.http.*;
import java.io.IOException;

public class HeaderFilter implements Filter {

    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
    		throws IOException, ServletException {
        chain.doFilter(request, response);
        ((HttpServletResponse) response).setHeader("Cache-Control", "max-age=0");
    }

}