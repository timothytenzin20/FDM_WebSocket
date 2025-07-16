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

// Express routes
// app.get('/', (req, res) => {
//   res.send('Hello from Express!');
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
        wss.broadcast(`Client ${ws.id}: ${message}`);
    });
    ws.on('close', () => {
        clients.delete(ws.id);
        console.log(`Client ${ws.id} disconnected`);    });
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

