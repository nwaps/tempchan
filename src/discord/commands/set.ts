import { Client, AutocompleteInteraction, CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { get_settings, set_settings, unflattened_settings } from '../util/settings';
import { flatten_settings } from '../util/settings';

export default {
    data: new SlashCommandBuilder()
        .setName('set')
        .setDescription('An example command with autocomplete.')
        .addStringOption(option =>
            option.setName('option')
                .setDescription('Choose which setting option you would like to modify')
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addStringOption(option => 
            option.setName('value')
                .setDescription('New value of the setting option')
                .setRequired(true)
        ),
    async autocomplete(client: Client, interaction: AutocompleteInteraction) {
        const autocomplete_options = await get_settings(interaction.guildId)
        const flattened_settings = flatten_settings(autocomplete_options)
        const focused_option = interaction.options.getFocused();
        const filtered_options = Object.keys(flattened_settings).filter(option =>
            option.toLowerCase().includes(focused_option.toLowerCase())
        );

        // Provide the autocomplete results
        await interaction.respond(
            filtered_options.map(option => ({
                name: option,
                value: option
            }))
        );
    },
    async execute(client: Client, interaction: any) {
        if (!interaction.isCommand()) return;

        const command_option = interaction.options.getString('option', true);
        const command_value = interaction.options.getString('value');
        var flat_obj = {}
        if(command_option.includes('.')) {
            flat_obj = { [command_option]: command_value}
            const unflat = unflattened_settings(flat_obj)
            await set_settings(interaction.guildId, unflat)
        } else {
            flat_obj = { [command_option]: command_value}
            await set_settings(interaction.guildId, flat_obj)
        }


        if (!command_value) {
            await interaction.reply('No setting key provided.');
            return;
        }

        // Respond with the selected option
        await interaction.reply(`You updated: ${command_option} with new value ${command_value}`);
    },




};