import { SlashCommandBuilder, Interaction, Client } from "discord.js";
import { get_settings } from "../util/settings";
import { build_paged_embed } from "../util/settings";


export default {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('Displays the server settings with pagination'),
    async execute(client: Client, interaction: Interaction): Promise<void> {
        if (!interaction.isCommand()) return;

        if (interaction.commandName === 'settings') {
            // Fetch settings
            let settings: any;
            try {
                settings = await get_settings(interaction.guildId!);
            } catch (error) {
                await interaction.reply('Failed to fetch settings.');
                return;
            }

            // Convert settings object to an array of key-value pairs
            const settings_array = Object.entries(settings).map(([key, value]) => ({ key, value }));

            await build_paged_embed(interaction, settings_array);
        }
    },
};