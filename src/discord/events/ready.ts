import { Client, Events } from 'discord.js';

export default {
  name: Events.ClientReady,
  execute(client: Client) {
    console.log(`Logged in as ${client.user?.tag}!`);
  },
};
