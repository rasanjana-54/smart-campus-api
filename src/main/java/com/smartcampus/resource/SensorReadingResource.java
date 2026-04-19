package com.smartcampus.resource;

import com.smartcampus.exception.SensorUnavailableException;
import com.smartcampus.model.Sensor;
import com.smartcampus.model.SensorReading;
import com.smartcampus.repository.SmartCampusRepository;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.List;

public class SensorReadingResource {
    private Sensor sensor;
    private SmartCampusRepository repository = SmartCampusRepository.getInstance();

    public SensorReadingResource(Sensor sensor) {
        this.sensor = sensor;
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<SensorReading> getHistory() {
        return repository.getReadings(sensor.getId());
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response addReading(SensorReading reading) {
        // State Constraint: Cannot accept reading if MAINTENANCE
        if ("MAINTENANCE".equalsIgnoreCase(sensor.getStatus())) {
            throw new SensorUnavailableException("Sensor " + sensor.getId() + " is currently under MAINTENANCE and cannot accept new readings.");
        }
        
        // Add reading
        repository.addReading(sensor.getId(), reading);
        
        // Side Effect: Update sensor's current value
        sensor.setCurrentValue(reading.getValue());
        
        return Response.status(Response.Status.CREATED).entity(reading).build();
    }
}
