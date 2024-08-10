/*                             INDEX.TS
  Entry point into the backend server application. Responsible for spinning off
  the express app which will carry out the handling of incoming http requests.
*/

// Required configuration so runtime errors refer to typescript files,
// not the output javascript files
import 'source-map-support/register.js';
// Import local config file
import config from './config.js';
import express from 'express';
import busboy from 'connect-busboy';
// Import various middleware
import debug_request from './src/middleware/debug_echo';
import form_parser from './src/middleware/form_parser';
// Import route endpoints
import chat_routes from './src/routes/chat_routes';

const app = express();

// Register middleware
app.use(busboy({ immediate: true })); // Prereq for custom form parser middleware
app.use(form_parser);
app.use(debug_request); // Use debug middleware to print out request data as the server recieves requests

// Register routes
app.use(chat_routes);

// Start server
app.listen(config.PORT, () => {
    console.log(`Listening on port ${config.PORT}`);
});