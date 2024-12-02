import { Client, AutocompleteInteraction, CommandInteraction, Webhook, CommandInteractionOptionResolver } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { get_settings, set_settings, unflattened_settings } from '../util/settings';

export default {
    data: new SlashCommandBuilder()
        .setName('link')
        .setDescription('Link the current channel to livechan')
    ,
    async execute(client: Client, interaction: any) {
        if (!interaction.isCommand()) return;

        let channel = await interaction.guild.channels.fetch(interaction.channel.id);
        let webhooks = await channel.fetchWebhooks()

        if (webhooks.size == 0) {
            await channel.createWebhook({ name: 'livechan' })
            webhooks = await channel.fetchWebhooks()
        }

        let webhook = webhooks.first()

        await set_settings(interaction.guildId, { channels: { livechan: interaction.channel.id, url: webhook.url} })
        // await set_settings(interaction.guildId )


        const settings = await get_settings(interaction.guildId) // should probably cache this on the client
        // console.log(settings.channels.webhook)

        // Respond with the selected option
        await interaction.reply(`Channel ${interaction.channel.id} to livechan`);
    },
};