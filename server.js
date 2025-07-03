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



// Express routes
app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

// WebSocket connection handling
wss.on('connection', (ws, req) => {
    const parameters = url.parse(req.url, true).query;
    const token = parameters.token;

    const protocol = ws.protocol; // inputted protocol
    
    if (protocol !== 'secure-guelph-user') {
        console.log('Invalid subprotocol, closing connection');
        ws.close(1008, 'Invalid subprotocol');
        return;
    }

    // token is arbitrary value
    if (token !== connectionKey.toString()) {
        console.log('Invalid token. Closing connection');
        ws.close(1008, 'Invalid token');
        return;
    }

    console.log(`Client connected with subprotocol: ${protocol}`);
    
    ws.on('message', message => {
        console.log(`Received: ${message}`);
        ws.send(`Echo: ${message}`);
    });
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

server.listen(PORT, function (err) {
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});

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
