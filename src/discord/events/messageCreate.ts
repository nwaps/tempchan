import { Client, CommandInteractionOptionResolver, Events, Message } from 'discord.js';
import emit_chat from '../../sockets/emit_chat';

export default {
  name: Events.MessageCreate,
  execute(client: Client, message: Message) {
    console.log(message.author)
    if(message.author.bot) return;
    // TODO format message data for middleware and db

    if(message.channelId !== "1280163414638858385") return;
    const data = {
      post_id: Number(message.id),
      board: 'int',
      chat: 'General', 
      name: message.author.username,
      body: message.content,
      date: Date.now(),
      ip: '255.255.255.255',
      user_agent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      orignal_poster: true,
      from_discord: true
    };

    emit_chat("int", data);
  },
};


// {
//   post_id: 16,
//   board: 'int',
//   chat: 'test',
//   name: '123',
//   body: 'asdfasdf',
//   date: 1725282704589,
//   ip: '255.255.255.255',
//   user_agent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
//   original_poster: true
// }