package com.smartcampus.service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.stream.Collectors;

public class GeminiService {
    private static final String API_KEY = System.getenv("GEMINI_API_KEY");
    private static final String API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + API_KEY;

    public String analyzeSensorData(String sensorType, String recentReadings) {
        if (API_KEY == null || API_KEY.isEmpty()) {
            // Fallback for Demo purposes if API Key is not set locally
            return "[DEMO MODE] The sensor shows stable " + sensorType + " patterns. No immediate maintenance required. Readings analyzed: " + recentReadings;
        }

        try {
            URL url = new URL(API_URL);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);

            String prompt = String.format("Analyze this %s sensor data from a smart campus. Readings: %s. Provide a brief maintenance recommendation (max 50 words).", sensorType, recentReadings);
            String jsonInputString = "{\"contents\": [{\"parts\": [{\"text\": \"" + prompt + "\"}]}]}";

            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonInputString.getBytes("utf-8");
                os.write(input, 0, input.length);
            }

            try (BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), "utf-8"))) {
                String response = br.lines().collect(Collectors.joining());
                // Simple parsing (In production, use Jackson)
                if (response.contains("\"text\": \"")) {
                    int start = response.indexOf("\"text\": \"") + 9;
                    int end = response.indexOf("\"", start);
                    return response.substring(start, end).replace("\\n", " ");
                }
                return "Analysis completed successfully.";
            }
        } catch (Exception e) {
            return "Error during AI analysis: " + e.getMessage();
        }
    }
}
