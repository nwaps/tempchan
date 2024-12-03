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
                    if(set.settings.channels.livechan == "" || set.settings.channels.livechan == null) return
                    if (set.guildId == data.from_discord) return
                    const webhookurl = set.settings.webhooks.url.toString()
                    const webhook = new WebhookClient({ url: webhookurl })
                    const options: WebhookMessageCreateOptions = {};
                    options.username = data.name || "livechan";
                    options.avatarURL = data.discord_avatar || 'https://cdn.discordapp.com/avatars/1313062635763138562/e3254f51c050bb0d5ddfe5d21418a387.webp'

                    if (data.body !== undefined) {
                        options.content = data.body;
                    }
                    const url = `https://monoko.chat/chat/${data.board}`
                    if (data.image) {
                        options.content += `\n\nThis message contains an image from livechan. [Upgrade to gold to view](<${url}>)`
                        // options.files = [{
                        // attachment: data.image
                        // }];
                    }

                    // Send the webhook message
                    webhook.send(options);
                })
            })
    } else {
        // local chat send to specific server
    }





};