#include <WiFi.h>
#include <HTTPClient.h>

// --- Wi-Fi Configuration ---
const char* ssid = "Arun";
const char* password = "muthuarun123";

// --- Server Configuration ---
const char* serverAddress = "https://z8wx84pw-3000.inc1.devtunnels.ms/"; // Replace with your computer's IP address

// --- Charger Configuration ---
const int stationId = 1;
const char* vehicleId = "ESP32-Vehicle";

// --- LED Configuration ---
const int ledPin = 2; // Usually GPIO 2 on ESP32
bool sendChargingRequest(String action);
void setup() {
  Serial.begin(9600);
  pinMode(ledPin, OUTPUT);

  // Connect to Wi-Fi
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // --- Start Charging ---
  Serial.println("Starting charging...");
  if (sendChargingRequest("start")) {
    // Blink LED while charging
    for (int i = 0; i < 10; i++) {
      digitalWrite(ledPin, HIGH);
      delay(500);
      digitalWrite(ledPin, LOW);
      delay(500);
    }

    // --- Stop Charging ---
    Serial.println("Stopping charging...");
    sendChargingRequest("stop");
  }

  // Wait for 30 seconds before starting a new cycle
  Serial.println("Waiting for next charging cycle...");
  delay(30000);
}

bool sendChargingRequest(String action) {
  HTTPClient http;
  String server = String(serverAddress);
  if (server.endsWith("/")) {
    server.remove(server.length() - 1);
  }
  String url = server + "/api/charger/" + stationId + "/" + action;

  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  String payload = "{\"vehicleId\":\"" + String(vehicleId) + "\"}";

  int httpResponseCode = http.POST(payload);

  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("HTTP Response code: " + String(httpResponseCode));
    Serial.println(response);
    http.end();
    return true;
  }
  else {
    Serial.println("Error on sending POST request");
    Serial.println("HTTP Response code: " + String(httpResponseCode));
    http.end();
    return false;
  }
}
