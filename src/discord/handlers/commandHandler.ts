import { Client, REST, Routes, Collection } from 'discord.js';
import path from 'path';
import fs from 'fs';
import config from '../../../config';

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
      commands.set(command.data.name, command);
      commandArray.push(command.data.toJSON());
    } else {
      console.warn(`The command file at ${filePath} is missing the "data" or "execute" property.`);
    }
  }

  const clientId = config.CLIENTID;
  const guildId =  config.GUILDID;
  const rest = new REST({ version: '10' }).setToken(config.DISCORD_TOKEN);

  try {
    console.log(`Started refreshing ${commandArray.length} application (/) commands.`);
    const data: any = await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commandArray });
    console.log(`Successfully reloaded ${data.length} application (/) commands to ${guildId}.`);
  } catch (error) {
    console.error('Error while registering commands:', error);
  }
}
