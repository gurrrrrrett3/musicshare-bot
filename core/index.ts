import dotenv from "dotenv"
import CoreObject from './core.js';
import Database from "./database/index.js";

dotenv.config()

var Core = new CoreObject({
    token: process.env.TOKEN as string,
    mode: 'selfhost',
    discordDebug: false,
    debug: true,
})

let bot = Core.bot;
let client = Core.Client;

export const db = new Database()

export default Core;
export { bot, client };
