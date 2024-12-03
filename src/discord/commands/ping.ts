import { SlashCommandBuilder, Message, Client, CommandInteraction } from 'discord.js';
import { Permissions } from '../models/permissions'


export default {
  require_perm: Permissions.USER,
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Dong!'),
  async execute(client: Client, interaction: Message) {
    await interaction.reply('Pong!');
  },
};
