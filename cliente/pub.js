import * as my_dongle from 'bleuio';

import mqtt from 'mqtt';



// Add event listener to submit button for capturing user inputs

document.getElementById('submitInfo').addEventListener('click', function() {
  const productionLine = document.getElementById('productionLine').value;
  const machineId = document.getElementById('machineId').value;

      // Check if both inputs are filled

  if (productionLine && machineId) {
    const userInputs = `Linha: ${productionLine}, Machine ID: ${machineId}`;
    document.getElementById('userInputs').textContent = userInputs;
    document.getElementById('validationResult').textContent = '';  // Limpa mensagens anteriores
    document.getElementById('brokerStatus').textContent = '';      // Limpa mensagens anteriores

    // Conectar ao broker MQTT com as novas credenciais
    connectToBroker(productionLine, machineId);
  } else {
    alert('Por favor, preencha ambos os campos.');
  }
});


// Connect to MQTT broker with provided credentials and handle connection events
const connectToBroker = (productionLine, machineId) => {
  const fileOptions = {
    username: 'Json File',
    password: 'Json1234',
  };

  const file = mqtt.connect('wss://bc7274ee991e426a8a7ad4cb861e81f6.s1.eu.hivemq.cloud:8884/mqtt', fileOptions);

      // Event handler for successful connection

  file.on('connect', () => {
    console.log('Conectado ao broker MQTT');
    document.getElementById('brokerStatus').textContent = 'Conectado ao broker MQTT';
    file.subscribe('File', (err) => {
      if (!err) {
        console.log('Inscrito no tópico');
        document.getElementById('brokerStatus').textContent += ' e inscrito no tópico';
      } else {
        console.error('Erro ao se inscrever no tópico:', err);
        document.getElementById('brokerStatus').textContent += ' mas houve um erro ao se inscrever no tópico';
      }
    });
  });

      // Event handler for connection errors

  file.on('error', (err) => {
    console.error('Erro na conexão:', err);
    document.getElementById('brokerStatus').textContent = 'Erro na conexão ao broker MQTT';
  });

      // Event handler for incoming messages

  file.on('message', (topic, message) => {
    try {
      console.log('Mensagem recebida do tópico:', topic);
      console.log('Mensagem recebida:', message.toString());
      document.getElementById('brokerStatus').textContent += ' - Mensagem recebida do broker';

      const jsonMessage = JSON.parse(message.toString());
      validateData(productionLine, machineId, jsonMessage);
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      document.getElementById('validationResult').textContent = 'Erro ao processar mensagem';
    }
  });
};

let macToName = {};  // Gets Wokers and beacons data from the Broker and store in array to search 

// Validate data against productionLine and machineId

const validateData = (productionLine, machineId, jsonData) => {
  let lineExists = false;
  let machineExists = false;

  console.log('Validando dados com:', jsonData);

      // Iterate over production lines in jsonData

  jsonData.productionLines.forEach(line => {
    if (line.name === productionLine) {
      lineExists = true;
      line.machines.forEach(machine => {
        if (machine.id == machineId) {
          machineExists = true;
          // Preencher o array macToName com dados do JSON
          macToName = {}; // Resetar para garantir que está limpo
          machine.workers.forEach(worker => {
            macToName[worker.beaconMac] = worker.name;
          });
        }
      });
    }
  });

      // Update validation result based on line and machine existence

  if (lineExists && machineExists) {
    document.getElementById('validationResult').textContent = 'Linha de produção e ID da máquina encontrados: Dados corretos';
  } else {
    if (!lineExists) {
      document.getElementById('validationResult').textContent = 'Linha de produção não encontrada';
    }
    if (lineExists && !machineExists) {
      document.getElementById('validationResult').textContent = 'ID da máquina não encontrado na linha de produção';
    }
  }
};



const options = {
  username: 'pv22977',
  password: 'Testemqtt1'
};

const client = mqtt.connect('wss://bc7274ee991e426a8a7ad4cb861e81f6.s1.eu.hivemq.cloud:8884/mqtt', options);

let scanTimeout = null;
let isScanning = false; // To know if the scan is running or not 
let scanResults = []; // Stores scan results
let lastZones = {}; // Stores the last calculated zones

const rssiReadings = {}; // Stores RSSI readings for weighted moving average
const movingAverageWindowSize = 5; // Window size for weighted moving average

// Event listener for the 'connect' button

document.getElementById('connect').addEventListener('click', async function() {
  try {
    await my_dongle.at_connect();
    document.getElementById('connectionStatus').textContent = 'Estado do Dongle: Conectado';
  } catch (error) {
    document.getElementById('connectionStatus').textContent = 'Estado do Dongle: Falha na Conexão';
    console.error('Erro ao conectar:', error);
  }
});

// Event listener for the 'startScan' button

document.getElementById('startScan').addEventListener('click', async function() {
  const intervalValue = parseInt(document.getElementById('intervalInput').value);
  const averageType = document.getElementById('averageType').value; // Pega o tipo de média móvel selecionado
  const averageInterval = parseInt(document.getElementById('averageInterval').value); // Número de amostras para média
  const productionLine = document.getElementById('productionLine').value;
  const machineId = document.getElementById('machineId').value;

  if (intervalValue > 0) {
    try {
      await my_dongle.at_central();
      startScan(intervalValue * 1000, averageType, averageInterval,productionLine, machineId); // Iniciar o scan com o intervalo definido pelo usuário em milissegundos e o número de amostras para média
    } catch (error) {
      console.error('Erro durante o scan:', error);
    }
  } else {
    alert('Por favor, insira um intervalo válido maior que zero.');
  }
});

// Function to calculate distance from RSSI using a propagation model

const getDistance = (rssi) => {
  let n = 2;
  let mp = -69;
  return 10 ** ((mp - rssi) / (10 * n));
};



// Function to calculate weighted moving average of RSSI values
const calculateWeightedMovingAverage = (readings) => {
  if (readings.length === 0) return 0;

  // Weights for weighted moving average
  const weights = [0.1, 0.15, 0.2, 0.25, 0.3]; // Ajuste os pesos conforme necessário

  if (readings.length > weights.length) {
    console.warn('O número de leituras excede o número de pesos definidos. Ajuste os pesos conforme necessário.');
  }

  let weightedSum = 0;
  let weightSum = 0;

  readings.forEach((rssi, index) => {
    const weight = weights[index];
    weightedSum += rssi * weight;
    weightSum += weight;
  });

  return weightedSum / weightSum;
};

// Function to initiate scanning process

const startScan = async (interval, averageType, averageInterval, productionLine, machineId) => {
  if (!isScanning) {
    isScanning = true;
    scanDevices(interval, averageType, averageInterval, productionLine, machineId);  }
};

// Function Dongle makes Scan
const scanDevices = async (interval, averageType, averageInterval,productionLine, machineId) => {
  const element = document.getElementById("scanning");
  element.classList.remove("d-none"); 
  const container = document.getElementById("tablesContainer");

  try {
        // Perform Bluetooth LE scan with the specified interval

    const dev = await my_dongle.at_gapscan(interval / 1000, false);

        // Format scan results into structured objects

    const formatted = dev.map((item) => {
      const [id, dev, devid, none, rssi, rssival, devname] = item.split(' ');
      return { id, dev, devid, none, rssi, rssival, devname };
    });

        // Filter results for devices with specific name and known MAC addresses

    let filteredArr = formatted.filter(y => y.devname && y.devname.includes('closebeacon.com') && macToName.hasOwnProperty(y.devid));
    
        // Sort filtered array by RSSI value
filteredArr.sort((a, b) => parseInt(a.rssival) > parseInt(b.rssival) ? 1 : -1);

    let withDistance = filteredArr.map(r => {
      const distance = getDistance(parseInt(r.rssival));
      r.distance = distance.toFixed(2) + ' meter';
      r.workerName = macToName[r.devid] || 'Desconhecido';

            // Add current RSSI reading to the RSSI readings array

      if (!rssiReadings[r.devid]) {
        rssiReadings[r.devid] = [];
      }
      rssiReadings[r.devid].push(parseInt(r.rssival));

      // Maintain the size of the weighted moving average window
      if (rssiReadings[r.devid].length > movingAverageWindowSize) {
        rssiReadings[r.devid].shift();
      }

      // Calculate the weighted moving average
      const weightedMovingAverage = calculateWeightedMovingAverage(rssiReadings[r.devid]);
      r.trabalho = weightedMovingAverage > -70 ? 'Sim' : 'Não'; // Exemplo de decisão com limiar

      return r;
    });

        // Generate HTML table with scan results

    let mytable = `<h2>Lista de Tags</h2>
      <table class='table table-striped table-bordered'>
      <tr>
        <th>Tag</th>
        <th>MAC</th>
        <th>RSSI</th>
        <th>Distância</th>
        <th>Trabalho</th>
        <th>Timestamp</th>
      </tr>`;

    const timestamp = new Date().toLocaleString();
    withDistance.forEach(j => {
      mytable += `<tr>
        <td>${j.workerName}</td>
        <td>${j.devid} - ${j.devname}</td>
        <td>${j.rssival}</td>
        <td>${j.distance}</td>
        <td>${j.trabalho}</td>
        <td>${timestamp}</td>
      </tr>`;
    });

        // Create a new table element and prepend it to the container

    mytable += "</table>";
    const newTableDiv = document.createElement('div');
    newTableDiv.innerHTML = mytable;
    container.prepend(newTableDiv);

        // Store scan results

    scanResults.push(withDistance);

        // Check if the number of scans equals or exceeds the average interval

    if (scanResults.length >= averageInterval) { // Verifica se o número de scans é maior ou igual ao intervalo de média
      calculateAndDisplayAverages(averageInterval, productionLine, machineId);
    }



  
  } catch (error) {
    console.error('Erro durante o scan:', error);
  } finally {
    element.classList.add("d-none");

        // Remove the last table if more than 10 tables are displayed

    if (container.childElementCount > 10) {
      container.removeChild(container.lastElementChild);
    }

        // Schedule the next scan after the specified interval

    scanTimeout = setTimeout(() => {
      isScanning = false;
      scanDevices(interval, averageType, averageInterval, productionLine, machineId);
    }, interval);
  }
};

const calculateAndDisplayAverages = (averageInterval, productionLine, machineId) => {
  const averageResults = {};
  const timestamp = new Date().toLocaleString();

    // Iterate through the scan results to calculate weighted averages

  scanResults.slice(-averageInterval).forEach(scan => {
    scan.forEach(device => {
      if (!averageResults[device.devid]) {
        averageResults[device.devid] = {
          workerName: device.workerName,
          rssiValues: [],
          distanceValues: [],
        };
      }
      averageResults[device.devid].rssiValues.push(parseInt(device.rssival));
      averageResults[device.devid].distanceValues.push(parseFloat(device.distance));
    });
  });

  let averagesTable = null; // Inicializa a tabela de médias como nula
  let mqttMessage = ""; // Inicializa a mensagem MQTT como uma string vazia

  // Iterate over the average results to generate the HTML table

  Object.keys(averageResults).forEach(devid => {
    const device = averageResults[devid];
    const rssiAverage = (device.rssiValues.reduce((a, b) => a + b, 0) / device.rssiValues.length).toFixed(2);
    const distanceAverage = (device.distanceValues.reduce((a, b) => a + b, 0) / device.distanceValues.length).toFixed(2);
    const zona = distanceAverage < 0.50 ? 'Dentro' : 'Fora';

    // Check for zone change compared to last calculated zones
    if (!lastZones[devid] || lastZones[devid] !== zona) {
      if (!averagesTable) {
        averagesTable = `<h2>Médias de ${averageInterval} Scans</h2>
          <table class='table table-striped table-bordered'>
          <tr>
            <th>Tag</th>
            <th>MAC</th>
            <th>RSSI Médio</th>
            <th>Distância Média</th>
            <th>Zona</th>
            <th>Timestamp</th>
          </tr>`;
      }

      averagesTable += `<tr>
        <td>${device.workerName}</td>
        <td>${devid}</td>
        <td>${rssiAverage}</td>
        <td>${distanceAverage} meter</td>
        <td>${zona}</td>
        <td>${timestamp}</td>
      </tr>`;

      // Update the last calculated zone
      lastZones[devid] = zona;
      mqttMessage += `${device.workerName}, ${devid}, ${zona}, ${timestamp}\n`;

    }
  });

  if (averagesTable) {   // Display the averages table only if there are new zones to display

    displayAveragesTable(averagesTable);

    // Publish the averages table to the dynamic MQTT topic

    const topic = `${productionLine}/${machineId}`;

    client.publish(topic, mqttMessage.trim(), { qos: 0, retain: false }, (error) => {
      let statusMessage = "";
      if (error) {
        statusMessage = `Não foi possível enviar para o tópico ${topic}`;
        console.error(`Erro ao enviar para o tópico ${topic}:`, error);
      } else {
        statusMessage = `Enviado com sucesso para o tópico ${topic}`;
        console.log(`Mensagem enviada para o tópico ${topic}:`, mqttMessage.trim());
      }
      displayStatusMessage(statusMessage);
    });




    
  }

  // Clear the scan results array after calculating and displaying averages
  scanResults = [];
};

const displayAveragesTable = (averagesTable) => {
  const averagesContainer = document.getElementById("averagesContainer");
  const newTableDiv = document.createElement('div');
  newTableDiv.classList.add('averages-table-container');
  newTableDiv.innerHTML = averagesTable;
  averagesContainer.prepend(newTableDiv);
};

const displayStatusMessage = (message) => {
  const averagesContainer = document.getElementById("averagesContainer");
  const statusMessageDiv = document.createElement('div');
  statusMessageDiv.classList.add('status-message');
  statusMessageDiv.textContent = message;
  averagesContainer.prepend(statusMessageDiv);
};

// Initialize the scan process with default values (interval and average)

scanDevices(scanInterval, averageType, averageInterval, productionLine, machineId);
   
