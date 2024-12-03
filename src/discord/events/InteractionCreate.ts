import { Client, CommandInteraction, CommandInteractionOptionResolver, Events, Interaction, Collection, AutocompleteInteraction } from 'discord.js';
import { check_level } from '../util/permissions';

export default {
    name: Events.InteractionCreate,
    async execute(client: Client, interaction: any) {

        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName)
            if (!command) return console.error(`No command matching ${interaction.commandName} was found.`)
            if (command) {
                const level = await check_level(interaction)
                // console.log(command.require_perm)
                if (level < command.require_perm) {
                    console.log(`${interaction.user.username} tried to run "${interaction.commandName}" with level ${level}. Requires ${command.require_perm}`);
                    try {
                        return await interaction.reply({
                            content: "You don't have permission to use this command!",
                            ephemeral: true,
                        });
                    } catch (err) {
                        return
                    }
                }
                if (interaction.isChatInputCommand()) {// type == 2 || isChatInputCommand()
                    await command.execute(client, interaction)
                } else if (interaction.type == "4") { // isAutoComplete() function not availabe for some reason ??
                    try {
                        await command.autocomplete(client, interaction)

                    } catch (error) {
                        console.log(error)
                    }
                }
            }
        }

        const buttons = client.buttons.get(interaction.customId)
        if (buttons) {
            // console.log(interaction)
            if (interaction.type == "3") {// type == button || 3
                await buttons.execute(client, interaction)
            }
        }
    },
};
