import { SlashCommandBuilder, Message, Client, CommandInteraction } from 'discord.js';


export default {
  require_perm: 0,
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Dong!'),
  async execute(client: Client, interaction: Message) {
    await interaction.reply('Pong!');
  },
};
