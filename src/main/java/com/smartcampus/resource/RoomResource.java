package com.smartcampus.resource;

import com.smartcampus.exception.RoomNotEmptyException;
import com.smartcampus.model.Room;
import com.smartcampus.repository.SmartCampusRepository;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.Collection;

@Path("/rooms")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RoomResource {
    private SmartCampusRepository repository = SmartCampusRepository.getInstance();

    @GET
    public Collection<Room> getAllRooms() {
        return repository.getAllRooms();
    }

    @POST
    @Consumes({MediaType.APPLICATION_JSON, MediaType.APPLICATION_FORM_URLENCODED})
    public Response createRoom(
            @QueryParam("id") String qId,
            @QueryParam("name") String qName,
            @QueryParam("capacity") @DefaultValue("0") int qCapacity,
            Room room) {

        String id, name;
        int capacity;

        // Fallback logic: If JSON body is missing, check Query Parameters
        if (room != null && room.getId() != null) {
            id = room.getId();
            name = room.getName();
            capacity = room.getCapacity();
        } else {
            id = qId;
            name = qName;
            capacity = qCapacity;
        }

        // Ultimate Fallback: If everything is null, set default values
        if (id == null || id.isEmpty()) id = "ROOM-" + System.currentTimeMillis();
        if (name == null || name.isEmpty()) name = "Auto Generated Room";
        if (capacity <= 0) capacity = 10;

        Room newRoom = new Room(id, name, capacity);
        if (repository.getRoom(id) != null) {
            return Response.status(Response.Status.CONFLICT)
                    .entity("Room with ID " + id + " already exists.")
                    .build();
        }

        repository.addRoom(newRoom);
        return Response.status(Response.Status.CREATED)
                .entity(newRoom)
                .header("Location", "/api/v1/rooms/" + id)
                .build();
    }

    @GET
    @Path("/{roomId}")
    public Response getRoom(@PathParam("roomId") String roomId) {
        if (roomId == null || roomId.trim().isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Room ID is required").build();
        }
        Room room = repository.getRoom(roomId);
        if (room == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(room).build();
    }

    @DELETE
    @Path("/{roomId}")
    public Response deleteRoom(@PathParam("roomId") String roomId) {
        Room room = repository.getRoom(roomId);
        if (room == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        // Business Logic Constraint: Cannot delete if has sensors
        if (!room.getSensorIds().isEmpty()) {
            throw new RoomNotEmptyException("Cannot delete room " + roomId + ". It is currently occupied by active hardware sensors.");
        }

        repository.deleteRoom(roomId);
        return Response.noContent().build();
    }
}
