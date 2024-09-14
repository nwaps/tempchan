import { Client, CommandInteraction, CommandInteractionOptionResolver, Events, Interaction, Collection, AutocompleteInteraction } from 'discord.js';

export default {
    name: Events.InteractionCreate,
    execute(client: Client, interaction: any) {
        const command = client.commands.get(interaction.commandName)
        if (command) {
            if (interaction.isChatInputCommand()) {// type == 2 
                command.execute(client, interaction)
            } else if (interaction.type == "4") { // isAutoComplete() function not availabe for some reason ??
                try {
                    command.autocomplete(client, interaction)

                } catch (error) {
                    console.log(error)
                }
            }
        }
    },
};
