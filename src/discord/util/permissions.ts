import settings_model, { complex_setting } from "../models/settings";
import { Client, CommandInteractionOptionResolver } from "discord.js";
import { get_settings } from "./settings";
import { client } from "../bot";

const perm = {
    levels: [
        // This is the lowest permisison level, this is for non-roled users.
        {
            level: 0,
            name: "User",
            // Don't bother checking, just return true which allows them to execute any command their
            // level allows them to.
            check: () => true,
        },
        {
            level: 1,
            name: "Booster",
            check: (message: any) => {
                try {
                    if (!message.guild.roles.premiumSubscriberRole) return false
                    const booster_role = message.guild.roles.cache.find((r: any) => message.guild.roles.premiumSubscriberRole.id == r.id)
                    if (booster_role && message.member.roles.cache.has(booster_role.id)) return true
                } catch (e) {
                    return false;
                }
            },
        },
        // This is your permission level, the staff levels should always be above the rest of the roles.
        {
            level: 2,
            // This is the name of the role.
            name: "Janny",
            // The following lines check the guild the message came from for the roles.
            // Then it checks if the member that authored the message has the role.
            // If they do return true, which will allow them to execute the command in question.
            // If they don't then return false, which will prevent them from executing the command.
            check: (message: any) => {
                try {
                    if (!message.settings.roles.janny) return false
                    const janny_role = message.guild.roles.cache.find((r: any) => message.settings.roles.janny = r.id);
                    if (janny_role && message.member.roles.cache.has(janny_role.id)) return true;
                } catch (e) {
                    return false;
                }
            },
        },
        // This is your permission level, the staff levels should always be above the rest of the roles.
        {
            level: 3,
            // This is the name of the role.
            name: "Moderator",
            // The following lines check the guild the message came from for the roles.
            // Then it checks if the member that authored the message has the role.
            // If they do return true, which will allow them to execute the command in question.
            // If they don't then return false, which will prevent them from executing the command.
            check: (message: any) => {
                try {
                    if (!message.settings.roles.mod) return false
                    const mod_role = message.guild.roles.cache.find((r: any) => message.settings.roles.mod == r.id);
                    if (mod_role && message.member.roles.cache.has(mod_role.id)) return true;
                } catch (e) {
                    return false;
                }
            },
        },

        {
            level: 4,
            name: "Administrator",
            check: (message: any) => {
                try {
                    if (!message.settings.roles.admin) return false
                    const admin_role = message.guild.roles.cache.find((r: any) => message.settings.roles.admin == r.id);
                    if (admin_role && message.member.roles.cache.has(admin_role.id)) return true;
                } catch (e) {
                    return false;
                }
            },
        },
        {
            level: 7,
            name: "Super Admin",
            check: (message: any) => {
                try {
                    if (!message.settings.roles.superadmin) return false
                    const superAdminRole = message.guild.roles.cache.find((r: any) => message.settings.roles.superadmin == r.id);
                    if (superAdminRole && message.member.roles.cache.has(superAdminRole.id)) return true;
                } catch (e) {
                    return false;
                }
            },
        },
        // This is the server owner.
        {
            level: 8,
            name: "Server Owner",
            // Simple check, if the guild owner id matches the message author's ID, then it will return true.
            // Otherwise it will return false.
            check: (message: any) => (message.guild.ownerId == message.user.id ? true : false),
        },

        // Bot Support is a special inbetween level that has the equivalent of server owner access
        // to any server they joins, in order to help troubleshoot the bot on behalf of owners.
        // {
        //     level: 8,
        //     name: "Bot Support",
        //     // The check is by reading if an ID is part of this array. Yes, this means you need to
        //     // change this and reboot the bot to add a support user. Make it better yourself!
        //     check: (message: any) => config.support.includes(message.user.id),
        // },

        // Bot Admin has some limited access like rebooting the bot or reloading commands.
        // {
        //     level: 9,
        //     name: "Bot Admin",
        //     check: (message: any) => config.admins.includes(message.user.id),
        // },

        // This is the bot owner, this should be the highest permission level available.
        // The reason this should be the highest level is because of dangerous commands such as eval
        // or exec (if the owner has that).
        {
            level: 10,
            name: "Bot Owner",
            // Another simple check, compares the message author id to mine.
            check: (message: any) => (client.owner ? client.owner.id == message.user.id ? true : false : false)
        },
    ]
}

async function perm_level(message: any): Promise<Number> {
    let permlvl = 0;
    if (message.author) message.user = message.author;
    if (message.user) message.author = message.user;

    const permOrder = perm.levels.slice(0).sort((p, c) => (p.level < c.level ? 1 : -1));

    // console.log(permOrder)
    while (permOrder.length) {
        const currentLevel = permOrder.shift();
        // console.log(currentLevel)
        if (!currentLevel) throw Error;

        // Skip if the permission level is guild-only and we're not in a guild
        if (!message.guild) continue;

        message.settings = await get_settings(message.guild.id);

        // Check the current permission level
        if (currentLevel.check(message)) {
            // Update highestPermLevel if the current level is higher
            if (currentLevel.level > permlvl) {
                permlvl = currentLevel.level;
            }
        }
    }

    return permlvl;
}

export { perm_level };