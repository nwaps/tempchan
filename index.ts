/*                             INDEX.TS
  Entry point into the backend server application. Responsible for spinning off
  the express app which will carry out the handling of incoming http requests.
*/

// Required configuration so runtime errors refer to typescript files,
// not the output javascript files
import 'source-map-support/register.js';

// Import local config file
import config from './config.js';

// Import misc packages/functions
import http from 'http';
import path from 'path';
import express from 'express';
import busboy from 'connect-busboy';
import { Server, Socket } from 'socket.io';
import mongoose from 'mongoose';
import connection_handler from './src/sockets/connection_handler.js';

// Import various middleware
import debug_request from './src/middleware/debug_echo';
import form_parser from './src/middleware/form_parser';

// Import route endpoints
import chat_routes from './src/routes/chat_routes';
import { socket_data } from './src/sockets/socket.js';
import ip_check from './src/middleware/ip_check.js';

// Configure global context to save the root of the project
const root = path.join(__dirname, '..');
declare global {
    var ROOT: string
}
global.ROOT = root;

// Initialize Database
mongoose.connect(`mongodb://${config.DB_HOST}/${config.DB_ADDR}`);

// Initialize web server and sockets
const app = express();
const server = http.createServer(app);
app.use(express.static(path.join(root, '/public')));
socket_data.io = new Server(server);

// Register universal middleware
app.use(ip_check);
app.use(busboy({ immediate: true, limits: { fileSize: config.FILESIZE_LIMIT} })); // Prereq for custom form parser middleware
app.use(form_parser);
app.use(debug_request); // Use debug middleware to print out request data as the server recieves requests

// Register routes
app.use(chat_routes);

// Start server and socket connection
server.listen(config.PORT, () => {
    console.log(`Listening on port ${config.PORT}`);
});
socket_data.io.on('connection', connection_handler);