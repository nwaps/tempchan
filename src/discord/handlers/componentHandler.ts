import { Client, REST, Routes, Collection, CommandInteractionOptionResolver } from 'discord.js';
import { readdirSync } from 'fs';
import path from 'path'

export async function loadComponents(client: Client) {
    const rootFolder = path.join(__dirname, "../components")
    const componentsFolder = readdirSync(rootFolder);
    // console.log(componentsFolder)
    for (const folder of componentsFolder) {
        const componentFiles = readdirSync(`${rootFolder}/${folder}`).filter((file) => file.endsWith('.js'));

        const { buttons, modals, menus } = client;

        switch (folder) {
            case 'buttons':
                for (const file of componentFiles) {
                    // const { data }: { data: { name: string } } = require(`${rootFolder}/${folder}/${file}`);
                    const data = require([rootFolder, folder, file].join('/'))
                    buttons.set(data.data.name, data)
                    //   buttons.set(data.name, data);
                }
                break;
            case 'modals':
                for (const file of componentFiles) {
                    //   const { data }: { data: { name: string } } = require(`${rootFolder}/${folder}/${file}`);
                    const data = require([rootFolder, folder, file].join('/'))
                    // console.log(data)
                    modals.set(data.name, data)
                    //   modals.set(data.name, { data });
                }
                break;
            case 'menus':
                for (const file of componentFiles) {
                    // const { data }: { data: { name: string } } = require(`${rootFolder}/${folder}/${file}`);
                    const data = require([rootFolder, folder, file].join('/'))
                    // console.log(data)
                    menus.set(data.name, data)
                    //   selectMenus.set(data.name, { data });
                }
                break;
            default:
                break;
        }
    }

}