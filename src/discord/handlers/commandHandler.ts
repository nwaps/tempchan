import { Client, REST, Routes, Collection, CommandInteractionOptionResolver } from 'discord.js';
import path from 'path';
import fs from 'fs';
import config from '../../../config';
import os from 'os';

export async function loadCommands(client: Client) {
  const commandsPath = path.join(__dirname, '../commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  const commands = new Collection<string, any>();
  const commandArray: any[] = [];

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath).default;
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
      // console.log(command.data)
      commands.set(command.data.name, command);
      commandArray.push(command.data.toJSON());
    } else {
      console.warn(`The command file at ${filePath} is missing the "data" or "execute" property.`);
    }
  }

  const clientId = config.CLIENTID;
  const devGuild = "1312736738044547102";
  const rest = new REST().setToken(config.DISCORD_TOKEN);
  try {
    console.log(`Started refreshing ${commandArray.length} application (/) commands.`);

    // The put method is used to fully refresh all commands in the guild with the current set
    // const data = await rest.put(Routes.applicationGuildCommands(config.clientId, "885480544417222657"), { body: commands });
    const route = os.hostname() === 'livechan'
      ? Routes.applicationGuildCommands(clientId, devGuild)
      : Routes.applicationCommands(clientId);
    try {
      const data: any = await rest.put(route, { body: commandArray });
      console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
      console.log(error)
      console.log("Failed to deploy commands")
    }
    // console.log(data)

  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
}
