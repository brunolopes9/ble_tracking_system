const socket = io();


// Handles the 'initialData' event received from the server,
// which includes production line data. It logs the received data,
// creates tables based on production lines, and loads charts.
socket.on('initialData', (data) => {
    console.log('Dados iniciais recebidos:', data);
    createTables(data.productionLines);
    loadChart();
});

// Handles the 'updateData' event received from the server, which includes real-time updates about workers. It logs the
// received topic and message data, parses the topic to get
// line and machine IDs, and updates the HTML table accordingly
// with new worker information.
socket.on('updateData', ({ topic, messageData }) => {
    console.log('Dados de atualização recebidos:', { topic, messageData });
    const [line, machineId] = topic.split('/');
    const workersData = messageData.split('\n');
    workersData.forEach(workerData => {
        const [workerName, beaconMac, zona, date, time] = workerData.split(', ');
        updateTable(line, machineId, workerName, beaconMac, zona, `${date}, ${time}`);
    });
});


// Creates HTML tables dynamically based on the provided lines data.

const createTables = (lines) => {
    console.log('Criando tabelas para linhas:', lines);
    const container = document.getElementById('tablesContainer');
    container.innerHTML = ''; // Clear any existing content

    lines.forEach(line => {
        const lineTitle = document.createElement('h2');
        lineTitle.innerText = line.name;
        container.appendChild(lineTitle);

        const table = document.createElement('table');
        table.id = `table-${line.name}`;
        table.className = 'line-table';

        const header = `<tr>
            <th>Machine ID</th>
            <th>Worker</th>
            <th>Beacon MAC</th>
            <th>Zone</th>
            <th>Timestamp</th>
            <th>Action</th>
        </tr>`;
        table.innerHTML = header;

        line.machines.forEach(machine => {
            machine.workers.forEach(worker => {
                const rowId = `${line.name}-${machine.id}-${worker.beaconMac}`;
                const row = `<tr id="${rowId}">
                    <td>${machine.id}</td>
                    <td>${worker.name}</td>
                    <td>${worker.beaconMac}</td>
                    <td>--</td>
                    <td>--</td>
                    <td><button onclick="viewHistory('${rowId}')">Ver histórico diário</button></td>
                </tr>`;
                table.innerHTML += row;
            });
        });

        container.appendChild(table);
    });
};

// Updates the table row identified by 'line', 'machineId', and 'beaconMac'
// with the provided worker information: 'workerName', 'zona', and 'timestamp'.
const updateTable = (line, machineId, workerName, beaconMac, zona, timestamp) => {
    const rowId = `${line}-${machineId}-${beaconMac}`;
    let row = document.getElementById(rowId);

    if (row) {
        row.cells[3].innerText = zona;
        row.cells[4].innerText = timestamp;
    } else {
        console.warn(`Row not found for ${rowId}`);
    }
};

// Fetches and displays the daily history for a specific key.
const viewHistory = async (key) => {
    try {
        const response = await fetch(`/history/${key}`);
        const history = await response.json();
        console.log('Histórico recebido para', key, ':', history);
        displayHistory(key, history);
    } catch (error) {
        console.error('Erro ao obter histórico:', error);
    }
};

// Displays the daily history associated with a specific key in the UI.

const displayHistory = (key, history) => {
    const existingHistory = document.getElementById(`history-${key}`);
    if (existingHistory) {
        existingHistory.remove();
    }
    const historyContainer = document.createElement('div');
    historyContainer.id = `history-${key}`;
    historyContainer.className = 'history-container';
    const title = document.createElement('h3');
    title.innerText = `Histórico diário para ${key}`;
    historyContainer.appendChild(title);
    const list = document.createElement('ul');
    history.forEach(entry => {
        const listItem = document.createElement('li');
        listItem.innerText = `${entry.workerName} - ${entry.zona} - ${entry.timestamp}`;
        list.appendChild(listItem);
    });
    const closeButton = document.createElement('button');
    closeButton.innerText = 'Fechar';
    closeButton.onclick = () => {
        historyContainer.remove();
    };
    historyContainer.appendChild(list);
    historyContainer.appendChild(closeButton);
    document.body.appendChild(historyContainer);
};

// Loads the machine count chart by fetching data from '/machineCountPerLine' endpoint and rendering it using Chart.js

const loadMachineChart = async () => {
    try {
        const response = await fetch('/machineCountPerLine');
        const data = await response.json();
        console.log('Machine Count Data:', data);
        renderMachineCountChart(data);
    } catch (error) {
        console.error('Erro ao carregar o gráfico de máquinas:', error);
    }
};

// Renders the machine count chart using Chart.js

const renderMachineCountChart = (data) => {
    const ctx = document.getElementById('machineCountChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: 'Number of machines per line',
                data: Object.values(data),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: false, // Desativa o modo responsivo
            maintainAspectRatio: false, // Permite que o tamanho seja definido pelo CSS
            scales: {
                y: {
                    beginAtZero: true,
                    stepSize: 1, // Incremento de 1 em 1 no eixo Y
                    ticks: {
                        stepSize: 1 // Incremento de 1 em 1 no eixo Y
                    }
                }
            }
        }
    });
};

// Loads the worker count chart by fetching data from '/workerCountPerLine' endpoint and rendering it using Chart.js

const loadChart = async () => {
    try {
        const response = await fetch('/workerCountPerLine');
        const data = await response.json();
        console.log('Worker Count Data:', data);
        renderWorkerCountChart(data);
    } catch (error) {
        console.error('Erro ao carregar o gráfico:', error);
    }
    loadMachineChart();
};

// Renders the worker count chart using Chart.js

const renderWorkerCountChart = (data) => {
    const ctx = document.getElementById('workerCountChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: 'Number of Workers per Line',
                data: Object.values(data),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: false, // Desativa o modo responsivo
            maintainAspectRatio: false, // Permite que o tamanho seja definido pelo CSS
            scales: {
                y: {
                    beginAtZero: true,
                    stepSize: 1, // Incremento de 1 em 1 no eixo Y
                    ticks: {
                        stepSize: 1 // Incremento de 1 em 1 no eixo Y
                    }
                }
            }
        }
    });
};








