import {getModulesList as getModules} from "../util/serverRequests";
export async function getModulesList(serverUrl, userObj) {
    return getModules(serverUrl,userObj);
}