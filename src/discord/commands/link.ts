import { Client, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { Permissions } from '../models/permissions';

export default {
    require_perm: Permissions.ADMIN,
    data: new SlashCommandBuilder()
        .setName('link')
        .setDescription('Link the current channel to Monoko')
    ,
    async execute(client: Client, interaction: any) {
        if (!interaction.isCommand()) return;

        const confirm_link = new ButtonBuilder()
            .setCustomId("confirm-link")
            .setLabel("YES! Connect to Monoko!")
            .setStyle(ButtonStyle.Success)

        const remove_link = new ButtonBuilder()
            .setCustomId("remove-link")
            .setLabel("NO! We don't want it!")
            .setStyle(ButtonStyle.Danger);

        await interaction.reply({
            embeds: [
                {
                    type: "rich",
                    title: `Are you sure you would like to link this channel?`,
                    description: `By linking this channel, you will receive all messages in the overboard and send all messages from this channel to the overboard`,
                    color: 0x00ffff,
                },
            ],
            components: [new ActionRowBuilder().addComponents(confirm_link).addComponents(remove_link)],
        });




    },
};