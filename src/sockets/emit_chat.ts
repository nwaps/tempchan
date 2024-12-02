/*                            EMIT_CHAT.TS
  Responsible for forwarding newly created chat messages to all connected
  clients who are in the same chat as the sender of the new message
*/

import { socket_data } from "./socket";
import config from "../../config";
import { WebhookClient, WebhookMessageCreateOptions } from "discord.js";
import { get_all_settings } from "../discord/util/settings";

export default (board: string, data: any) => {
    socket_data.io?.sockets.in(board).emit('chat', JSON.stringify(data));

    if (data.chat == "General") { // global chat, send to all
        get_all_settings()
            .then((settings) => {
                settings.forEach(set => {
                    if (set.guildId == data.from_discord) return
                    const webhookurl = set.settings.webhooks.url.toString()
                    const webhook = new WebhookClient({ url: webhookurl })

                    webhook.edit({
                        name: data.name,
                        avatar: 'https://litterbox.catbox.moe/resources/qts/1458602218407.png',
                    }).then(() => {
                        // Create an object for the webhook message options
                        const options: WebhookMessageCreateOptions = {};

                        if (data.body !== undefined) {
                            options.content = data.body;
                        }

                        if (data.image) {
                            options.content += `\n\nThis message contains an image from livechan. [Upgrade to gold to view](http://livechan.goodhew.lol:3000/chat/${data.board})`
                            // options.files = [{
                                // attachment: data.image
                            // }];
                        }

                        // Send the webhook message
                        webhook.send(options);
                    }).catch(console.error);
                })
            })
    } else {
        // local chat send to specific server
    }





};