import fs from "fs";
import path from "path";
const SERVER_CONF = path.resolve(__dirname,`../config/server.json`);

export function hasInstalledModules() {
    return fs.existsSync(path.join(process.cwd(), 'node_modules'));
}
export async function readConfig(){
    let configValue = await fs.readFileSync(path.resolve(process.cwd(), SERVER_CONF), 'utf-8');
    return JSON.parse(configValue);
}
export async function writeConfig(data){
    await fs.writeFileSync(path.resolve(process.cwd(), SERVER_CONF), JSON.stringify(data));
}
export async function getServerUrl(){
    let config = await readConfig();
    return config.serverUrl;
}
