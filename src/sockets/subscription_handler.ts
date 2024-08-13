/*                        SUBSCRIPTION_HANDLER.TS
  Implements the handlers responsible for recording users joining and leaving
  boards
*/

import emit_user_count from "./emit_user_count";
import { socket_data } from "./socket"

export const sub_handler = (data: any) => {
    socket_data.socket?.join(data);
    emit_user_count(data);
}

export const unsub_handler = (data: any) => {
    socket_data.socket?.leave(data);
    emit_user_count(data);
}