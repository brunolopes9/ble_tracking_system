
# 🛠️ Admin Interface

This is the central interface for real-time visualization of the factory's workers and machines.

## 💡 Description

- Shows real-time entries/exits
- Displays charts with workers and machines per line
- No database used (data is live only during session)

## 🚀 How to Run

```bash
npm install
npm start

Access the interface via: http://localhost:3000


📡 MQTT
Subscribes to all topics

Receives real-time updates from client machines

🧩 Technologies
Node.js

Socket.IO

Chart.js

Express