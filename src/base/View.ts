import Component from './Component';
import DataHelper from '../helpers/DataHelper';
import Html from '../helpers/Html';
import fs = require('fs');
import path = require('path');
import Application from './Application';
const ejs = require('ejs');
export default class View extends Component {
  public cssFiles: string[] = [];
  public jsFiles: { head: string[]; end: string[] } = { head: [], end: [] };
  public js: { head: string[]; begin: string[]; ready: string[]; load: string[]; end: string[] } = {
    head: [],
    begin: [],
    ready: [],
    load: [],
    end: [],
  };
  public css: string[] = [];
  public basePath = 'static';
  public layout: string;

  public constructor(config: { [key: string]: any }) {
    super(config);
    Object.assign(this, config);
  }

  public async init() {
    await super.init.call(this);
    await this.publishAndRegisterFile(path.join(__dirname, '/../assets/js/jquery.js'), 'head');
    this.registerFile('js', 'https://cdnjs.cloudflare.com/ajax/libs/jquery.pjax/2.0.1/jquery.pjax.min.js');
    await this.publishAndRegisterFile(path.join(__dirname, '/../assets/js/pwoli.js'), 'head');
  }

  public async publishAndRegisterFile(file, position = 'end') {
    //await this.initialization;
    this.registerFile(path.extname(file) === '.js' ? 'js' : 'css', `${this.basePath}/${path.basename(file)}`, {
      position,
    });

    fs.copyFileSync(file, `${this.basePath}/${path.basename(file)}`);
  }

  public registerFile(type: 'js' | 'css', url, options: any = {}, key = null) {
    key = key === null ? url : key;
    const position = DataHelper.remove(options, 'position', 'end');
    if (type === 'js') this.jsFiles[position].push(Html.jsFile(url, options));
    else this.cssFiles.push(Html.cssFile(url, options));
  }

  public async registerJs(js, position = 'ready', key = null) {
    this.js[position].push(js);
    // if (['ready', 'load'].includes(position))
    //     await this.publishAndRegisterFile('src/components/assets/js/jquery.js', 'head');
  }

  public renderHeadHtml() {
    const lines = [];
    //console.log('cssFiles', this.cssFiles);
    if (this.cssFiles.length > 0) lines.push(this.cssFiles.join('\n'));
    if (this.jsFiles.head.length > 0) lines.push(this.jsFiles.head.join('\n'));
    return lines.length > 0 ? lines.join('\n') : '';
  }

  public renderEndHtml(ajaxMode) {
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

  public head() {
    return this.renderHeadHtml();
  }

  public endPage(ajaxMode = false) {
    return this.renderEndHtml(ajaxMode);
  }

  public async render(view, params: any = {}, withLayout = true) {
    if (withLayout && this.layout !== undefined) {
      params.body = await this.renderFile(this.findViewFile(view), params);
      return await this.renderFile(this.findViewFile(this.layout), params);
    } else return await this.renderFile(this.findViewFile(view), params);
  }

  public findViewFile(view) {
    let file;
    if (view.indexOf('@') === 0) file = Application.getAlias(view);
    else if (view.indexOf('/') === 0) file = Application.getViewPath() + view;
    else throw new Error(`Unable to resolve view file: ${view}`);
    // const app = require('express');
    return file;
  }

  public async renderFile(viewFile, params: any = {}) {
    params.pwoliView = this;
    return await ejs.renderFile(viewFile, params, { async: true });
  }

  public setLayout(layout) {
    this.layout = layout;
    return this;
  }
}