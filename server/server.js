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

const dataFilePath = path.join(__dirname, 'data.json');

// Ensure data.json exists at startup, else create file
if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify({}), 'utf8');
}

// Function to update the local data.JSON file
function updateData(newData) {
    const currentData = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    const updatedData = { ...currentData, ...newData };

    fs.writeFileSync(dataFilePath, JSON.stringify(updatedData, null, 2), 'utf8');
    return updatedData;
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

// API routes (we might need these in the future)
// app.get('/testing', (req, res) => {
//   res.send('Hello from Express!');
// });

// app.get('/api/data', (req, res) => {
//   const dataPath = path.join(__dirname, 'data.json');
//   fs.readFile(dataPath, 'utf8', (err, data) => {
//     if (err) return res.status(500).send('Error reading data');
//     res.json(JSON.parse(data));
//   });
// });

// app.get('/api/test', (req, res) => {
//   res.json({ test: 'it works' });
// });

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
    
    ws.on('message', message => {
        console.log(`Client ${ws.id} sent: ${message}`);
        const newSensorData = generateData();
        const updatedData = updateData(newSensorData); // update JSON file

        Object.entries(newSensorData).forEach(([key, value]) => {
        wss.broadcast(`${key}:${value}`);
        });
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