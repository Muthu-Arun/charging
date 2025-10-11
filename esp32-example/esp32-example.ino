#include <WiFi.h>
#include <HTTPClient.h>

// --- Wi-Fi Configuration ---
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// --- Server Configuration ---
const char* serverAddress = "http://YOUR_SERVER_IP:3000"; // Replace with your computer's IP address

// --- Charger Configuration ---
const int stationId = 1;
const char* vehicleId = "ESP32-Vehicle";

// --- LED Configuration ---
const int ledPin = LED_BUILTIN; // Usually GPIO 2 on ESP32

void setup() {
  Serial.begin(115200);
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
  String url = String(serverAddress) + "/api/charger/" + stationId + "/" + action;

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
