import Component from './Component';
import DataHelper from './DataHelper';
import Html from './Html';
import fs = require('fs');
import path = require('path');
import Application from './Application';

import ejs from 'ejs';
export default class View extends Component {
  public cssFiles = [];
  public jsFiles = { head: [], end: [] };
  public js = { head: [], begin: [], ready: [], load: [], end: [] };
  public css = [];
  public basePath = 'static';

  public constructor(config) {
    super(config);
    Object.assign(this, config);
  }

  public async init() {
    await super.init.call(this);
    this.publishAndRegisterFile('src/components/assets/js/jquery.js', 'head');
    this.registerFile('js', 'https://cdnjs.cloudflare.com/ajax/libs/jquery.pjax/2.0.1/jquery.pjax.min.js');
    this.publishAndRegisterFile('src/components/assets/js/framework.js', 'head');
  }

  public async publishAndRegisterFile(file, position = 'end') {
    await this.initialization;
    fs.copyFile(file, `${this.basePath}/${path.basename(file)}`, (error) => {
      if (error) throw error;
    });
    console.log('parf', file, path.extname(file));
    this.registerFile(path.extname(file) === '.js' ? 'js' : 'css', `${this.basePath}/${path.basename(file)}`, {
      position,
    });
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
    if (this.cssFiles.length > 0) lines.push(this.cssFiles.join('\n'));
    if (this.jsFiles.head.length > 0) lines.push(this.jsFiles.head.join('\n'));
    return lines.length > 0 ? lines.join('\n') : '';
  }

  public renderEndHtml(ajaxMode) {
    const lines = [];
    console.log('jsFiless', this.jsFiles);
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

  public async render(view, params = {}) {
    return await this.renderFile(this.findViewFile(view), params);
  }

  protected findViewFile(view) {
    let file;
    if (view.indexOf('@') === 0) file = Application.getAlias(view);
    else if (view.indexOf('/') === 0) file = Application.getViewPath() + view;
    else throw new Error(`Unable to resolve view file: ${view}`);
    // const app = require('express');
    return file;
  }

  public async renderFile(viewFile, params = {}) {
    return await ejs.renderFile(viewFile, params, { async: true });
  }
}
