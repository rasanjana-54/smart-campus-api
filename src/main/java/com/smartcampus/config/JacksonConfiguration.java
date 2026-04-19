package com.smartcampus.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import javax.ws.rs.ext.ContextResolver;
import javax.ws.rs.ext.Provider;

@Provider
public class JacksonConfiguration implements ContextResolver<ObjectMapper> {
    private final ObjectMapper mapper;

    public JacksonConfiguration() {
        mapper = new ObjectMapper();
        mapper.enable(SerializationFeature.INDENT_OUTPUT); // Pretty print JSON
    }

    @Override
    public ObjectMapper getContext(Class<?> type) {
        return mapper;
    }
}
