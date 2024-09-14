import { Client, CommandInteractionOptionResolver, Events, Message, basename } from 'discord.js';
import emit_chat from '../../sockets/emit_chat';
import { message_model } from "../../models/message"
import { process_file } from '../util/download_file';
import path from 'path';
import config from '../../../config';
import { get_settings } from '../util/settings';

export default {
    name: Events.MessageCreate,
    async execute(client: Client, message: Message) {
        if (message.author.bot) return;
        // TODO store settings in the database

        const settings = await get_settings(message.guildId) // should probably cache this on the client
        if (message.channelId !== settings.channels.livechan) return;
        var message_object = {}

        const mostRecent = await message_model.findOne({}, {}, { sort: { 'post_id': -1 } }).exec();

        message_object = {
            post_id: mostRecent ? mostRecent.post_id + 1 : 0,
            board: 'int',
            chat: 'General',
            name: message.author.username,
            body: message.content,
            date: Date.now(),
            ip: '255.255.255.255',
            user_agent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
            original_poster: false,
            from_discord: true,
        }

        if (message.attachments.size > 0) {
            const attachment = message.attachments.first();
            const file_url = attachment?.url;
            if (file_url) {
                const image_meta = await process_file(file_url)
                message_object = {
                    ...message_object,
                    image: image_meta.file_path,
                    image_width: image_meta.img_metadata.image_width,
                    image_height: image_meta.img_metadata.image_height,
                    image_filename: basename(attachment?.url),
                    image_filesize: attachment.size // this is wrong but i don't want to be right
                }
            }
        }

        const message_data = new message_model(message_object);


        await message_data.save();
        emit_chat("int", message_data);
    },
};

