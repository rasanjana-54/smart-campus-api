package com.smartcampus.repository;

import com.smartcampus.model.Room;
import com.smartcampus.model.Sensor;
import com.smartcampus.model.SensorReading;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class SmartCampusRepository {
    private static SmartCampusRepository instance;
    
    private Map<String, Room> rooms = new ConcurrentHashMap<>();
    private Map<String, Sensor> sensors = new ConcurrentHashMap<>();
    private Map<String, List<SensorReading>> readings = new ConcurrentHashMap<>();

    private SmartCampusRepository() {
        // Sample data for testing
        Room room1 = new Room("LIB-301", "Library Quiet Study", 50);
        rooms.put(room1.getId(), room1);
        
        Sensor sensor1 = new Sensor("TEMP-001", "Temperature", "ACTIVE", "LIB-301");
        sensors.put(sensor1.getId(), sensor1);
        room1.getSensorIds().add(sensor1.getId());
    }

    public static synchronized SmartCampusRepository getInstance() {
        if (instance == null) {
            instance = new SmartCampusRepository();
        }
        return instance;
    }

    // Room Operations
    public Collection<Room> getAllRooms() { return rooms.values(); }
    public Room getRoom(String id) { 
        if (id == null) return null;
        return rooms.get(id); 
    }
    public void addRoom(Room room) { 
        if (room != null && room.getId() != null) {
            rooms.put(room.getId(), room); 
        }
    }
    public void deleteRoom(String id) { 
        if (id != null) rooms.remove(id); 
    }

    // Sensor Operations
    public Collection<Sensor> getAllSensors() { return sensors.values(); }
    public Sensor getSensor(String id) { return sensors.get(id); }
    public void addSensor(Sensor sensor) { sensors.put(sensor.getId(), sensor); }
    public void deleteSensor(String id) { if (id != null) sensors.remove(id); }

    // Reading Operations
    public List<SensorReading> getReadings(String sensorId) {
        return readings.getOrDefault(sensorId, new ArrayList<>());
    }
    public void addReading(String sensorId, SensorReading reading) {
        readings.computeIfAbsent(sensorId, k -> new ArrayList<>()).add(reading);
    }
}
