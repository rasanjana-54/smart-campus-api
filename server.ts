import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';

const app = express();
app.use(express.json());

// In-memory data store mimicking the Java repository
const rooms = new Map<string, any>([
    ["LIB-301", { id: "LIB-301", name: "Library Quiet Study", capacity: 50, sensorIds: ["TEMP-001"] }]
]);
const sensors = new Map<string, any>([
    ["TEMP-001", { id: "TEMP-001", type: "Temperature", status: "ACTIVE", currentValue: 22.5, roomId: "LIB-301" }]
]);
const readings = new Map<string, any[]>([
    ["TEMP-001", [{ id: "read-init", timestamp: Date.now(), value: 22.5 }]]
]);

// Discovery
app.get('/api/v1', (req, res) => {
    res.json({
        version: "1.0.0",
        contact: "admin@smartcampus.westminster.ac.uk",
        resources: {
            rooms: "/api/v1/rooms",
            sensors: "/api/v1/sensors"
        }
    });
});

// Rooms
app.get('/api/v1/rooms', (req, res) => {
    res.json(Array.from(rooms.values()));
});

app.post('/api/v1/rooms', (req, res) => {
    const room = req.body;
    if (rooms.has(room.id)) {
        return res.status(409).json({ error: "Conflict", message: `Room with ID ${room.id} already exists.` });
    }
    room.sensorIds = [];
    rooms.set(room.id, room);
    res.status(201).json(room);
});

app.get('/api/v1/rooms/:roomId', (req, res) => {
    const room = rooms.get(req.params.roomId);
    if (!room) return res.status(404).json({ error: "Not Found" });
    res.json(room);
});

app.delete('/api/v1/rooms/:roomId', (req, res) => {
    const room = rooms.get(req.params.roomId);
    if (!room) return res.status(404).json({ error: "Not Found" });
    
    if (room.sensorIds.length > 0) {
        return res.status(409).json({ 
            error: "Room Conflict", 
            message: `Cannot delete room ${req.params.roomId}. It is currently occupied by active hardware sensors.`,
            status: "409"
        });
    }
    
    rooms.delete(req.params.roomId);
    res.status(204).send();
});

// Sensors
app.get('/api/v1/sensors', (req, res) => {
    const type = req.query.type as string;
    let list = Array.from(sensors.values());
    if (type) {
        list = list.filter(s => s.type.toLowerCase() === type.toLowerCase());
    }
    res.json(list);
});

app.post('/api/v1/sensors', (req, res) => {
    const sensor = req.body;
    const room = rooms.get(sensor.roomId);
    if (!room) {
        return res.status(422).json({ 
            error: "Unprocessable Entity", 
            message: `The specified roomId ${sensor.roomId} does not exist in the system.`,
            status: "422"
        });
    }
    
    sensors.set(sensor.id, sensor);
    room.sensorIds.push(sensor.id);
    res.status(201).json(sensor);
});

// Readings
app.get('/api/v1/sensors/:sensorId/read', (req, res) => {
    const sensor = sensors.get(req.params.sensorId);
    if (!sensor) return res.status(404).json({ error: "Not Found" });
    res.json(readings.get(req.params.sensorId) || []);
});

app.post('/api/v1/sensors/:sensorId/read', (req, res) => {
    const sensor = sensors.get(req.params.sensorId);
    if (!sensor) return res.status(404).json({ error: "Not Found" });
    
    if (sensor.status?.toUpperCase() === 'MAINTENANCE') {
        return res.status(403).json({
            error: "Forbidden",
            message: `Sensor ${req.params.sensorId} is currently under MAINTENANCE and cannot accept new readings.`,
            status: "403"
        });
    }
    
    const reading = req.body;
    const history = readings.get(req.params.sensorId) || [];
    history.push(reading);
    readings.set(req.params.sensorId, history);
    
    sensor.currentValue = reading.value;
    
    res.status(201).json(reading);
});

// Vite Middleware
async function startServer() {
    if (process.env.NODE_ENV !== 'production') {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa'
        });
        app.use(vite.middlewares);
    } else {
        const distPath = path.join(process.cwd(), 'dist');
        app.use(express.static(distPath));
        app.get('*', (req, res) => {
            res.sendFile(path.join(distPath, 'index.html'));
        });
    }

    app.listen(3000, '0.0.0.0', () => {
        console.log('API Server running on http://localhost:3000');
    });
}

startServer();
