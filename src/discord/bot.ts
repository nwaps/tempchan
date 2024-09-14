import { Client, Collection, GatewayIntentBits, Partials, Interaction} from 'discord.js';
import config from '../../config';
import { loadCommands } from './handlers/commandHandler';
import { loadEvents } from './handlers/eventHandler';


export interface Command {
    execute(client: Client, interaction: Interaction): void;
    autocomplete(client: Client, interaction: Interaction): void;
}

declare module 'discord.js' {
    interface Client {
        events: Collection<string, Function>;
        commands: Collection<string, Command>;
        settings: any;
    }
}

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.AutoModerationConfiguration,
        GatewayIntentBits.AutoModerationExecution,
    ],
    partials: [Partials.Channel, Partials.Reaction, Partials.Message],
    allowedMentions: {
        parse: ['users'],
        repliedUser: true,
    },
});


client.events = new Collection<string, Function>();
client.commands = new Collection<string, any>();

loadCommands(client);
loadEvents(client);

// Login to Discord
client.login(config.DISCORD_TOKEN);




