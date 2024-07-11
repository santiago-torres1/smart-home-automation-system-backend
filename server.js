const mqtt = require('mqtt');
const mysql = require('mysql2');

const mqttBrokerUrl = 'mqtt://10.0.0.176:1883';
const mqttOptions = {
    username: 'mqtt',
    password: 'Conestoga'
};

const doorSensorTopic = 'zigbee2mqtt/door_basement'; 

const dbConfig = {
    host: 'semm.cn2isckwenn7.ca-central-1.rds.amazonaws.com',
    user: 'admin',
    password: 'Conestoga',
    database: 'semm-db'
};

const mqttClient = mqtt.connect(mqttBrokerUrl, mqttOptions);

const dbConnection = mysql.createConnection(dbConfig);

mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');
    mqttClient.subscribe(doorSensorTopic, (err) => {
        if (!err) {
            console.log(`Subscribed to topic: ${doorSensorTopic}`);
        } else {
            console.error(`Failed to subscribe to topic: ${doorSensorTopic}`, err);
        }
    });
});

mqttClient.on('message', (topic, message) => {
    console.log(`Received message on topic ${topic}: ${message.toString()}`);
    let sensorData;
    try {
        sensorData = JSON.parse(message.toString());
    } catch (error) {
        console.error('Failed to parse message', error);
        return;
    }
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


mqttClient.on('error', (err) => {
    console.error('MQTT error', err);
});

// Handle database connection errors
dbConnection.on('error', (err) => {
    console.error('Database error', err);
});
