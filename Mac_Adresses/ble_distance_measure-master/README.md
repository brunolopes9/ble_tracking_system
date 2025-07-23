## Measure Distance of Bluetooth device using BleuIO
Tool for testing and measuring RSSI to calculate approximate distance between Beacon and Dongle.


This script looks for nearby Bluetooth devices and get the distance.
This script is using BleuIO js library https://www.npmjs.com/package/bleuio

**Requirments** 
- You need to have BleuIO device https://www.bleuio.com/
- To run the script you need a web application bundler. You can use parceljs. [https://parceljs.org/getting_started.html](https://parceljs.org/getting_started.html) 


## 🧪 How to Use

1. Connect the BleuIO dongle
2. Run:

npx parcel index.html

***Make sure your BleuIO dongle is connected*

Click Connect and Scan Devices

📚 Reference
This tool uses a logarithmic propagation model to convert RSSI into distance.
    
Read more about how it calculates distance at 
https://iotandelectronics.wordpress.com/2016/10/07/how-to-calculate-distance-from-the-rssi-value-of-the-ble-beacon/



