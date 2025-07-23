const express = require('express');
const http = require('http');
const mqtt = require('mqtt');
const path = require('path');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use('/public', express.static(path.join(__dirname, 'public')));

// Serve the index.html file for the root endpoint '/'

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Initialize variables to store production lines data and daily history

let productionLinesData = {};
let dailyHistory = {};

// Function to store historical data for each worker

const storeHistory = (line, machineId, workerName, beaconMac, zona, timestamp) => {
    const key = `${line}-${machineId}-${beaconMac}`;
    if (!dailyHistory[key]) {
        dailyHistory[key] = [];
    }
    dailyHistory[key].push({ workerName, zona, timestamp });
};

// MQTT client options for get the DATA.JSON DATA FROM MQTT Broker

const fileOptions = {
    username: 'Json File',
    password: 'Json1234',
};

// MQTT client to connect to the broker

const fileClient = mqtt.connect('wss://bc7274ee991e426a8a7ad4cb861e81f6.s1.eu.hivemq.cloud:8884/mqtt', fileOptions);

// Event listener when MQTT client successfully connects to the broker

fileClient.on('connect', () => {
    console.log('Conectado ao broker MQTT com Json File');
    fileClient.subscribe('File', (err) => {
        if (!err) {
            console.log('Inscrito no tópico File');
        } else {
            console.error('Erro ao se inscrever no tópico File:', err);
        }
    });
});

    // Subscribe to the 'File' topic upon successful connection

fileClient.on('message', (topic, message) => {
    if (topic === 'File') {
        try {
            productionLinesData = JSON.parse(message.toString());
            io.emit('initialData', productionLinesData);
            console.log('Dados iniciais enviados ao cliente:', productionLinesData);
        } catch (error) {
            console.error('Erro ao processar mensagem JSON:', error);
        }
    }
});


// connecting to view MACHINES MESSAGES INCOMING to the broker
const clientOptions = {
    username: 'pv22977',
    password: 'Testemqtt1'
};

const client = mqtt.connect('wss://bc7274ee991e426a8a7ad4cb861e81f6.s1.eu.hivemq.cloud:8884/mqtt', clientOptions);

client.on('connect', () => {
    console.log('Conectado ao broker MQTT com pv22977');
    client.subscribe('#', { qos: 0 }, (err) => {
        if (!err) {
            console.log('Inscrito em todos os tópicos');
        } else {
            console.error('Erro ao se inscrever nos tópicos:', err);
        }
    });
});


// MQTT message handler: processes incoming messages from MQTT broker

    client.on('message', (topic, message) => {
        if (topic !== 'File') {
            try {
                const messageData = message.toString();
                const [line, machineId] = topic.split('/');
                const workersData = messageData.split('\n');
                workersData.forEach(workerData => {
                    const [workerName, beaconMac, zona, date, time] = workerData.split(', ');
                    const timestamp = `${date}, ${time}`;
                    storeHistory(line, machineId, workerName, beaconMac, zona, timestamp);
                    io.emit('updateData', { topic, messageData });
                    console.log(`Dados atualizados enviados ao cliente para o tópico ${topic}:`, messageData);
                });
            } catch (error) {
                console.error('Erro ao processar mensagem MQTT:', error);
            }
        }
    });

    // Endpoint to retrieve worker count per line
    app.get('/workerCountPerLine', (req, res) => {
        const workerCount = {};
        productionLinesData.productionLines.forEach(line => {
            workerCount[line.name] = 0;
            line.machines.forEach(machine => {
                workerCount[line.name] += machine.workers.length;
            });
        });
        res.json(workerCount);
    });

    // Function to calculate the number of machines per production line

const getMachineCountPerLine = () => {
    const machineCount = {};
    productionLinesData.productionLines.forEach(line => {
        machineCount[line.name] = line.machines.length;
    });
    return machineCount;
};

// Endpoint to serve machine count per line data as JSON

app.get('/machineCountPerLine', (req, res) => {
    res.json(getMachineCountPerLine());
});

// Endpoint to retrieve time in/out statistics per line and worker

app.get('/timeInOutZonePerLine', (req, res) => {
    const timeInOut = {};
    productionLinesData.productionLines.forEach(line => {
        timeInOut[line.name] = {};
        line.machines.forEach(machine => {
            machine.workers.forEach(worker => {
                const key = `${line.name}-${machine.id}-${worker.beaconMac}`;
                const history = dailyHistory[key] || [];
                const inZone = history.filter(entry => entry.zona === 'inZone').length;
                const outZone = history.filter(entry => entry.zona === 'outZone').length;
                timeInOut[line.name][worker.name] = {
                    workerName: worker.name,
                    inZone,
                    outZone
                };
            });
        });
    });
    res.json(timeInOut);
});

// Endpoint to retrieve daily history for a specific key

app.get('/history/:key', (req, res) => {
    const key = req.params.key;
    res.json(dailyHistory[key] || []);
});




const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

