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

// Import route endpoints
import chat_routes from './src/routes/chat_routes.js';

const app = express();

// Register routes
app.use(chat_routes);

// Start server
app.listen(config.PORT, () => {
    console.log(`Listening on port ${config.PORT}`);
});