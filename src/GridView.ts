import { emptyDir } from 'fs-extra';
import path = require('path');
import { DataHelper } from '.';
import Pwoli from './Application';
import CollectionView from './CollectionView';
import Component from './Component';
import DataColumn from './DataColumn';
import Html from './Html';
import Model from './Model';

export default class GridView extends CollectionView {
  public dataColumnClass = DataColumn;
  public caption = '';
  public captionOptions: any = {};
  public tableOptions: any = { class: 'table table-striped table-bordered' };
  public options: any = { class: 'grid-view' };
  public headerRowOptions: any = {};
  public footerRowOptions: any = {};
  public rowOptions: any = {};
  public beforeRow;
  public afterRow;
  public showHeader = true;
  public showFooter = true;
  public placeFooterAfterBody = false;
  public showOnEmpty = true;
  // public formatter;
  public columns: any = ['id'];
  public emptyCell = '&nbsp;';
  public filterModel;
  public filterUrl;
  public filterSelector;
  public filterPosition = 'body';
  public filterRowOptions: any = { class: 'filters' };
  public filterErrorSummaryOptions: any = { class: 'error-summary' };
  public filterErrorOptions: any = { class: 'help-block' };
  public filterOnfocusOut = true;
  public layout = '{summary}\n{items}\n{pager}';

  public constructor(config) {
    super(config);
    Object.assign(this, config);
  }

  public async init() {
    await super.init.call(this);
    
    if (this.filterRowOptions.id === undefined) this.filterRowOptions.id = `${this.options.id}-filters`;
    
    await this.initColumns();
  }

  public async run() {
    await this.initialization;
    
    Pwoli.view.publishAndRegisterFile(path.join(__dirname, 'assets/css/bootstrap.css'));
    Pwoli.view.publishAndRegisterFile(path.join(__dirname, 'assets/js/gridView.js'));
    // Pwoli.view.registerFile('css', 'default/css/bootstrap.css');
    
    const id = this.options.id;
    const options = { ...this.getClientOptions(), filterOnfocusOut: this.filterOnfocusOut };
    Pwoli.view.registerJs(`jQuery('#${id}').widgetGridView(${JSON.stringify(options)});`);
    return super.run.call(this);
  }

  public renderErrors() {
    return '';
  }

  public async render() {
    return await super.render.call(this);
  }

  public async renderSection(name) {
    switch (name) {
      case '{errors}':
        return this.renderErrors();
      default:
        return await super.renderSection.call(this, name);
    }
  }

  protected getClientOptions() {
    const filterUrl = this.filterUrl !== undefined ? this.filterUrl : (Pwoli.request.originalUrl || Pwoli.request.url);
    const id = this.filterRowOptions.id;
    let filterSelector = `#${id} input, #${id} select`;
    if (this.filterSelector !== undefined) filterSelector += `, ${this.filterSelector}`;
    return { filterUrl, filterSelector };
  }

  public async renderItems() {
    const caption = this.renderCaption();
    const columnGroup = await this.renderColumnGroup();
    const tableHeader = this.showHeader ? await this.renderTableHeader() : false;
    const tableBody = await this.renderTableBody();
    let tableFooter: boolean | string = false;
    let tableFooterAfterBody: boolean | string = false;
    if (this.showFooter)
      if (this.placeFooterAfterBody) tableFooterAfterBody = await this.renderTableFooter();
      else tableFooter = await this.renderTableFooter();
    const content = [caption, columnGroup, tableHeader, tableFooter, tableBody, tableFooterAfterBody].filter(
      (item) => item,
    );
    return Html.tag('table', content.join('\n'), this.tableOptions);
  }

  public renderCaption() {
    if (this.caption.length > 0) return Html.tag('caption', this.caption, this.captionOptions);
    return false;
  }

  public async renderColumnGroup() {
    
    for (const column of this.columns) {
      if (column.options !== undefined && column.options.length > 0) {
        const cols = [];
        for (const col of this.columns) cols.push(Html.tag('col', '', col.options));
        return Html.tag('colgroup', cols.join('\n'));
      }
    }
    return false;
  }

  public async renderTableHeader() {
    const cells = [];
    for (const column of this.columns) cells.push(await column.renderHeaderCell());
    let content = Html.tag('tr', cells.join(''), this.headerRowOptions);
    if (this.filterPosition === 'header') content = (await this.renderFilters()) + content;
    else if (this.filterPosition === 'body') content = content + (await this.renderFilters());
    
    return `<thead>\n${content}\n</thead>`;
  }

  public async renderTableFooter() {
    const cells = [];
    for (const column of this.columns) cells.push(await column.renderFooterCell());
    let content = Html.tag('tr', cells.join(''), this.footerRowOptions);
    if (this.filterPosition === 'footer') content = await this.renderFilters();
    return `<tfoot>\n${content}\n</tfoot>`;
  }

  public async renderFilters() {
    if (this.filterModel !== undefined) {
      const cells = [];
      for (const column of this.columns) cells.push(await column.renderFilterCell());
      return Html.tag('tr', cells.join(''), this.filterRowOptions);
    }
    return '';
  }

  public async renderTableBody() {
    const models = this._models;
    const keys = this.dataProvider.getKeys();

    const rows = [];
    let i = 0;
    
    for (const model of models) {
      const key = keys[i];
      rows.push(await this.renderTableRow(model, key, i));
      i++;
    }
    if (rows.length === 0 && this.emptyText !== false)
      return `<tbody>\n<tr><td colspan="${this.columns.length}">${this.renderEmpty()}</td></tr>\n</tbody>`;
    return `<tbody\n${rows.join('\n')}\n</tbody>`;
  }

  public async renderTableRow(model, key, index) {
    const cells = [];
    for (const column of this.columns) cells.push(await column.renderDataCell(model, key, index));
    const options = this.rowOptions;
    options['data-key'] = key;
    
    return Html.tag('tr', cells.join(''), options);
  }

  public async initColumns() {
    // await this.initialization;
    
    if (this.columns.length === 0) this.guessColumns();
    let i = 0;
    for (let column of this.columns) {
        if (typeof column === 'string') column = this.createDataColumn(column);
        else {
            const columnClass = DataHelper.remove(column, 'class', this.dataColumnClass);
            column = new columnClass({ grid: this, ...column });
        }
        if (!column.visible) {
            delete this.columns[i];
            continue;
        }
        this.columns[i] = column;
        i++;
    }
  }

  protected createDataColumn(text) {
    const matches = text.match(/^([^:]+)(:(\w*))?(:(.*))?$/);
    if (matches.length === 0)
      throw new Error(
        'The column must be specified in the format of "attribute", "attribute:format" or "attribute:format:label"',
      );
    return new this.dataColumnClass({
      grid: this,
      attribute: matches[1],
      format: matches[3] !== undefined ? matches[3] : 'text',
      label: matches[5] !== undefined ? matches[5] : undefined,
    });
  }

  protected guessColumns() {
    const models = this._models;
    const model = models[1];
    for (const name in model)
      if (model[name] === null || /boolean|number|string/.test(typeof model[name])) this.columns.push(name);
  }
}
