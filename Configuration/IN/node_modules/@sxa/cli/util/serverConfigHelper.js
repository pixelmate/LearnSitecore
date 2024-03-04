import fs from "fs";
import path from "path";
const SERVER_CONF =  `./gulp/serverConfig.json`;

export async function readConfig() {
    let configValue = await fs.readFileSync(path.resolve(process.cwd(), SERVER_CONF), 'utf-8');
    return JSON.parse(configValue);
}