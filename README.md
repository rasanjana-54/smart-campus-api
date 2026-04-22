# Smart Campus Sensor and Room Management API

A robust JAX-RS RESTful API for managing IoT hardware resources, integrating Google Gemini AI for predictive maintenance insights.

---

**Student Name:** K.V.R.Nimsara  
**Student ID (UOW):** w2152943  
**Student ID (IIT):** 20240728  
**Tutorial Group:** CS G-21

---

## 🚀 API Design Overview
The **Smart Campus Sensor & Room Management API** is a RESTful web service built using **JAX-RS (Jersey)** and **Maven**. It provides comprehensive management of campus infrastructure, including rooms and their associated hardware sensors.

### Key Features:
- **HATEOAS Discovery**: Root endpoint to discover available resources dynamically.
- **Resource Linking**: Strict referential integrity between sensors and rooms.
- **Sub-Resource Locators**: Hierarchical management of readings history (`/sensors/{id}/readings`).
- **Advanced Error Mapping**: Semantic JSON responses for 422 (Integrity) and 409 (Conflict) errors.
- **Gemini AI Integration**: Intelligent analytical insights for predictive maintenance.
- **Centralized Logging**: JAX-RS Filters for consistent audit trails.

---

## 🛠 Project Execution Guide
1. **JDK 11+** and **Maven** are required.
2. Open the project in **NetBeans** or **IntelliJ**.
3. Run the command: `mvn jetty:run`
4. The API will be live at: `http://localhost:9595/SmartCampusAPI/api/v1`

### 📌 Sample curl Commands
```bash
# 1. Discover API (HATEOAS)
curl -X GET http://localhost:9595/SmartCampusAPI/api/v1/

# 2. Create a Room
curl -X POST "http://localhost:9595/SmartCampusAPI/api/v1/rooms?id=R101&name=Lab&capacity=50"

# 3. Create a Sensor (Linked)
curl -X POST -H "Content-Type: application/json" -d '{"id":"S101", "type":"TEMPERATURE", "roomId":"R101"}' http://localhost:9595/SmartCampusAPI/api/v1/sensors

# 4. Add Reading (Sub-resource)
curl -X POST -H "Content-Type: application/json" -d '{"value": 24.5}' http://localhost:9595/SmartCampusAPI/api/v1/sensors/S101/readings

# 5. AI Analysis (Innovation)
curl -X GET http://localhost:9595/SmartCampusAPI/api/v1/ai/analyze/S101
```

---

## 📚 Technical Answers (Parts 1–5)

### Q1: JAX-RS Resource Lifecycle
JAX-RS resources follow a **Request-Scoped** lifecycle. A new instance is created for every request. We use a **Singleton Repository** with `ConcurrentHashMap` to ensure thread-safe, persistent data storage across these ephemeral resource instances.

### Q2: Hypermedia (HATEOAS)
HATEOAS allows clients to discover the API structure via links in responses. This decouples the client from hardcoded URLs, enabling graceful API evolution without breaking client code.

### Q3: Full Objects vs IDs
We return **Full Objects** to avoid the "N+1 Query Problem." Although it uses more bandwidth per request, it significantly reduces total network round-trips, which is more efficient for mobile clients.

### Q4: Idempotency
Our DELETE operation is **idempotent**. Multiple identical requests result in the same server state (resource deleted), even if the status codes vary (204 for first, 404 for subsequent).

### Q5: @Consumes Validation
This annotation establishes a framework-level contract. It automatically rejects non-JSON payloads with a **415 Unsupported Media Type** error before business logic executes, enhancing security.

### Q6: QueryParam for Filtering
Query parameters are used for filtering collections (`/sensors?type=TEMP`). This is semantically more accurate than path parameters for searching and allows for flexible, multi-dimensional filtering.

### Q7: Sub-Resource Locator
Implemented for `/sensors/{id}/readings`. It promotes **Separation of Concerns** by delegating reading management to a specialized resource class, preventing "God Objects."

### Q8: 422 vs 404 (Semantic Accuracy)
We use **422 Unprocessable Entity** for semantic errors (e.g., non-existent roomId in a valid JSON). This is more accurate than 404 because the endpoint exists, but the data violates business constraints.

### Q9: Security & Stack Traces
Exposing stack traces reveals internal framework versions and file paths, aiding attackers in reconnaissance. Our `GlobalExceptionMapper` sanitizes all responses to hide these details.

### Q10: Filters vs Manual Logging
JAX-RS Filters provide **Centralized, Uniform Logging**. This eliminates code duplication across resource methods and ensures a consistent audit trail for every interaction.

---

## 🏆 Conclusion
The Smart Campus API successfully implements a high-maturity RESTful service. By integrating advanced principles like HATEOAS and Gemini AI insights, the project demonstrates technical excellence and readiness for production deployment.
