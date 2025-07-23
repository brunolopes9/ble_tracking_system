PORT CONFIGURATION : https://www.bleuio.com/getting_started/docs/intro/

HOW TO CONNECT THE DONGLE TO WINDOWS, MAC , RASPEBERRY : https://www.bleuio.com/getting_started/docs/howtouse/

UPDATING FIRMWARE : https://www.bleuio.com/getting_started/docs/firmware/

Install library : npm i bleuio
Import library : import * as my_dongle from 'bleuio'

Install Parcel : https://parceljs.org/getting-started/webapp/

1st -> Open Ver_Macs folder to use the manufacturer's application to see which MAC'S each beacon has.
Run command : npx parcel index.html

2 -> Open the administrator's ‘Database’. As it involves PHP, you need an application such as XAMP. I used XAMP and you can run the program using the command :
 start /B C:\Xamp\php\php.exe -S localhost:8000
Make the CRUD as necessary, save data. Click on the "SEND TO MQTT" button to send the data to the MQTT File topic. 

3-> Open Client application. Command : npx parcel index.html
indicate the name of the line we are on and the machine ID, click on 'send' to validate the data. Enter the interval in seconds and the number of results to average, and start Scan. The results are recorded and sent to the ‘Line/ID’ topic.

4 -> Open the admin interface. It is necessary to open "Localhost:3000" (or any other port) before starting "npm start" because as there is no database then the data is only stored while the server is running.




# HUF BLE PROJECT

## 📌 Description

This project was developed as part of the curricular internship for the **Computer Engineering Degree** course at the **Escola Superior de Tecnologia e Gestão de Viseu (ESTGV)**, in partnership with the **HUF Portuguesa** company. The main objective was to develop a technological solution to monitor, in real time, the presence and productivity of workers on the factory's production lines, using Bluetooth Low Energy (BLE) technology.

The solution aims to solve the problem of production line stoppages caused by the absence of workers at the machines, compromising the company's productivity.

---

## 🧠 Objectives

- Create a **management** web application (CRUD) to configure lines, machines, dongles, beacons and workers;
- Develop an application for **each machine**, capable of detecting the presence of a worker via BLE;
- Develop a central visualization application for the administrator, without using a database, using only JSON and MQTT;
- Guarantee a measurement with a **minimum accuracy of 50cm** between the worker and his machine.

---

## 🛠️ Technologies Used

- **JavaScript (Node.js + Frontend)**
- **PHP** (Management application backend)
- **HTML/CSS** (Web Interfaces)
- **MQTT (via HiveMQ Broker)**
- **JSON** (Structured data storage)
- **BLE (Bluetooth Low Energy)**
- BLEUIO devices (USB dongles + Beacons)**

---


## 📂 Project structure

```bash
HUF BLE PROJECT/
├── admin/ # Administrator backend application (CRUD with JSON)
├── client/ # Individual application for each machine
├── Server/ # PHP interface and JSON data file
└── Ver_Macs/ # BLE distance measurement script (support and testing)
Admin folder/
server.js - Backend server with Node.js

script.js - General visualization interface logic

package.json - Dependencies

public/ - Public resources (HTML/CSS)

client folder/
pub.js - Application for each machine (BLE scan + send to broker)

package.json - Dependencies specific to the machine application

Server folder/
data.json - Simple database with factory structure

index.php - Data management interface

Ver_Macs/ble_distance_measure-master/ folder
script.js - Scripts for distance testing and RSSI calculation

README.md - Original BLE measurement technical documentation

🧪 Functionalities Implemented
CRUD of Production Lines, Machines, Dongles, Beacons and Workers;

Connection via MQTT with retained topic (/file) for sharing data between applications;

Continuous distance measurement between worker (Beacon) and machine (Dongle);

Creation of dynamic tables with moving averages to reduce noise in the data;

General interface with real-time visualization of:

Worker entries/exits

Current status (In/Out of zone)
Daily history of each worker

Worker/machine occupancy graphs

Results
Guaranteed measurement accuracy (minimum 50cm)

100% functional without database

Lightweight, responsive and easy-to-use interface

Practical, scalable solution with potential for future integration with databases

🔮 Future work
Integration with a database (MySQL/PostgreSQL) to persist historical data;

Export of reports to PDF/Excel;

Administrator authentication and permission management;

Dashboard with more statistics and advanced filters;

Mobile/responsive version for quick viewing.

