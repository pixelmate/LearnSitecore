## For using Autosynchronizer, you need to complete next steps:

1. Open *PathToInstance/Website/App_Config/Include/z.Feature.Overrides* (in previous version of Sitecore it can be *PathToInstance/Website/App_Config/Include/Feature*) folder and remove **.disabled** from **z.SPE.Sync.Enabler.Gulp.config.disabled** file;

##
| command                  | alias     |                                                                                         options                                                                                         | description                                                                                                                                                           |
| :----------------------- | :-------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sxa init`               | `sxa i`   |                                                                                            -                                                                                            | Download all necessary files for compatibility with Creative Exchange Live Mode. This process will not replace existing files only download the missing ones.         |
| `sxa new [themeName]`    | `sxa n`   | `--url <url>` - Url to the instance where the theme should be created. You don't have to specify the URL if you want to create the theme in the currently registered Sitecore instance. | Creates a theme both locally and within your Sitecore instance. Use this command to create a new theme for your site.                                                 |
| `sxa register <url>`     | `sxa reg` |                                                                                            -                                                                                            | Specifies the default Sitecore instance for the "init" and "new" commands for your working environment. Only one instance can be registered as the default at a time. |
| `sxa get-url`            | `sxa g`   |                                                                                            -                                                                                            | Returns the current default Sitecore instance URL for the "init" and "new" commands.                                                                                  |
| `sxa config [themeName]` | `sxa c`   |                                                                                            -                                                                                            | Sets up a theme configuration variable by answering a list of questions. Use this command to change the theme configuration.                                          |
| `sxa build [taskName]`   | `sxa b`   |                                                                `-d, --debug` - provides additional debugging information                                                                | Builds theme assets based on the current theme configuration                                                                                                          |
| `sxa upload [taskName]`  | `sxa u`   |     1. `-d, --debug`  provides additional debugging information;<br/> 2. `-l, --login <login>` - Login for uploading;<br/> 3. `-p, --password <password>` - Password for uploading      | Upload theme assets based on the theme configuration                                                                                                                  |
| `sxa watch [taskName]`   | `sxa w`   |     1. `-d, --debug` - provides additional debugging information; <br/> 2. `-l, --login <login>` - Login for watching; <br/>3. `-p, --password <password>` - Password for watching      | Watches for theme asset changes on the drive and uploads any modified files automatically. Can be configured with "sxa config" command                                |
| `sxa rebuild [taskName]` | `sxa r`   |     1. `-d, --debug` - provides additional debugging information; <br/> 2. `-l, --login <login>` - Login for watching; <br/>3. `-p, --password <password>` - Password for watching      | rebuild and upload theme assets                                                                                                                                       |

## List of `build` tasks:

### Global tasks
 1. `build All` - compiles sass, minifies css and js;

### For SASS
 1. `build Sass` - compiles sass into css from root of *sass* folder;
 2. `build SassStyles` - compiles files from **sass/styles/common** , **sass/styles/content-alignment** , **sass/styles/layout**  to **styles/styles.css**;
### For CSS
 1. `build Css` - bundles and minifies files in **styles** folder;

### For JavaScript:
 1. `build Eslint` - run eslint for all JavaScript in the **Scripts** folder;
 3. `build Js` - bundles and minifies JavaScript files in the **Scripts** folder;
### For SASS and CSS
 1. `build Styles` - compiles sass components into css, bundles and minfies css files;
### For Sprite
 1. `build SpriteFlag` - to create sprite for flags;


## List of `upload` tasks:
### Global tasks:
1. `upload All` - uploading JavaScript, CSS, and images to the Sitecore instance;
### For CSS
1. `upload Css` -  uploading CSS files from **styles** folder based on the theme configuration.
### For JavaScript:
1. `upload Js` - uploading JavaScript files from **Scripts** folder based on the theme configuration
### For SASS and CSS
1. `upload Img` - upload files from **images** to the Sitecore instance;
### For Fonts
1. `upload Fonts` - upload files from **Fonts** folder to the Sitecore instance;
### For Gulp config
1. `upload GulpConfig` - uploading **config** folder and **gulpfilejs**

## List of rebuild tasks:
### Global tasks:
1. `rebuild All` - compiles sass components into css, minifies js and css, uploads js, css, images;
2. `rebuild Main` - compiles sass components into css, minifies js and css, uploads js, css;

## List of watch tasks:
### Global tasks:
1. `sxa watch All` - aggregates the functionality of the following tasks: <br/>
            `watch Sass` <br/>
            `watch JS` <br/>
            `watch Es` <br/>
            `watch Css` <br/>
            `watch Img` <br/>
            `watch SassSource` <br/>
            `watch Scriban` <br/>
            `watch Html` <br/>

### For Sass:
1. `watch Sass` - run a list of tasks: <br/>
			`watch SassComponents` <br/>
	        `watch SassBase`<br/>
			`watch SassStyles`<br/>
			`watch SassDependency`<br/>
2. `watch SassStyles` - monitors changes under **sass/styles/common** , **sass/styles/content-alignment** , **sass/styles/layout** folders, compiles all of them to **styles/styles.css**;
3. `watch SassBase` - monitors changes under  **sass/abstracts/**, **sass/base/** , **sass/components** folders and compiles components and styles;
4. `watch SassComponents` - monitors changes in component stylesunder *sass* folder and compiles them to **styles** folder;
5. `watch SassDependency` - monitors changes under **sass/styles** (except for **sass/styles/common** , **sass/stylescontent-alignment** , **sass/styles/layout**) and compilesappropriate components;
6. `watch SassSource` - monitors changed under **sass/\*** folderand uploads changed file to the Sitecore instance;
### For CSS
1. `watch Css` - monitors changes of css files under **styles** folder and uploads them to the Sitecore instance;
### For JavaScript:
1. `watch Js` - watch on changes of js files under **Scripts** folder and upload them to the Sitecore instance;
2. `watch Es` - watch on changes of js files under **sources** folder and upload them to the Sitecore instance;

### For Images
1. `watch Img` - monitors changes under **images** folder and uploads the files to the Sitecore instance;

## Creative Exchange specific tasks
### For HTML
1. `watch Html` - monitors changes of HTML files and uploads them to the Sitecore instance to be parsed by Creative Exchange;

### For Scriban
1. `watch Scriban` - monitors changes of Scriban files and uploads them to the Sitecore instance;