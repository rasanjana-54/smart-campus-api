package com.smartcampus.resource;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import java.util.HashMap;
import java.util.Map;

@Path("/")
public class DiscoveryResource {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Map<String, Object> discover() {
        Map<String, Object> discovery = new HashMap<>();
        discovery.put("apiName", "Smart Campus Sensor & Room Management API");
        discovery.put("version", "v1.0-final");
        discovery.put("author", "Rasanjana Nimsara");
        discovery.put("institution", "University of Westminster");
        discovery.put("description", "A RESTful discovery service to manage IoT hardware resources effectively.");
        
        Map<String, Object> links = new HashMap<>();
        links.put("rooms", Map.of("href", "/api/v1/rooms", "methods", "GET, POST"));
        links.put("sensors", Map.of("href", "/api/v1/sensors", "methods", "GET, POST"));
        
        discovery.put("_links", links);
        return discovery;
    }
}
