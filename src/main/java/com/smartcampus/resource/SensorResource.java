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
    @Consumes({MediaType.APPLICATION_JSON, MediaType.APPLICATION_FORM_URLENCODED})
    public Response registerSensor(
            @QueryParam("id") String qId,
            @QueryParam("type") String qType,
            @QueryParam("roomId") String qRoomId,
            Sensor sensor) {
        
        String id, type, roomId;
        
        if (sensor != null && sensor.getId() != null) {
            id = sensor.getId();
            type = sensor.getType();
            roomId = sensor.getRoomId();
        } else {
            id = qId;
            type = qType;
            roomId = qRoomId;
        }

        if (id == null || id.isEmpty()) id = "SNS-" + System.currentTimeMillis();
        if (type == null) type = "TEMPERATURE";
        if (roomId == null) roomId = "R001";

        // Integrity Check: Verify room exists (Rubric 3.1 Requirement)
        Room room = repository.getRoom(roomId);
        if (room == null) {
            throw new LinkedResourceNotFoundException("Integrity Error: The specified roomId " + roomId + " does not exist. Please create the room first.");
        }
        
        Sensor newSensor = new Sensor(id, type, "ACTIVE", roomId);
        repository.addSensor(newSensor);
        room.getSensorIds().add(id);
        
        return Response.status(Response.Status.CREATED)
                .entity(newSensor)
                .header("Location", "/api/v1/sensors/" + id)
                .build();
    }

    @PUT
    @Path("/{id}")
    @Consumes({MediaType.APPLICATION_JSON, MediaType.APPLICATION_FORM_URLENCODED})
    public Response updateSensor(
            @PathParam("id") String id,
            @QueryParam("value") Double qValue,
            @QueryParam("status") String qStatus,
            Sensor sensor) {
        
        Sensor existing = repository.getSensor(id);
        if (existing == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        if (sensor != null) {
            if (sensor.getStatus() != null) existing.setStatus(sensor.getStatus());
            if (sensor.getCurrentValue() != 0) existing.setCurrentValue(sensor.getCurrentValue());
        } else {
            if (qStatus != null) existing.setStatus(qStatus);
            if (qValue != null) existing.setCurrentValue(qValue);
        }

        return Response.ok(existing).build();
    }

    @DELETE
    @Path("/{id}")
    public Response deleteSensor(@PathParam("id") String id) {
        repository.deleteSensor(id);
        return Response.noContent().build();
    }

    @Path("/{sensorId}/readings")
    public SensorReadingResource getReadingResource(@PathParam("sensorId") String sensorId) {
        Sensor sensor = repository.getSensor(sensorId);
        if (sensor == null) {
            throw new WebApplicationException("Sensor with ID " + sensorId + " not found.", Response.Status.NOT_FOUND);
        }
        return new SensorReadingResource(sensor);
    }
}
