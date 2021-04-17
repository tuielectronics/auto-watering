#include <ESP8266WiFi.h>
#include <PubSubClient.h>
const char* ssid = "----";
const char* password = "----";

const char* mqtt_server = "m23.cloudmqtt.com";
const int16_t mqtt_port = 11711;
const char* mqtt_username = "aizzyznu";

const char* mqtt_password = "f2Eyph2tS889";

WiFiClient espClient;
PubSubClient client(espClient);

uint32_t timeMqttCheck = 0;
uint32_t timeMqttPublished = 0;
uint8_t mac[6];
char macString[13];
char mqttInputTopic[32];
char mqttOutputTopic[32];

uint8_t exampleSerialValueIndex = 0;
uint16_t exampleSerialValue[10] = {10, 20, 25, 40, 60, 90, 99, 75, 34, 22};

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();
}

void setup() {
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.printf("\nbegin WiFi - %s\n", ssid);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("connected");
  WiFi.macAddress(mac);
  snprintf(macString, 13, "%02X%02X%02X%02X%02X%02X", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
  snprintf(mqttInputTopic, 32, "IN/%s", macString);
  snprintf(mqttOutputTopic, 32, "OUT/%s", macString);

  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

void loop() {
  uint32_t t = millis();
  if (t - timeMqttCheck >= 1000) {
    

    if (!client.connected()) {
      char mqttID[32];
      snprintf(mqttID, 32, "MQTT-%s-%d", macString, t);
      if (client.connect(mqttID, mqtt_username, mqtt_password)) {
        
        
        client.subscribe("mqttIncomeTopic");
        Serial.printf("mqtt connected, ID = %s, subcribed to %s\n", mqttID, mqttInputTopic);
      }
      else {
        Serial.printf("mqtt failed, rc = %d\n", client.state());
        
      }
    }
    timeMqttCheck = t;
  }

  if (t - timeMqttPublished >= 2000) {
    //uint16_t analogValue = analogRead(A0) * 100 / 1023;
    uint16_t analogValue = exampleSerialValue[exampleSerialValueIndex];
    exampleSerialValueIndex++;
    if(exampleSerialValueIndex>=10){
      exampleSerialValueIndex = 0;
    }

    uint8_t payload[8];
    memset(payload, 0, sizeof(payload));
    payload[0] = 'A';
    payload[1] = analogValue/256;
    payload[2] = analogValue%256;

    if (client.connected()) {
      client.publish(mqttOutputTopic, payload, 8);
      Serial.printf("mqtt published to %s\n", mqttOutputTopic);
    }
    timeMqttPublished = t;
  }

  client.loop();
}
