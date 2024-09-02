import { Client, Events, Message } from 'discord.js';
import add_chat from '../../add_chat';
import format_chat_data from '../../middleware/format_chat_data';

export default {
  name: Events.MessageCreate,
  execute(client: Client, message: Message) {
    if(message.author.bot) return;
    // TODO format message data for middleware and db
  },
};