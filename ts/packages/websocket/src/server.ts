import { WebSocketServer, WebSocket } from 'ws';

// Create WebSocket server
const server = new WebSocketServer({ port: 8080 });

// Store all connected clients
const clients: Set<WebSocket> = new Set();

server.on('connection', (ws: WebSocket) => {
  console.log('Client connected');
  clients.add(ws); // Add new client to the set

  // Send a welcome message to the newly connected client
  ws.send('Welcome to the WebSocket server');

  // Listen for messages from the client
  ws.on('message', (message) => {
    console.log('Received:', message.toString());
    // Broadcast the message to all other clients
    broadcastMessage(message.toString(), ws);
  });

  // Remove client on disconnect
  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket Error:', error);
  });
});

// Broadcast function (excluding the sender)
function broadcastMessage(message: string, sender: WebSocket) {
  for (const client of clients) {
    // Only send to other clients, not the sender
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(`Broadcast: ${message}`);
    }
  }
  console.log(`Broadcasted: ${message} (excluding the sender)`);
}
