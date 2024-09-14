import { Client, AutocompleteInteraction, CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { get_settings, set_settings, unflattened_settings } from '../util/settings';

export default {
    data: new SlashCommandBuilder()
        .setName('link')
        .setDescription('Link the current channel to livechan')
    ,
    async execute(client: Client, interaction: any) {
        if (!interaction.isCommand()) return;

        await set_settings(interaction.guildId, {channels:{livechan :interaction.channel.id}})

        // Respond with the selected option
        await interaction.reply(`Channel ${interaction.channel.id} to livechan`);
    },
};