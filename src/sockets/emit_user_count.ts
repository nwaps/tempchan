/*                             EMIT_USER_COUNT.TS
  Responsible for forwarding the number of users connected to a given board to
  all clients currently connected to said board
*/

import { socket_data } from "./socket"

export default (board: string) => {
    const num_clients = socket_data.io?.of(board).server.engine.clientsCount;
    socket_data.io?.in(board).emit('user_count', num_clients);
}