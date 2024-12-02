import { Client, Guild, Events, Routes, REST } from 'discord.js';
import config from '../../../config';

export default {
    name: Events.GuildCreate,
    async execute(client: Client, guild: Guild) {
        let commandArray: any = [];
        client.commands.map(command => {
            let anycom: any = command;
            commandArray.push(anycom.data.toJSON())
        })

        const clientId = config.CLIENTID;
        const rest = new REST().setToken(config.DISCORD_TOKEN);
        try {
            console.log(`Started refreshing application (/) commands.`);

            // The put method is used to fully refresh all commands in the guild with the current set
            // const data = await rest.put(Routes.applicationGuildCommands(config.CLIENTID, "885480544417222657"), { body: commandArray });

            try {
                const data: any = await rest.put(Routes.applicationGuildCommands(clientId, guild.id), { body: commandArray });
                console.log(`Successfully reloaded ${data.length} application (/) commands.`);
            } catch (error) {
                console.log("Failed to deploy commands")
            }

        } catch (error) {
            // And of course, make sure you catch and log any errors!
            console.error(error);
        }
        console.log(guild)
    },
};
