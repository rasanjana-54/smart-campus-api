# Smart Campus Sensor and Room Management API

A robust JAX-RS RESTful API for managing campus IoT hardware resources (Rooms and Sensors). Built with **Java 11** and **Maven**, following REST architecture principles as required for the **University of Westminster** coursework (5COSC022W).

---

**Student Name:** K.V.R.Nimsara  
**Student ID (UOW):** w2152943  
**Student ID (IIT):** 20240728  
**Tutorial Group:** CS G-21

---

## 🚀 API Design Overview
The **Smart Campus Sensor & Room Management API** provides comprehensive management of infrastructure:
- **Discovery Service**: Root endpoint (`/api/v1/`) for dynamic resource discovery.
- **Room Management**: CRUD operations for university rooms with capacity constraints.
- **Sensor Integration**: Linking sensors to rooms with data integrity validation.
- **Sub-Resource Locators**: Hierarchical management of readings history at `/sensors/{id}/readings`.
- **Advanced Error Mapping**: Semantic JSON responses for 422 (Unprocessable Entity) and 409 (Conflict).

---

## 🏗️ Project Execution Guide

### **Running with Apache Tomcat 9.0 (Required)**
1.  **Build:** Run `mvn clean package` in the root folder.
2.  **Deploy:** Copy `target/SmartCampusAPI.war` to Tomcat's `webapps` folder.
3.  **Run with Maven (Embedded):** Run `mvn cargo:run` (Runs real Tomcat 9.0).
4.  **Access URL:** `http://localhost:8080/SmartCampusAPI/api/v1/`

### **Running in NetBeans IDE**
1.  Open the project in NetBeans.
2.  Add **Apache Tomcat 9.0** via `Tools -> Servers`.
3.  Connect the project to the server in `Properties -> Run`.
4.  Click **Run** (Project automatically deploys to Tomcat).

---

## 📚 Technical Answers (Parts 1–5)

### Q1: JAX-RS Resource Lifecycle
JAX-RS resources follow a **Request-Scoped** lifecycle by default. A new instance is instantiated for every incoming request. To manage data across requests, we use a **Singleton Repository** pattern with thread-safe collections (`ConcurrentHashMap`).

### Q2: Hypermedia (HATEOAS)
Providing hypermedia links within responses allows the API to be self-descriptive. It enables client developers to navigate the API dynamically without relying on static documentation, supporting long-term API evolution.

### Q3: Returning Full Objects vs IDs
Returning full objects reduces the number of network round-trips (avoiding N+1 requests). While it consumes more bandwidth per message, it improves overall performance for clients by providing all necessary data in a single response.

### Q4: DELETE Idempotency
Our DELETE operation is **idempotent**. Multiple identical requests result in the same server state (the resource remains deleted). Although the status code might change (204 vs 404), the side-effect on the server is identical.

### Q5: @Consumes Validation
The `@Consumes(MediaType.APPLICATION_JSON)` annotation acts as a strict protocol guard. If a client sends incompatible data (e.g., XML or plain text), JAX-RS automatically returns a **415 Unsupported Media Type** error before the business logic is even triggered.

### Q6: Query Parameters vs Path Parameters
We use query parameters (`?type=CO2`) for filtering collections. This is semantically superior to path parameters for optional search criteria and allows for flexible, multi-criteria filtering without bloating the URL structure.

### Q7: Sub-Resource Locator Pattern
The sub-resource locator (`/sensors/{id}/readings`) delegates handling to a separate `SensorReadingResource` class. This promotes **Single Responsibility** and keeps the code maintainable as the API grows deeper.

### Q8: 422 vs 404 Status Codes
We use **422 Unprocessable Entity** when a request is syntactically correct but violates business rules (e.g., a missing reference). This is more accurate than 404, which implies the endpoint itself is missing.

### Q9: Security & Stack Traces
Exposing Java stack traces provides attackers with valuable information about the server version and internal logic. We use `ExceptionMapper` to sanitize all errors into generic JSON, ensuring the API is "leak-proof."

### Q10: Global Safety Net
The catch-all `ExceptionMapper<Throwable>` ensures that any unexpected runtime error (like `NullPointerException`) is caught and returned as a generic **500 Internal Server Error**, preventing the server from displaying raw system data.
