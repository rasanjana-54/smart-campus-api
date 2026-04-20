package com.smartcampus;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import javax.ws.rs.ext.ContextResolver;
import javax.ws.rs.ext.Provider;

@Provider
public class JacksonConfiguration implements ContextResolver<ObjectMapper> {
    private final ObjectMapper mapper;

    public JacksonConfiguration() {
        mapper = new ObjectMapper();
        // Register JavaTimeModule if it's on the classpath
        try {
            mapper.registerModule(new JavaTimeModule());
            mapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
        } catch (Throwable t) {
            System.err.println("JSR310 module not found, continuing without it.");
        }
        mapper.configure(SerializationFeature.INDENT_OUTPUT, true);
    }

    @Override
    public ObjectMapper getContext(Class<?> type) {
        return mapper;
    }
}
