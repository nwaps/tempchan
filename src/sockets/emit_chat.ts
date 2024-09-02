/*                            EMIT_CHAT.TS
  Responsible for forwarding newly created chat messages to all connected
  clients who are in the same chat as the sender of the new message
*/

import { socket_data } from "./socket";
import config from "../../config";
import { WebhookClient } from "discord.js";

export default (board: string, data: any) => {
    socket_data.io?.sockets.in(board).emit('chat', JSON.stringify(data));

    if(data.from_discord) return
    
    const webhook = new WebhookClient({url: config.WEBHOOK})

    webhook.edit({
      name: data.name,
      avatar: 'https://litterbox.catbox.moe/resources/qts/1458602218407.png',
    }).then(() => {
      webhook.send({content: data.body})
    })



};