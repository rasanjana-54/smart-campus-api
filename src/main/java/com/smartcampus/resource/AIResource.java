package com.smartcampus.resource;

import com.smartcampus.model.Sensor;
import com.smartcampus.repository.SmartCampusRepository;
import com.smartcampus.service.GeminiService;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.HashMap;
import java.util.Map;

@Path("/ai")
@Produces(MediaType.APPLICATION_JSON)
public class AIResource {
    private SmartCampusRepository repository = SmartCampusRepository.getInstance();
    private GeminiService geminiService = new GeminiService();

    @GET
    @Path("/analyze/{sensorId}")
    public Response analyzeSensor(@PathParam("sensorId") String sensorId) {
        Sensor sensor = repository.getSensor(sensorId);
        if (sensor == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        String readings = "Current Value: " + sensor.getCurrentValue();
        String analysis = geminiService.analyzeSensorData(sensor.getType(), readings);

        Map<String, Object> response = new HashMap<>();
        response.put("sensorId", sensorId);
        response.put("type", sensor.getType());
        response.put("aiInsights", analysis);
        response.put("status", "Powered by Gemini 1.5 Flash");

        return Response.ok(response).build();
    }
}
