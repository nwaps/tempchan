/*                              SOCKET.TS
  Responsible for storing the global io object used for transmitting data along
  sockets. The io object is initialized to a valid socket.io server object on
  server start up.
*/

import { Server } from "socket.io";

export interface s_data {
    io: Server | null;
}

export const socket_data : s_data = {
    io: null
}