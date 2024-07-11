const mqtt = require('mqtt');
const mysql = require('mysql2');

// MQTT broker URL
const mqttBrokerUrl = 'mqtt://localhost'; // Replace with your MQTT broker URL

// MQTT topic for door sensor
const doorSensorTopic = 'zigbee2mqtt/door_basement'; // Replace with your MQTT topic

// MySQL database configuration
const dbConfig = {
    host: 'semm.cn2isckwenn7.ca-central-1.rds.amazonaws.com',
    user: 'admin',
    password: 'Conestoga',
    database: 'semm-db'
};

// Connect to MQTT broker
const mqttClient = mqtt.connect(mqttBrokerUrl);

// Connect to MySQL database
const dbConnection = mysql.createConnection(dbConfig);

// Handle MQTT connection
mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');

    // Subscribe to door sensor topic
    mqttClient.subscribe(doorSensorTopic, (err) => {
        if (!err) {
            console.log(`Subscribed to topic: ${doorSensorTopic}`);
        } else {
            console.error(`Failed to subscribe to topic: ${doorSensorTopic}`, err);
        }
    });
});

// Handle incoming MQTT messages
mqttClient.on('message', (topic, message) => {
    console.log(`Received message on topic ${topic}: ${message.toString()}`);

    // Assuming the message is in JSON format
    let sensorData;
    try {
        sensorData = JSON.parse(message.toString());
    } catch (error) {
        console.error('Failed to parse message', error);
        return;
    }

    // Example: Insert data into MySQL database
    const query = 'INSERT INTO sensor_data (sensor_type, value, timestamp) VALUES (?, ?, ?)';
    const values = ['door', sensorData.state === 'ON' ? 'open' : 'closed', new Date()];

    dbConnection.execute(query, values, (err, results, fields) => {
        if (err) {
            console.error('Failed to insert data into database', err);
        } else {
            console.log('Data inserted into database');
        }
    });
});

// Handle MQTT errors
mqttClient.on('error', (err) => {
    console.error('MQTT error', err);
});

// Handle database connection errors
dbConnection.on('error', (err) => {
    console.error('Database error', err);
});
