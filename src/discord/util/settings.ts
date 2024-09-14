import settings_model, { complex_setting } from "../models/settings";
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Interaction, Message, ButtonInteraction, BaseInteraction, BaseMessageOptions, MessageInteraction } from "discord.js";
import { merge } from 'lodash'; // npm install --save-dev @types/lodash

const ITEMS_PER_PAGE = 5;

const defaultSettings = {
    roles: {
        admin: '914823944941473822',
        member: null,
    },
    channels: {
        livechan: '906056146341748737',
    },
    random: {
        item: 'test',
    }
};

function flatten_settings(obj: any, prefix = ''): Record<string, string> {
    let items: Record<string, string> = {};

    for (const [key, value] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            // Recursive call to flatten nested objects
            items = { ...items, ...flatten_settings(value, newKey) };
        } else {
            items[newKey] = value ? value.toString() : '';
        }
    }

    return items;
}

function unflattened_settings(flatObject: { [key: string]: any }): { [key: string]: any } {
    const result: { [key: string]: any } = {};

    for (const key in flatObject) {
        if (flatObject.hasOwnProperty(key)) {
            const value = flatObject[key];
            const keys = key.split('.');

            keys.reduce((acc, part, index) => {
                if (index === keys.length - 1) {
                    acc[part] = value;
                } else {
                    if (!acc[part]) {
                        acc[part] = {};
                    }
                    return acc[part];
                }
            }, result);
        }
    }

    return result;
}


function create_embed_for_page(settings: Array<{ key: string; value: any }>, page: number): EmbedBuilder {
    const embed = new EmbedBuilder()
        .setTitle(`Server Settings - Page ${page + 1}`)
        .setColor('#0099ff')
        .setTimestamp()
        .setFooter({ text: 'Settings' });

    // get number of embeds for page
    const start = page * ITEMS_PER_PAGE;
    const end = Math.min(start + ITEMS_PER_PAGE, settings.length);

    // ddd fields to current page
    for (let i = start; i < end; i++) {
        const { key, value } = settings[i];

        // Format the value depending on its type
        let displayValue: string;
        if (typeof value === 'object' && value !== null) {
            // Handle nested objects (roles and channels)
            if (key === 'roles') {
                displayValue = Object.entries(value)
                    .map(([subKey, subValue]) => subValue ? `${subKey} = <@&${subValue}>` : `${subKey} = None`)
                    .join('\n');
            } else if (key === 'channels') {
                displayValue = Object.entries(value)
                    .map(([subKey, subValue]) => subValue ? `${subKey} = <#${subValue}>` : `${subKey} = None`)
                    .join('\n');
            } else {
                displayValue = Object.entries(value)
                    .map(([subKey, subValue]) => subValue ? `${subKey} = ${subValue}` : `${subKey} = None`)
                    .join('\n');
            }
        } else {
            displayValue = value ? value.toString() : 'None';
        }

        embed.addFields({
            name: key.charAt(0).toUpperCase() + key.slice(1),
            value: displayValue,
        });
    }

    return embed;
}

async function build_paged_embed(interaction: Interaction, settings: Array<{ key: string; value: any }>): Promise<void> {
    const total_pages = Math.ceil(settings.length / ITEMS_PER_PAGE);

    // craate the next / prev buttons
    let current_page = 0;
    let embed = create_embed_for_page(settings, current_page);

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('prev_page')
                .setLabel('Previous')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(current_page === 0),
            new ButtonBuilder()
                .setCustomId('next_page')
                .setLabel('Next')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(total_pages <= 1)
        );

    if (!interaction.isCommand()) return
    const message = await interaction.reply({
        embeds: [embed],
        components: [row],
        fetchReply: true
    }) as Message;
    // handle button interactions
    const filter = (i: any) => i.customId === 'prev_page' || i.customId === 'next_page';
    const collector = message.createMessageComponentCollector({ filter, time: 60000 });



    collector.on('collect', async (i: ButtonInteraction) => {
        if (i.user.id !== interaction.user.id) {
            return i.reply({ content: 'You cannot interact with these buttons.', ephemeral: true });
        }

        if (i.customId === 'next_page') {
            current_page = Math.min(current_page + 1, total_pages - 1);
        } else if (i.customId === 'prev_page') {
            current_page = Math.max(current_page - 1, 0);
        }

        embed = create_embed_for_page(settings, current_page);
        const next_row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('prev_page')
                    .setLabel('Previous')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(current_page === 0),
                new ButtonBuilder()
                    .setCustomId('next_page')
                    .setLabel('Next')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(current_page >= total_pages - 1)
            );

        await i.update({
            embeds: [embed],
            components: [next_row]
        });
    });

    collector.on('end', () => {
        // Disable buttons after the collector ends
        message.edit({
            components: [
                new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('prev_page')
                            .setLabel('Previous')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId('next_page')
                            .setLabel('Next')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true)
                    )
            ]
        });
    });
}

async function get_settings(guildId: string | null) {
    try {
        // get current settings by guild id
        const settingsDoc = await settings_model.findOne({ guildId });

        // merge settings with defaults and return
        if (settingsDoc && settingsDoc.settings) {
            return merge({}, defaultSettings, settingsDoc.settings);
        }

        // no settings exist, return all defualts 
        return defaultSettings;
    } catch (error) {
        console.error('Error fetching settings:', error);
        throw error;
    }
}


async function set_settings(guildId: string | null, new_settings: complex_setting) {
    await settings_model.findOneAndUpdate(
        { guildId },
        { settings: new_settings },
        { upsert: true, new: true }
    );
}

export { set_settings, get_settings, build_paged_embed, flatten_settings, unflattened_settings };