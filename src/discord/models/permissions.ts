import { client } from '../bot'

enum Permissions {
    USER = 0,
    BOOSTER = 1,
    JANNY = 2,
    MOD = 3,
    ADMIN = 4,
    SERVER_OWNER = 8,
    BOT_OWNER = 10
}

const perm_matrix = {
    levels: [
        {
            level: Permissions.USER,
            name: "User",
            check: () => true,
        },
        {
            level: Permissions.BOOSTER,
            name: "Booster",
            check: (message: any) => {
                try {
                    if (!message.guild.roles.premiumSubscriberRole) return false;
                    const booster_role = message.guild.roles.cache.find((r: any) => message.guild.roles.premiumSubscriberRole.id === r.id);
                    if (booster_role && message.member.roles.cache.has(booster_role.id)) return true;
                } catch (e) {
                    return false;
                }
            },
        },
        {
            level: Permissions.JANNY,
            name: "Janny",
            check: (message: any) => {
                try {
                    if (!message.settings.roles.janny) return false;
                    const janny_role = message.guild.roles.cache.find((r: any) => message.settings.roles.janny === r.id);
                    if (janny_role && message.member.roles.cache.has(janny_role.id)) return true;
                } catch (e) {
                    return false;
                }
            },
        },
        {
            level: Permissions.MOD,
            name: "Moderator",
            check: (message: any) => {
                try {
                    if (!message.settings.roles.mod) return false;
                    const mod_role = message.guild.roles.cache.find((r: any) => message.settings.roles.mod === r.id);
                    if (mod_role && message.member.roles.cache.has(mod_role.id)) return true;
                } catch (e) {
                    return false;
                }
            },
        },
        {
            level: Permissions.ADMIN,
            name: "Administrator",
            check: (message: any) => {
                try {
                    if (!message.settings.roles.admin) return false;
                    const admin_role = message.guild.roles.cache.find((r: any) => message.settings.roles.admin === r.id);
                    if (admin_role && message.member.roles.cache.has(admin_role.id)) return true;
                } catch (e) {
                    return false;
                }
            },
        },
        {
            level: Permissions.SERVER_OWNER,
            name: "Server Owner",
            check: (message: any) => (message.guild.ownerId === message.user.id ? true : false),
        },
        {
            level: Permissions.BOT_OWNER,
            name: "Bot Owner",
            check: (message: any) => (client.owner ? client.owner.id === message.user.id : false),
        },
    ]
}


export { perm_matrix, Permissions };