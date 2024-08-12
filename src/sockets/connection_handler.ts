/*                          CONNECTION_HANDLER.TS
  Acts as the central handler for when client socket connections are created.
  The primary responsibility of the connection handler is to create the handlers
  for additional socket events, such as chat subscriptions, and unsubscriptions
*/

import { Server, Socket } from "socket.io";

export default (socket: Socket) => {
    socket.on('subscribe', (data) => {
    });

    socket.on('unsubscribe', (data) => {
    });
}