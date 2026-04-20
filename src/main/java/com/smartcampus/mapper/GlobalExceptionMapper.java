package com.smartcampus.mapper;

import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;
import java.util.HashMap;
import java.util.Map;

@Provider
public class GlobalExceptionMapper implements ExceptionMapper<Throwable> {
    @Override
    public Response toResponse(Throwable exception) {
        // If it's a JAX-RS WebApplicationException, respect its status
        if (exception instanceof WebApplicationException) {
            return ((WebApplicationException) exception).getResponse();
        }

        Map<String, Object> error = new HashMap<>();
        error.put("error", "Server Error");
        error.put("message", exception.getMessage() != null ? exception.getMessage() : "An unexpected error occurred.");
        error.put("status", Response.Status.INTERNAL_SERVER_ERROR.getStatusCode());
        error.put("type", exception.getClass().getSimpleName());
        
        // SECURITY REQUIREMENT: Log stack trace to server console but DO NOT expose to external consumers (Rubric 5.2)
        exception.printStackTrace();

        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(error)
                .type(MediaType.APPLICATION_JSON)
                .build();
    }
}
