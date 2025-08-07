require('dotenv').config();

const express = require('express');
const WebSocket = require('ws');
const http = require('http'); // Required for creating the HTTP server
const PORT = 3000;
const url = require('url');
const app = express();
const server = http.createServer(app); // Create the HTTP server for Express

const wss = new WebSocket.Server({ server }); // Attach WebSocket server to the same HTTP server
const connectionKey = process.env.CONNECTION_KEY;
const clients = new Map();
var clientCounter = 1;

const fs = require('fs');
const path = require('path');

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

// Download allData.json file
app.get('/download-data', (req, res) => {
  const filePath = path.join(__dirname, 'allData.json');
  res.download(filePath, 'allData.json', (err) => {
    if (err) {
      console.error("Download error:", err);
      res.status(500).send("Could not download the file.");
    }
  });
});

const dataFilePath = path.join(__dirname, 'allData.json');

// Ensure allData.json exists at startup
if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify({}), 'utf8');
}
// If allData.json exists delete previous data
else {
    fs.writeFile(dataFilePath, '', (err) => {
        if (err) {
            console.error('Error clearing file contents:', err);
        } else {
            console.log('File contents cleared successfully.');
        }
    });
}

// Function to update the local allData.JSON file
function updateData(newData) {
    let dataArray = [];

    // Try to read existing data
    try {
        const fileData = fs.readFileSync(dataFilePath, 'utf8');
        dataArray = JSON.parse(fileData);

        // Ensure it's an array
        if (!Array.isArray(dataArray)) {
            throw new Error('Data file is not an array');
        }
    } 
    catch (err) 
    {
        // If file doesn't exist or is empty, start fresh
        console.warn('Could not read existing data or data is invalid. Initializing new array.');
    }

    // Add the new entry
    dataArray.push(newData);

    // Write the updated array back to the file
    fs.writeFileSync(dataFilePath, JSON.stringify(dataArray, null, 2), 'utf8');

    return newData;
}

// Function to generate sample data for testing
function generateData(){
    const newSensorData = {
        bedTemp: Math.random() * 100,
        nozzleTemp: Math.random() * 100,
        printSpeed: Math.random() * 100,
        lineWidth: Math.random() * 100,
        nozzleDiameter: Math.random() * 10,
        predictedLineWidth: 12
    };
    return newSensorData
}

// Express routes
// Catch-all to serve React for any unknown routes (for React Router)
const indexPath = path.join(__dirname, '../client/build/index.html');
console.log(indexPath);

if (fs.existsSync(indexPath)) {
  app.use((req, res) => {
    res.sendFile(indexPath);
  });
} else {
  console.error("Error: index.html not found at", indexPath);
}

// WebSocket connection handling
wss.on('connection', (ws, req) => {
    ws.id = clientCounter++;
    clients.set(ws.id, ws);
    const parameters = url.parse(req.url, true).query;
    const token = parameters.token;
    const protocol = ws.protocol; // inputted protocol
    
    if (protocol !== 'secure-guelph-user' && protocol !== 'testing') {
        console.log('Invalid subprotocol, closing connection');
        ws.close(1008, 'Invalid subprotocol');  // 1008 = invalid access
        return;
    }

    // token is arbitrary value
    if (token !== connectionKey.toString()) {
        console.log('Invalid token. Closing connection');
        ws.close(1008, 'Invalid token'); // 1008 = invalid access
        return;
    }

    console.log(`Client ${ws.id} connected with subprotocol: ${protocol}`);
    
    // Websocket message handling
    ws.on('message', message => {
        // Data being sent from Raspberry Pi or random string to initiate simulated results
        console.log(`Client ${ws.id} sent: ${message}`);

        // RASPBERRY PI CONNECTED: Use lines 134 - 139 (CHECK DOCUMENTATION Cloning Dashboard Guide: Step 6) 
        // const newSensorData = message
        // newSensorData.additionalDetails = Date().toLocaleString().toString()
        // updateData(newSensorData); // update JSON file
        // Object.entries(newSensorData).forEach(([key, value]) => {
        //     wss.broadcast(`${key}:${value}`);
        // });

        // RASBPBERRY PI NOT CONNECTED: Use line 142 to simulate data generation (CHECK DOCUMENTATION Cloning Dashboard Guide: Step 6) 
        // const newSensorData = generateData();

        // RASBPBERRY PI NOT CONNECTED: Use lines 145 - 163 to simulate data reading (CHECK DOCUMENTATION Cloning Dashboard Guide: Step 6) 
        if (fs.existsSync("transmitData.json")) {
            fs.readFile('transmitData.json', 'utf8', (err, data) => {
                if (err) {
                    console.error('Error reading file:', err);
                    return;
                }
                try {
                    const newSensorData = JSON.parse(data)
                    newSensorData.timestamp = Date().toLocaleString().toString()
                    newSensorData.clientMessage = message.toLocaleString()
                    updateData(newSensorData); // update JSON file

                    Object.entries(newSensorData).forEach(([key, value]) => {
                        wss.broadcast(`${key}:${value}`);
                    });
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                }
            });
        }

    });

    ws.on('close', () => {
        clients.delete(ws.id);
        console.log(`Client ${ws.id} disconnected`);    
    });
});

server.listen(PORT, function (err) {
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});

// Send data to clients from server
wss.broadcast = function broadcast(data) {
    console.log(`Broadcasting: ${data}`);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
};

// graceful shutdown
function shutdown(){
    console.log('Shutting down server...');

    server.close(() => {
        console.log('HTTP server closed');
    });

    wss.clients.forEach(client => {
        client.close(1001, 'Server shutting down'); // 1001 = going away
    });

    setTimeout(() => {
        console.log('Exiting process');
        process.exit(0);
    }, 1000)
}

process.on('SIGINT', shutdown);   // Ctrl+C