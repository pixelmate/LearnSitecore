#!/usr/bin/env node
require = require("esm")(module /*, options*/);
const newTheme = require("../src/new");
const config = require("../src/configTheme");
const init = require("../src/init");
const build = require("../src/build");
const rebuild = require("../src/rebuild");
const upload = require("../src/upload");
const watch = require("../src/watch");
const register = require("../src/register");
const program = require("commander");
process.env.cli = true;
program.version("10.2.0").description("SXA theme bootstrap");

program
    .command("init")
    .alias("i")
    .description(
        "Download all neccessary files for compatibility with creative exchange live mode. Would not replace existing files. Will download only missed."
    )
    .action(async () => {
        await init.initTheme({ ...program });
    });
program
    .command("new [themeName]")
    .alias("n")
    .description(
        "Creates a theme both locally and within your Sitecore instance. Use this command to create a new theme for your site."
    )
    .option(
        "--url <url>",
        "Url to the instance where the theme should be created. You don't have to specify the URL if you want to create the theme in the currently registered Sitecore instance."
    )
    .action(async (themeName, other) => {
        await newTheme.generateTheme({ ...program, themeName, ...other });
    });
program
    .command("register <url>")
    .alias("reg")
    .description(
        'Specifies the default Sitecore instance for the "init" and "new" commands for your working environment. Only one instance can be registered as the default at a time.'
    )
    .action(async (url) => {
        await register.registerUrl({ ...program, url });
    });
program
    .command("get-url")
    .alias("g")
    .description(
        'Returns the current default Sitecore instance URL for the "init" and "new" commands.'
    )
    .action(async () => {
        let url = await register.getUrl();
        console.log(url);
    });

program
    .command("config [themeName]")
    .alias("c")
    .description(
        "Sets up a theme configuration variable by answering a list of questions. Use this command to change the theme configuration."
    )
    .action(async (themeName, other) => {
        await config.configTheme({ ...program, themeName, ...other });
    });
program
    .command("build [taskName]")
    .alias("b")
    .option("-d, --debug", "provides additional debugging information")
    .description("Builds theme assets based on the current theme configuration")
    .action((taskName, other) => {
        build.buildAssets({ ...program, taskName, ...other });
        return;
    });
program
    .command("upload [taskName]")
    .alias("u")
    .description("Upload theme assets based on the theme configuration")
    .option("-d, --debug", "provides additional debugging information")
    .option("-l, --login <login>", "Login for uploading")
    .option("-p, --password <password>", "Password for uploading")
    .option("-u, --url <url>", "Instance url for uploading")
    .action((taskName, other) => {
        upload.uploadAssets({ ...program, taskName, ...other });
        return;
    });
program
    .command("watch [taskName]")
    .alias("w")
    .description(
        'Watches for theme asset changes on the drive and uploads any modified files automatically. Can be configured with "sxa config" command'
    )
    .option("-d, --debug", "provides additional debugging information")
    .option("-l, --login <login>", "Login for watching")
    .option("-p, --password <password>", "Password for watching")
    .option("-u, --url <url>", "Instance url for uploading")
    .action((taskName, other) => {
        watch.watchAssets({ ...program, taskName, ...other });
        return;
    });

program
    .command("rebuild [taskName]")
    .alias("r")
    .description("Rebuild and upload theme assets")
    .option("-d, --debug", "provides additional debugging information")
    .option("-l, --login <login>", "Login for uploading")
    .option("-p, --password <password>", "Password for uploading")
    .option("-u, --url <url>", "Instance url for uploading")
    .action((taskName, other) => {
        rebuild.rebuildAssets({ ...program, taskName, ...other });
        return;
    });

program.parse(process.argv);
