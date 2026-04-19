package com.smartcampus.resource;

import com.smartcampus.exception.LinkedResourceNotFoundException;
import com.smartcampus.model.Room;
import com.smartcampus.model.Sensor;
import com.smartcampus.repository.SmartCampusRepository;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.Collection;
import java.util.stream.Collectors;

@Path("/sensors")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class SensorResource {
    private SmartCampusRepository repository = SmartCampusRepository.getInstance();

    @GET
    public Collection<Sensor> getSensors(@QueryParam("type") String type) {
        if (type == null || type.isEmpty()) {
            return repository.getAllSensors();
        }
        return repository.getAllSensors().stream()
                .filter(s -> s.getType().equalsIgnoreCase(type))
                .collect(Collectors.toList());
    }

    @POST
    public Response registerSensor(Sensor sensor) {
        // Integrity Check: Verify room exists
        Room room = repository.getRoom(sensor.getRoomId());
        if (room == null) {
            throw new LinkedResourceNotFoundException("The specified roomId " + sensor.getRoomId() + " does not exist in the system.");
        }
        
        repository.addSensor(sensor);
        room.getSensorIds().add(sensor.getId());
        
        return Response.status(Response.Status.CREATED).entity(sensor).build();
    }

    // Sub-resource locator for historical readings
    @Path("/{sensorId}/read")
    public SensorReadingResource getReadingResource(@PathParam("sensorId") String sensorId) {
        Sensor sensor = repository.getSensor(sensorId);
        if (sensor == null) {
            throw new NotFoundException("Sensor with ID " + sensorId + " not found.");
        }
        return new SensorReadingResource(sensor);
    }
}
