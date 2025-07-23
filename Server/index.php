<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <script src="https://cdnjs.cloudflare.com/ajax/libs/mqtt/4.2.7/mqtt.min.js"></script>
    <a href="https://www.huf-group.com/en/news/magazine/huf-portuguesa-automotive-supplier-in-tondela-portugal">
        <img src="huf.png" width="200" alt="BleuIO get device distance">
      </a>
    <title>Production Line Management</title>
    <style>
        
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
            padding: 20px;
        }
        .container {
            max-width: 100%;
            margin: 10 auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 20 20 30px rgba(0,0,0,0.1);
        }
        h2 {
            margin-top: 0;
            font-size: 24px;
        }

        .worker-row {
    display: flex;
    align-items: center;
}

.worker-row input {
    margin-right: 5px;
}

.worker-row .remove-worker {
    margin-left: 5px;
}

        table {
            width: 300PX;
            border-collapse: collapse;
            margin-bottom: 20px;
            background-color: #fff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            font-size: 14px;
            position: relative;
        }
        th {
            background-color: #f2f2f2;
        }
        .actions {
            width: 120px;
        }
        .actions button {
            padding: 6px 10px;
            margin-right: 6px;
            cursor: pointer;
            border: none;
            border-radius: 4px;
            font-size: 14px;
            transition: background-color 0.3s;
        }
        .actions button.save {
            background-color: #4CAF50;
            color: white;
        }
        .actions button.save:hover {
            background-color: #45a049;
        }
        .actions button.add {
            background-color: #008CBA;
            color: white;
        }
        .actions button.add:hover {
            background-color: #0077A3;
        }
        .actions button.remove {
            background-color: #f44336;
            color: white;
        }
        .actions button.remove:hover {
            background-color: #d32f2f;
        }
        .add-button {
            margin-top: 10px;
        }
        .add-button button {
            padding: 10px 20px;
            cursor: pointer;
            border: none;
            background-color: #008CBA;
            color: white;
            border-radius: 4px;
            font-size: 16px;
            transition: background-color 0.3s;
        }
        .add-button button:hover {
            background-color: #0077A3;
        }

    
    .add-machine {
        height:40px;
        background-color:blue;
        color:white;
        cursor: pointer;
            border: none;
            border-radius: 4px;
            font-size: 14px;
    }





    #sendToMQTTButton{
        height:40px;
        margin-top:10px;
        background-color:Green;
        color:white;
        cursor: pointer;
            border: none;
            border-radius: 4px;
            font-size: 14px;
    }

        .worker-actions button.add-worker {
            background-color: red;
            color: red;
            margin-left: 200px;
            
            padding: 2px 5px;
        }
        .worker-actions button.remove-worker {
            background-color: #f44336;
            color: white;
            margin-left: 5px;
            padding: 2px 5px;
        }
    </style>

</head>
<body>
    <div class="container">
        <?php
        //GENERATE ID FOR EACH FIELD LIKE A DATABASE HAS A UNIQUE ID 
 function generateUniqueId() {
    return uniqid();
}   

        //GENERATE INCREMENTAL ID FOR EACH FIELD LIKE A DATABASE HAS A UNIQUE ID 

function generateIncrementalId(&$data, $table_index, $machine_index, $type = 'machine') {
    $maxId = 0;
    if ($type === 'machine') {
        foreach ($data['productionLines'][$table_index]['machines'] as $machine) {
            if ($machine['id'] > $maxId) {
                $maxId = $machine['id'];
            }
        }
    } else if ($type === 'worker') {
        foreach ($data['productionLines'][$table_index]['machines'][$machine_index]['workers'] as $worker) {
            if ($worker['id'] > $maxId) {
                $maxId = $worker['id'];
            }
        }
    }
    return $maxId + 1;
}

// FUNCTION THAT LOADS DATA FROM DATA.JSON FILE 
            function loadData() {
                $json_data = file_get_contents('data.json');
                return json_decode($json_data, true);
            }
//FUNCTION THAT SAVES DATA IN DATA.JSON FILE 
            function saveData($data) {
                file_put_contents('data.json', json_encode($data, JSON_PRETTY_PRINT));
            }


// FUNCTION THAT ADDS A NEW PRODUCTION LINE TABLE 
            function addTable(&$data, $tableName) {
                $newTable = [
                    'name' => $tableName,
                    'machines' => [
                        [
                            'id' => 1,
                            'name' => 'New Machine',
                            'dongleId' => 'NEW_DONGLE_ID',
                            'dongleMac' => 'NEW_DONGLE_MAC',
                            'workers' => [
                                [
                                    'id' => 1,
                                    'name' => 'New Worker',
                                    'beaconId' => 'NEW_BEACON_ID',
                                    'beaconMac' => 'NEW_BEACON_MAC'
                                ]
                            ]
                        ]
                    ]
                ];
                $data['productionLines'][] = $newTable;
            }
        
            //FUNCTION TO REMOVE TABLE
            function removeTable(&$data, $index) {
                if (isset($data['productionLines'][$index])) {
                    array_splice($data['productionLines'], $index, 1);
                }
            }


// FUNCTION THAT ADDS A NEW MACHINE IN A TABLE 
            function addMachine(&$data, $table_index) {
                $newMachine = [
                    'id' => generateIncrementalId($data, $table_index, null, 'machine'),
                    'name' => 'New Machine',
                    'dongleId' => 'NEW_DONGLE_ID',
                    'dongleMac' => 'NEW_DONGLE_MAC',
                    'workers' => [
                        [
                            'id' => 1,
                            'name' => 'New Worker',
                            'beaconId' => 'NEW_BEACON_ID',
                            'beaconMac' => 'NEW_BEACON_MAC'
                        ]
                    ]
                ];
                $data['productionLines'][$table_index]['machines'][] = $newMachine;
            }
// FUNCTION THAT REMOVES A MACHINE FROM A TABLE
            function removeMachine(&$data, $table_index, $machine_index) {
                if (isset($data['productionLines'][$table_index]['machines'][$machine_index])) {
                    array_splice($data['productionLines'][$table_index]['machines'], $machine_index, 1);
                }
            }
// FUNCTION TO ALLOW EDIT A FIELD IN THE TABLES
            function editMachineDataField(&$data, $table_index, $machine_index, $field, $new_value) {
                if (isset($data['productionLines'][$table_index]['machines'][$machine_index][$field])) {
                    $data['productionLines'][$table_index]['machines'][$machine_index][$field] = $new_value;
                }
            }
// FUNCTION THAT ALLOWS EDIT WORKER FIELD
            function editWorkerDataField(&$data, $table_index, $machine_index, $worker_index, $field, $new_value) {
                if (isset($data['productionLines'][$table_index]['machines'][$machine_index]['workers'][$worker_index][$field])) {
                    $data['productionLines'][$table_index]['machines'][$machine_index]['workers'][$worker_index][$field] = $new_value;
                }
            }
        // FUNCTION THAT ADDS A NEW WORKER TO THE MACHINE
            function addWorker(&$data, $table_index, $machine_index) {
                $newWorker = [
                    'id' => generateIncrementalId($data, $table_index, $machine_index, 'worker'),
                    'name' => 'New Worker',
                    'beaconId' => 'NEW_BEACON_ID',
                    'beaconMac' => 'NEW_BEACON_MAC'
                ];
                $data['productionLines'][$table_index]['machines'][$machine_index]['workers'][] = $newWorker;
            }
// FUNCTION THAT REMOVES A WORKER FROM THE MACHINE 
            function removeWorker(&$data, $table_index, $machine_index, $worker_index) {
                if (isset($data['productionLines'][$table_index]['machines'][$machine_index]['workers'][$worker_index])) {
                    array_splice($data['productionLines'][$table_index]['machines'][$machine_index]['workers'], $worker_index, 1);
                }
            }
        

            $data = loadData();


             // Edit machine data
    if (isset($_POST['edit_machine_data'])) {
        $table_index = $_POST['table_index'];
        $machine_index = $_POST['machine_index'];
        $new_name = $_POST['data']['name'] ?? null;
        $new_dongleId = $_POST['data']['dongleId'] ?? null;
        $new_dongleMac = $_POST['data']['dongleMac'] ?? null;

        if ($new_name) editMachineDataField($data, $table_index, $machine_index, 'name', $new_name);
        if ($new_dongleId) editMachineDataField($data, $table_index, $machine_index, 'dongleId', $new_dongleId);
        if ($new_dongleMac) editMachineDataField($data, $table_index, $machine_index, 'dongleMac', $new_dongleMac);

        // Edit worker data
        foreach ($data['productionLines'][$table_index]['machines'][$machine_index]['workers'] as $worker_index => $worker) {
            $new_worker_name = $_POST['data']['worker_'.$worker_index.'_name'] ?? null;
            $new_worker_beaconId = $_POST['data']['worker_'.$worker_index.'_beaconId'] ?? null;
            $new_worker_beaconMac = $_POST['data']['worker_'.$worker_index.'_beaconMac'] ?? null;

      if ($new_worker_name) editWorkerDataField($data, $table_index, $machine_index, $worker_index, 'name', $new_worker_name);
if ($new_worker_beaconId) editWorkerDataField($data, $table_index, $machine_index, $worker_index, 'beaconId', $new_worker_beaconId);
if ($new_worker_beaconMac) editWorkerDataField($data, $table_index, $machine_index, $worker_index, 'beaconMac', $new_worker_beaconMac);
        }
        saveData($data);
    }

    // Add new production Line
    if (isset($_POST['add_table'])) {
        $tableName = $_POST['tableName'] ?? 'New Production Line';
        addTable($data, $tableName);
        saveData($data);
    }

    // REMOVE PRODUCTION LINE
    if (isset($_POST['remove_table'])) {
        $table_index = $_POST['table_index'];
        removeTable($data, $table_index);
        saveData($data);
    }

    // ADD NEW MACHINE
    if (isset($_POST['add_machine'])) {
        $table_index = $_POST['table_index'];
        addMachine($data, $table_index);
        saveData($data);
    }

    // REMOVE A MACHINE
    if (isset($_POST['remove_machine'])) {
        $table_index = $_POST['table_index'];
        $machine_index = $_POST['machine_index'];
        removeMachine($data, $table_index, $machine_index);
        saveData($data);
    }

   // ADD NEW WORKER
   if (isset($_POST['add_worker'])) {
    $table_index = $_POST['table_index'];
    $machine_index = $_POST['machine_index'];
    addWorker($data, $table_index, $machine_index);
    saveData($data);
}

   // REMOVE WORKER
   if (isset($_POST)) {
    foreach ($_POST as $key => $value) {
        if (strpos($key, 'remove_worker_') === 0) {
            $parts = explode('_', $key);
            $worker_index = end($parts);
            $table_index = $_POST['table_index'];
            $machine_index = $_POST['machine_index'];

            // VERIFY IF INDEX ARE VALID 
            if (isset($data['productionLines'][$table_index]['machines'][$machine_index]['workers'][$worker_index])) {
                // REMOVE WORKER BASED ON GIVEN INDEX
                unset($data['productionLines'][$table_index]['machines'][$machine_index]['workers'][$worker_index]);

                // REINDEX WORKERS TO AVOID EMPTY INDEXES
$data['productionLines'][$table_index]['machines'][$machine_index]['workers'] = array_values($data['productionLines']
[$table_index]['machines'][$machine_index]['workers']);

                // SAVE CHANGES IN DATA.JSON FILE 
                saveData($data);

                // REDIRECT TO AVOID RESEND FORM 
                header('Location: ' . $_SERVER['PHP_SELF']);
                exit;
            } else {
                echo "Erro: Trabalhador não encontrado.";
            }
        }
    }
}

            
        ?>

<h2>Production Line Management</h2>

<?php if (isset($data['productionLines']) && is_array($data['productionLines'])): ?>
    <?php foreach ($data['productionLines'] as $table_index => $table): ?>
        <h3><?php echo htmlspecialchars($table['name']); ?></h3>
        <table>
    <thead>
        <tr>
            <th>ID</th>
            <th>Machine Name</th>
            <th>Dongle ID</th>
            <th>Dongle MAC</th>
            <th>Workers </th>
            
            <th>Beacon ID</th>
            <th>Beacon MAC</th>
            <th class="actions">Actions</th>
            
        </tr>
    </thead>
    
    <tbody>
        
        <?php foreach ($table['machines'] as $machine_index => $machine): ?>
            
            <tr>
                
                <form method="POST">
                    <td><?php echo htmlspecialchars($machine['id']); ?></td>
                    <td><input type="text" name="data[name]" value="<?php echo htmlspecialchars($machine['name']); ?>"></td>
                    <td><input type="text" name="data[dongleId]" value="<?php echo htmlspecialchars($machine['dongleId']); ?>"></td>
                    <td><input type="text" name="data[dongleMac]" value="<?php echo htmlspecialchars($machine['dongleMac']); ?>"></td>
                    <td>
                        <?php foreach ($machine['workers'] as $worker_index => $worker): ?>
                            <div class="worker-row">
                                <input type="text" name="data[worker_<?php echo $worker_index; ?>_name]" value="<?php echo htmlspecialchars($worker['name']); ?>">
                            </div>
                        <?php endforeach; ?>


                    </td>

                    <td>
                        
                        <?php foreach ($machine['workers'] as $worker_index => $worker): ?>
                            
                            <div class="worker-row">
                                
                                <input type="text" name="data[worker_<?php echo $worker_index; ?>_beaconId]" value="<?php echo htmlspecialchars($worker['beaconId']); ?>">
                            </div>
                        <?php endforeach; ?>
                    </td>
                    <td>
                        
    <?php foreach ($machine['workers'] as $worker_index => $worker): ?>
        <div class="worker-row">
            <input type="text" name="data[worker_<?php echo $worker_index; ?>_beaconMac]" value="<?php echo htmlspecialchars($worker['beaconMac']); ?>">
            <button type="submit" name="remove_worker_<?php echo $worker_index; ?>" class="remove-worker" style="height: 20px; background-color: red; color: white; cursor: pointer; border: none; border-radius: 4px; font-size: 14px;">
                Remove 
                <input type="hidden" name="table_index" value="<?php echo $table_index; ?>">
                <input type="hidden" name="machine_index" value="<?php echo $machine_index; ?>">
                <input type="hidden" name="worker_index" value="<?php echo $worker_index; ?>">
            </button>



        </div>
        
    <?php endforeach; ?>
    
</td>

                    <td class="actions">
                        <input type="hidden" name="table_index" value="<?php echo $table_index; ?>">
                        <input type="hidden" name="machine_index" value="<?php echo $machine_index; ?>">
                        <button type="submit" name="edit_machine_data" class="save">Save Changes</button>
                        <button type="submit" name="remove_machine" class="remove" style="margin-top:10px;" >Remove Machine</button>
                        <button type="submit" name="add_worker" style="height: 50px; background-color: blue; color: white; cursor: pointer; border: none; border-radius: 4px; font-size: 14px; margin-top:10px">
    Add Worker
    <input type="hidden" name="table_index" value="<?php echo $table_index; ?>">
    <input type="hidden" name="machine_index" value="<?php echo $machine_index; ?>">
</button>


                    </td>
                </form>
            </tr>
        <?php endforeach; ?>
    </tbody>
</table>

        <form method="POST">
            <input type="hidden" name="table_index" value="<?php echo $table_index; ?>">
            <button type="submit" name="add_machine" class="add-machine">Add Machine</button>
            <button type="submit" name="remove_table" class="removeproductionline" style=" 
        height:40px;
        margin-top:10px;
        background-color:red;
        color:white;
        cursor: pointer;
            border: none;
            border-radius: 4px;
            font-size: 14px;
    }" >Remove Production Line</button>
        </form>
    <?php endforeach; ?>
<?php endif; ?> 

        <div class="add-button">
        <form method="POST" id="addTableForm">
    <input type="text" style="width:250px;" name="tableName" placeholder="Enter new production line name">
    <button type="submit" name="add_table">Add Production Line</button>
</form>
        </div>
        <button type="button" id="sendToMQTTButton">Send JSON to MQTT</button>

    </div>

    

    <script>



    document.addEventListener('DOMContentLoaded', function() {
        const sendToMQTTButton = document.getElementById('sendToMQTTButton');

        sendToMQTTButton.addEventListener('click', function() {
            // LOAD ACTUAL DATA.JSON DATA 
            fetch('data.json')
                .then(response => response.json())
                .then(data => {
                    // CONECT BROKER MQTT
                    const options = {
                        username: 'Json File',
                        password: 'Json1234'
                    };
                    const client = mqtt.connect('wss://bc7274ee991e426a8a7ad4cb861e81f6.s1.eu.hivemq.cloud:8884/mqtt', options);




                    
                  // SEND DATA.JSON DATA TO THE FILE TOPIC 
client.on('connect', function() {
  client.publish('File', JSON.stringify(data), { retain: true, qos: 1 }, function(err) {
    if (!err) {
      alert('DATA SENT SUCESS TO MQTT ');
    } else {
      alert('ERROR SENDING DATA TO MQTT: ' + err);
    }
    client.end(); // CLOSE MQTT CONECTION AFTER SEND 
  });
});
                })

                .catch(error => {
                    console.error('ERROR LOADING DATA.JSON FILE', error);
                    alert('ERROR LOADING DATA.JSON FILE ');
                });
        });
    });
</script>


</body>
</html>
