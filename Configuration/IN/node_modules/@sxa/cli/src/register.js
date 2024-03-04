import { readConfig, writeConfig } from "../util/configHelper";

export async function registerUrl(url) {
    const config = await readConfig();
    config.serverUrl = url.url;
    await writeConfig(config);
}
export async function getUrl() {
    const config = await readConfig();
    return config.serverUrl;
}
