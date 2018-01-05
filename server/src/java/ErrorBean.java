package com.countdownzone.server;

import java.io.*;
import java.sql.*;
import javax.sql.*;
import javax.servlet.*;
import javax.naming.*;

public class ErrorBean implements Serializable {

    final String PG_INIT_DB = "CREATE TABLE IF NOT EXISTS servererrors (\n"
                            + "id SERIAL,\n"
                            + "class TEXT,\n"
                            + "message TEXT,\n"
                            + "cause TEXT,\n"
                            + "stackTrace TEXT,\n"
                            + "timestamp TIMESTAMP WITH TIME ZONE"
                            + ")";
    final String SQLITE_INIT_DB = "CREATE TABLE IF NOT EXISTS servererrors (\n"
                                + "class,\n"
                                + "message,\n"
                                + "cause,\n"
                                + "stackTrace,\n"
                                + "timestamp DATETIME\n"
                                + ")";
    final String PG_REPORT_ERROR = "INSERT INTO servererrors(class, message, cause, stackTrace, timestamp)\n"
                                 + "VALUES (?, ?, ?, ?, TIMESTAMP 'now')";
    final String SQLITE_REPORT_ERROR = "INSERT INTO servererrors VALUES (?, ?, ?, ?, TIMESTAMP 'now')";

    private String dbURL = "jdbc/bell://";
    private boolean pgEnabled = false;

    public ErrorBean() { }

    private Connection getDbConnection() throws SQLException {
        return DriverManager.getConnection(dbURL);
    }

    // Must be called on server startup, before setUsePg
    public void setDbURL(String url) {
        dbURL = url;
    }

    // Must be called on server startup, after setDbURL
    public void setUsePostgres(boolean usePg) {
        pgEnabled = usePg;
        try (Connection conn = getDbConnection()) {
            PreparedStatement stmt = conn.prepareStatement(pgEnabled ? PG_INIT_DB : SQLITE_INIT_DB);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new IllegalStateException("Error initializing SQL server: " + e.getMessage());
        }
    }

    public void setSentException(Exception exc) {
        try (Connection conn = getDbConnection()) {
            PreparedStatement stmt = conn.prepareStatement(pgEnabled ? PG_REPORT_ERROR : SQLITE_REPORT_ERROR);
            stmt.setString(1, exc.getClass().getCanonicalName());
            stmt.setString(2, exc.getMessage());
            stmt.setString(3, exc.getCause().getClass().getCanonicalName());
            StringWriter sw = new StringWriter();
            exc.printStackTrace(new PrintWriter(sw));
            stmt.setString(4, sw.toString());
        } catch (SQLException e) {
            // out.println("Could not connect to SQL database.");
            // out.println(e.message())
            // return;

        }
      }

}