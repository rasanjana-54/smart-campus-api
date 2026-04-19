# Smart Campus Sensor & Room Management API (University Project)

This repository contains the JAX-RS implementation of the "Smart Campus" backend infrastructure, designed to manage rooms, sensors, and environmental data for university facilities.

## API Design Overview

The API follows strict RESTful principles, utilizing hierarchical resource structures and standard HTTP methods.

- **Discovery**: `GET /api/v1` provides metadata and entry points.
- **Rooms**: Collection-based management of campus spaces.
- **Sensors**: Registered devices linked to specific rooms.
- **Readings**: Nested historical data accessible via sensor context.
- **Error Handling**: Custom `ExceptionMapper` classes ensure "leak-proof" error responses with meaningful JSON bodies and appropriate HTTP status codes (403, 409, 422, 500).

## Project Structure

```text
com.smartcampus
├── config         # Jackson & JAX-RS Configuration
├── exception      # Custom Business Exceptions
├── filter         # Container Request/Response Logging
├── mapper         # Exception to HTTP Response Mappers
├── model          # POJO Resource Models
├── repository     # In-memory Thread-safe Data Storage
└── resource       # REST Resource Classes & Path Mapping
```

## Build & Launch Instructions

### Prerequisites
- JDK 11 or higher
- Apache Maven 3.6+

### Execution Steps
1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd SmartCampusAPI
   ```
2. **Build the project**:
   ```bash
   mvn clean install
   ```
3. **Run the server** (using a container like Tomcat or Jetty, or through Maven):
   ```bash
   mvn jetty:run
   ```
   *The API will be available at `http://localhost:8080/SmartCampusAPI/api/v1`*

## Sample CURL Commands

1. **Discovery Endpoint**:
   ```bash
   curl -X GET http://localhost:8080/SmartCampusAPI/api/v1
   ```

2. **Create a New Room**:
   ```bash
   curl -X POST http://localhost:8080/SmartCampusAPI/api/v1/rooms \
   -H "Content-Type: application/json" \
   -d '{"id": "LIB-301", "name": "Library Quiet Study", "capacity": 50}'
   ```

3. **Register a Sensor** (Error 422 if room doesn't exist):
   ```bash
   curl -X POST http://localhost:8080/SmartCampusAPI/api/v1/sensors \
   -H "Content-Type: application/json" \
   -d '{"id": "TEMP-001", "type": "Temperature", "status": "ACTIVE", "roomId": "LIB-301"}'
   ```

4. **Add a Reading** (Error 403 if sensor is in MAINTENANCE):
   ```bash
   curl -X POST http://localhost:8080/SmartCampusAPI/api/v1/sensors/TEMP-001/read \
   -H "Content-Type: application/json" \
   -d '{"id": "read-99", "timestamp": 1713500000, "value": 22.5}'
   ```

5. **Attempt to Delete Room with Active Sensors** (Error 409):
   ```bash
   curl -X DELETE http://localhost:8080/SmartCampusAPI/api/v1/rooms/LIB-301
   ```

---

## Conceptual Report & Questions

### Part 1: Service Architecture & Setup
**Q: Explain the default lifecycle of a JAX-RS Resource class. Is a new instance instantiated for every incoming request, or does the runtime treat it as a singleton?**
**A:** The default lifecycle is **per-request**. A new instance is created for every incoming HTTP request and destroyed after the response is sent. This ensures request isolation and thread safety at the resource level. In this implementation, the data is stored in a Singleton `SmartCampusRepository` using `ConcurrentHashMap` to ensure that state is persisted across these per-request instances without race conditions.

### Part 1.2: The "Discovery" Endpoint
**Q: Why is the provision of ”Hypermedia” (links and navigation within responses) considered a hallmark of advanced RESTful design (HATEOAS)?**
**A:** Hypermedia (HATEOAS) makes the API self-discoverable. It decouples the client from hardcoded URLs, allowing the server to evolve its path structure without breaking clients. Developers benefit from lower entry barriers as they can navigate the API programmatically via links rather than relying solely on static documentation.

### Part 2: Room Management
**Q: When returning a list of rooms, what are the implications of returning only IDs versus returning the full room objects?**
**A:** Returning only IDs saves significant network bandwidth and processing time for small payloads. However, it forces the client into "N+1" requests to fetch details for each room. Returning full objects is efficient for bulk views but increases data transfer costs, which can impact performance on mobile devices.

**Q: Is the DELETE operation idempotent in your implementation?**
**A:** Yes. The first DELETE request removes the resource and returns `204 No Content`. Subsequent DELETE requests for the same ID will return `404 Not Found`. Since the end state of the server (the room being gone) remains identical regardless of how many times the call is made, the operation is idempotent.

### Part 3: Sensor Operations
**Q: Explain the technical consequences if a client attempts to send data in a different format (e.g., text/plain).**
**A:** Because of the `@Consumes(MediaType.APPLICATION_JSON)` annotation, the JAX-RS runtime will reject any request with an incompatible `Content-Type` header. It will automatically return an **HTTP 415 Unsupported Media Type** error before the method logic is even executed.

**Q: Why is the query parameter approach generally considered superior for filtering and searching collections?**
**A:** Query parameters (e.g., `?type=CO2`) are designed for non-identifying modifiers. They allow for flexible filtering, sorting, and pagination without altering the resource's unique identity (the path). Using path segments for filters makes deep nesting brittle and complicates URL generation for optional parameters.

### Part 4: Deep Nesting with Sub-Resources
**Q: Discuss the architectural benefits of the Sub-Resource Locator pattern.**
**A:** It promotes high cohesion and low coupling by delegating sub-path logic to dedicated classes. Instead of a single massive controller, the `SensorResource` only handles sensor-level logic and "locates" the `SensorReadingResource` for reading-specific logic. This reduces complexity and improves code readability.

### Part 5: Advanced Error Handling
**Q: Why is HTTP 422 often considered more semantically accurate than a standard 404 when the issue is a missing reference inside a valid JSON payload?**
**A:** A 404 error implies the URL requested does not exist. A **422 Unprocessable Entity** acknowledges that the request was received and parsed correctly, but it cannot be fulfilled because of a semantic error (a "broken link" or missing dependency) within the payload itself. It provides much clearer diagnostic info for the developer.

**Q: From a cybersecurity standpoint, explain the risks associated with exposing internal java stack traces.**
**A:** Stack traces leak critical infrastructure details: specific versions of libraries (vulnerable to known exploits), internal file system paths, and naming conventions. This information helps attackers map the attack surface and identify potential weaknesses in the system architecture.
