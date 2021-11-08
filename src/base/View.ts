import Component from './Component';
import DataHelper from '../helpers/DataHelper';
import Html from '../helpers/Html';
import fs = require('fs');
import path = require('path');
import Application from './Application';
const ejs = require('ejs');
/**
 * View represents a view object in the MVC pattern.
 *
 * View provides a set of methods (e.g. [[render]]) for rendering purpose.
 *
 * View is configured as an application component in [[Application]] by default.
 * You can access that instance via `Application.view`.
 *
 * For more details and usage information on View, see the [guide article on views](guide:structure-views).
 *
 * @author Mahesh S Warrier <https://github.com/codespede>
 */
export default class View extends Component {
    /**
     * The registered CSS files.
     * @see [[registerFile]]
     */
    public cssFiles: string[] = [];
    /**
     * The registered JS files.
     * @see [[registerFile]]
     */
    public jsFiles: { head: string[]; end: string[] } = { head: [], end: [] };
    /**
     * The registered JS code blocks
     * @see [[registerJs]]
     */
    public js: { head: string[]; begin: string[]; ready: string[]; load: string[]; end: string[] } = {
        head: [],
        begin: [],
        ready: [],
        load: [],
        end: [],
    };
    /**
     * The base path for JS and CSS files.
     * Defaults to the folder 'static' in the application's root.
     */
    public basePath = 'static';
    /**
     * The name of the layout to be applied to the views.
     * This property mainly affects the behavior of [[render]].
     * If false, no layout will be applied.
     */
    public layout: string | false = '/layouts/main.ejs';

    public constructor(config: { [key: string]: any }) {
        super(config);
        Object.assign(this, config);
    }
    /**
     * Publishes and registers the required asset files for Pwoli.
     */
    public async init() {
        await super.init.call(this);
        await this.publishAndRegisterFile(path.join(__dirname, '/../assets/js/jquery.js'), 'head');
        await this.publishAndRegisterFile(path.join(__dirname, '/../assets/js/jquery.pjax.min.js'), 'head');
        await this.publishAndRegisterFile(path.join(__dirname, '/../assets/js/pwoli.js'), 'head');
    }
    /**
     * Publishes and registers the given file at given position
     * @param file the relative file path
     * @param position position at which file should be placed. Possible values are `head`, `begin`, `ready`, `load`, `end`
     */
    public async publishAndRegisterFile(file: string, position = 'end') {
        //await this.initialization;
        this.registerFile(path.extname(file) === '.js' ? 'js' : 'css', `${this.basePath}/${path.basename(file)}`, {
            position,
        });
        if (!fs.existsSync(`${this.basePath}`)) {
            fs.mkdir(this.basePath, (err) => {
                if (err) {
                    return console.error('pwoli: assets-path-does-not-exists', err);
                }
                console.log('Directory created successfully!');
            });
        }
        fs.copyFileSync(file, `${this.basePath}/${path.basename(file)}`);
    }
    /**
     * Registers a JS or CSS file.
     *
     * @param url the JS file to be registered.
     * @param type type (js or css) of the file.
     * @param options the HTML attributes for the script tag. The following options are specially handled
     * and are not treated as HTML attributes:
     *
     * - `depends`: array, specifies the names of the asset bundles that this CSS file depends on.
     * - `appendTimestamp`: bool whether to append a timestamp to the URL.
     *
     * @param key the key that identifies the JS script file. If null, it will use
     * $url as the key. If two JS files are registered with the same key at the same position, the latter
     * will overwrite the former. Note that position option takes precedence, thus files registered with the same key,
     * but different position option will not override each other.
     */
    public registerFile(type: 'js' | 'css', url: string, options: { [key: string]: any } = {}, key = null) {
        key = key === null ? url : key;
        const position = DataHelper.remove(options, 'position', 'end');
        if (type === 'js') this.jsFiles[position].push(Html.jsFile(url, options));
        else this.cssFiles.push(Html.cssFile(url, options));
    }
    /**
     * Registers a JS code block defining a variable. The name of variable will be
     * used as key, preventing duplicated variable names.
     *
     * @param js the JS code block to be registered
     * @param position the position in a page at which the JavaScript variable should be inserted.
     * The possible values are:
     *
     * - [[head]]: in the head section. This is the default value.
     * - [[begin]]: at the beginning of the body section.
     * - [[end]]: at the end of the body section.
     * - [[load]]: enclosed within jQuery(window).load().
     *   Note that by using this position, the method will automatically register the jQuery js file.
     * - [[ready]]: enclosed within jQuery(document).ready().
     *   Note that by using this position, the method will automatically register the jQuery js file.
     *
     */
    public async registerJs(js: string, position = 'ready') {
        this.js[position].push(js);
    }
    /**
     * Renders the content to be inserted in the head section.
     * The content is rendered using the registered meta tags, link tags, CSS/JS code blocks and files.
     * @return the rendered content
     */
    public renderHeadHtml() {
        const lines = [];

        if (this.cssFiles.length > 0) lines.push(this.cssFiles.join('\n'));
        if (this.jsFiles.head.length > 0) lines.push(this.jsFiles.head.join('\n'));
        return lines.length > 0 ? lines.join('\n') : '';
    }
    /**
     * Renders the content to be inserted at the end of the body section.
     * The content is rendered using the registered JS code blocks and files.
     * @param ajaxMode whether the view is rendering in AJAX mode.
     * If true, the JS scripts registered at [[POS_READY]] and [[POS_LOAD]] positions
     * will be rendered at the end of the view like normal scripts.
     * @return string the rendered content
     */
    public renderEndHtml(ajaxMode: boolean) {
        const lines = [];

        if (this.jsFiles.end.length > 0) lines.push(this.jsFiles.end.join('\n'));
        if (ajaxMode) {
            const scripts = [];
            if (this.js.end.length > 0) scripts.push(this.js.end.join('\n'));
            if (this.js.ready.length > 0) scripts.push(this.js.ready.join('\n'));
            if (this.js.load.length > 0) scripts.push(this.js.load.join('\n'));
            if (scripts.length > 0) lines.push(Html.script(scripts.join('\n')));
        } else {
            let js;
            if (this.js.end.length > 0) {
                js = this.js.end.join('\n');
                lines.push(Html.script(js));
            }
            if (this.js.ready.length > 0) {
                js = `jQuery(function ($) {\n${this.js.ready.join('\n')}\n});`;
                lines.push(Html.script(js));
            }
            if (this.js.load.length > 0) {
                js = `jQuery(window).on('load', function () {\n${this.js.load.join('\n')}\n});`;
                lines.push(Html.script(js));
            }
        }
        return lines.length > 0 ? lines.join('\n') : '';
    }
    /**
     * Renders the head html.
     */
    public head() {
        return this.renderHeadHtml();
    }
    /**
     * Marks the ending of an HTML page.
     * @param ajaxMode whether the view is rendering in AJAX mode.
     * If true, the JS scripts registered at [[POS_READY]] and [[POS_LOAD]] positions
     * will be rendered at the end of the view like normal scripts.
     */
    public endPage(ajaxMode = false) {
        return this.renderEndHtml(ajaxMode);
    }
    /**
     * Renders a view.
     *
     * The view to be rendered can be specified in one of the following formats:
     *
     * - absolute path within application (e.g. "/site/index"): the view name starts with a single slashes.
     *   The actual view file will be looked for under the [[Application.viewPath|view path]] of the application.
     *
     * @param view the view name.
     * @param params the parameters (name-value pairs) that will be extracted and made available in the view file.
     * @param withLayout whether the view should be rendered inside a layout if it's available.
     * @return string the rendering result
     * @see renderFile()
     */
    public async render(view: string, params: { [key: string]: any } = {}, withLayout = true) {
        if (withLayout && this.layout !== false) {
            params.body = await this.renderFile(this.findViewFile(view), params);
            return await this.renderFile(this.findViewFile(this.layout), params);
        } else return await this.renderFile(this.findViewFile(view), params);
    }
    /**
     * Finds the view file based on the given view name.
     * @param view the view name or the [path alias](guide:concept-aliases) of the view file. Please refer to [[render()]]
     * on how to specify this parameter.
     * @return the view file path. Note that the file may not exist.
     */
    public findViewFile(view: string) {
        let file;
        if (view.indexOf('@') === 0) file = Application.getAlias(view);
        else if (view.indexOf('/') === 0) file = Application.getViewPath() + view;
        else throw new Error(`Unable to resolve view file: ${view}`);
        // const app = require('express');
        return file;
    }
    /**
     * Renders a view file.
     *
     * @param viewFile the view file. This can be either an absolute file path or an alias of it.
     * @param params the parameters (name-value pairs) that will be extracted and made available in the view file.
     * @return string the rendering result
     */
    public async renderFile(viewFile: string, params: any = {}) {
        params.pwoliView = this;
        return await ejs.renderFile(viewFile, params, { async: true });
    }
    /**
     * Sets the layout for the this view instance.
     * @param layout the layout path
     * @return the view instance itself
     */
    public setLayout(layout: string) {
        this.layout = layout;
        return this;
    }
}
