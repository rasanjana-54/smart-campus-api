package com.smartcampus;

import javax.ws.rs.ApplicationPath;
import org.glassfish.jersey.jackson.JacksonFeature;
import org.glassfish.jersey.server.ResourceConfig;

@ApplicationPath("/api/v1")
public class SmartCampusApplication extends ResourceConfig {
    public SmartCampusApplication() {
        // Register Jackson for JSON support
        register(JacksonFeature.class);
        // Scan for resource and provider classes in this package
        packages("com.smartcampus");
    }
}
