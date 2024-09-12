import { Client, CommandInteractionOptionResolver, Events, Message } from 'discord.js';
import emit_chat from '../../sockets/emit_chat';
import { message_model } from "../../models/message"

export default {
  name: Events.MessageCreate,
  async execute(client: Client, message: Message) {
    if(message.author.bot) return;
    // TODO send images from discord to livechan

    if(message.channelId !== "907173398302564393") return;
    const message_data = new message_model ({
      post_id: Number(message.id),
      board: 'int',
      chat: 'General', 
      name: message.author.username,
      body: message.content,
      date: Date.now(),
      ip: '255.255.255.255',
      user_agent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      original_poster: false,
      from_discord: true
    });


    await message_data.save();
    emit_chat("int", message_data);
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