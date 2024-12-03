import { Client, ButtonBuilder, ButtonStyle, ActionRowBuilder, ButtonInteraction, TextBasedChannel, BaseGuildTextChannel } from 'discord.js';
import { set_settings } from '../../util/settings';

module.exports = {
    data: { name: "confirm-link" },
    async execute(client: Client, interaction: any) {
        if (!interaction.guild) return
        if (!interaction.channel) return

        let channel = await interaction.guild.channels.fetch(interaction.channel.id) as BaseGuildTextChannel
        if (!channel) return

        let webhooks = await channel.fetchWebhooks()
        if (webhooks.size == 0) {
            await channel.createWebhook({ name: 'Monoko' })
            webhooks = await channel.fetchWebhooks()
        }
        let webhook = webhooks.first()
        if (!webhook) return
        await set_settings(interaction.guildId, { channels: { monoko: interaction.channel.id }, webhooks: { url: webhook.url, } })

        const confirm_link = new ButtonBuilder()
            .setCustomId("confirm-link")
            .setLabel("YES! Connect to Monoko!")
            .setStyle(ButtonStyle.Success)
            .setDisabled(true)
        const row = new ActionRowBuilder().addComponents(confirm_link);

        await interaction.update({
            embeds: [{
                title: `Linking confirmed!`,
                description: `This channel is now linked to Monoko!`,
                color: 0x00ff00,
            }],
            components: [row],  
        });
    },
};

