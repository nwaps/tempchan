import { Client, CommandInteraction, CommandInteractionOptionResolver, Events, Interaction, Collection } from 'discord.js';

export default {
  name: Events.InteractionCreate,
  execute(client: Client, interaction: any) {

    const command = client.commands.get(interaction.commandName)
    if(command) {
      command.execute(client, interaction)
    }
  },
};
