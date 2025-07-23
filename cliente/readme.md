# 📡 Client (Machine-side Application)

This module runs on each machine and detects the presence of nearby workers via Bluetooth (BLE).

## 🚀 How to Run

1. Install dependencies:
```bash
npm install

2. Start with Parcel:

npx parcel index.html

Make sure the BleuIO dongle is connected.

⚙️ Features
Connects to MQTT broker

Validates machine ID and production line

Starts BLE scanning and calculates distance

Sends presence data to MQTT topic LineName/MachineID

🛠️ Technologies
JavaScript

BleuIO library (bleuio)

MQTT (HiveMQ)

Parcel