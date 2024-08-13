/*                          CONNECTION_HANDLER.TS
  Acts as the central handler for when client socket connections are created.
  The primary responsibility of the connection handler is to create the handlers
  for additional socket events, such as chat subscriptions, and unsubscriptions
*/

import { Socket } from "socket.io";
import { socket_data } from "./socket";
import { sub_handler, unsub_handler } from "./subscription_handler";

export default (socket: Socket) => {
    socket_data.socket = socket;

    // Connect the unsubscribe and subscribe events to their respective handlers
    socket.on('subscribe', sub_handler);
    socket.on('unsubscribe', unsub_handler);
}