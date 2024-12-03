import { Client, ButtonBuilder, ButtonStyle, ActionRowBuilder, ButtonInteraction, TextBasedChannel, BaseGuildTextChannel } from 'discord.js';
import { get_settings, set_settings } from '../../util/settings';
import { get } from 'lodash';

module.exports = {
    data: { name: "remove-link" },
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
        await set_settings(interaction.guildId, { channels: { monoko: "" }, webhooks: { url: ""} })

        const confirm_link = new ButtonBuilder()
            .setCustomId("confirm-link")
            .setLabel("YES! Connect to Monoko!")
            .setStyle(ButtonStyle.Success)
            .setDisabled(true)
        const remove_link = new ButtonBuilder()
            .setCustomId("remove-link")
            .setLabel("NO! We don't want it!")
            .setStyle(ButtonStyle.Danger)
            .setDisabled(true)
        const row = new ActionRowBuilder().addComponents(confirm_link).addComponents(remove_link);

    await interaction.update({
        embeds: [{
            title: `Disconnected!`,
            description: `Goodbye!`,
            color: 0xff0000,
        }],
        components: [row],
    });
},
};

