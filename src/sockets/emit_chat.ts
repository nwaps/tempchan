/*                            EMIT_CHAT.TS
  Responsible for forwarding newly created chat messages to all connected
  clients who are in the same chat as the sender of the new message
*/

import { socket_data } from "./socket";

export default (board: string, data: any) => {
    socket_data.io?.sockets.in(board).emit('chat', JSON.stringify(data));
};