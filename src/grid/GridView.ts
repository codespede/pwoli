import path = require('path');
import DataHelper from '../helpers/DataHelper';
import Pwoli from '../base/Application';
import CollectionView from '../widgets/CollectionView';
import Component from '../base/Component';
import DataColumn from './DataColumn';
import Html from '../helpers/Html';
import Model from '../base/Model';
import Column from './Column';

export type column = Column | { [key: string]: any };
/**
 * The GridView widget is used to display data in a grid.
 *
 * It provides features like [[sorter|sorting]], [[pager|paging]] and also [[filterModel|filtering]] the data.
 *
 * A basic usage looks like the following:
 *
 * ```js
 * let grid = new MyGridView({
 *       dataProvider,
 *       filterModel,
 *       columns: [
 *         { class: CheckboxColumn },
 *         { class: RadioButtonColumn },
 *         { class: SerialColumn },
 *         'id',
 *         'title',
 *         { class: ActionColumn, visibleButtons: { update: false } },
 *       ],
 *     });
 * ```
 *
 * The columns of the grid table are configured in terms of [[Column]] classes,
 * which are configured via [[columns]].
 *
 * The look and feel of a grid view can be customized using the large amount of properties.
 *
 * For more details and usage information on GridView, see the [guide article on data widgets](guide:output-data-widgets).
 *
 * @author Mahesh S Warrier <maheshs60@gmail.com>
 * @since 1.0
 */
export default class GridView extends CollectionView {
    /**
     * The default data column class if the class name is not explicitly specified when configuring a data column.
     * Defaults to 'DataColumn'.
     */
    public dataColumnClass = DataColumn;
    /**
     * The caption of the grid table
     * @see [[captionOptions]]
     */
    public caption = '';
    /**
     * The HTML attributes for the caption element.
     * @see [[Html.renderTagAttributes]] for details on how attributes are being rendered.
     * @see [[caption]]
     */
    public captionOptions: { [key: string]: any } = {};
    /**
     * The HTML attributes for the grid table element.
     * @see [[Html.renderTagAttributes]] for details on how attributes are being rendered.
     */
    public tableOptions: { [key: string]: any } = { class: 'table table-striped table-bordered' };
    /**
     * The HTML attributes for the container tag of the grid view.
     * The "tag" element specifies the tag name of the container element and defaults to "div".
     * @see [[Html.renderTagAttributes]] for details on how attributes are being rendered.
     */
    public options: { [key: string]: any } = { class: 'grid-view' };
    /**
     * The HTML attributes for the table header row.
     * @see [[Html.renderTagAttributes]] for details on how attributes are being rendered.
     */
    public headerRowOptions: { [key: string]: any } = {};
    /**
     * The HTML attributes for the table footer row.
     * @see [[Html.renderTagAttributes]] for details on how attributes are being rendered.
     */
    public footerRowOptions: { [key: string]: any } = {};
    /**
     * The HTML attributes for the table body rows.
     * @see [[Html.renderTagAttributes]] for details on how attributes are being rendered.
     */
    public rowOptions: { [key: string]: any } = {};
    /**
     * Whether to show the header section of the grid table.
     */
    public showHeader = true;
    /**
     * Whether to show the footer section of the grid table.
     */
    public showFooter = false;
    /**
     * Whether to place footer after body in DOM if $showFooter is true
     */
    public placeFooterAfterBody = false;
    /**
     * Whether to show the grid view if [[dataProvider]] returns no data.
     */
    public showOnEmpty = true;
    /**
     * Grid column configuration. Each array element represents the configuration
     * for one particular grid column. For example,
     *
     * ```js
     * [
     *     { class: SerialColumn },
     *     {
     *         class: DataColumn, // this line is optional
     *         attribute: 'name',
     *         label: 'Name',
     *     },
     *     { class: CheckboxColumn },
     * ]
     * ```
     *
     * If a column is of class [[DataColumn]], the "class" property can be omitted.
     *
     * As a shortcut format, a string may be used to specify the configuration of a data column
     * which only contains [[DataColumn.attribute|attribute]]
     * and/or [[DataColumn.label|label]] options: `"attribute:format:label"`.
     * For example, the above "name" column can also be specified as: `"name:text:Name"`.
     * Both "format" and "label" are optional. They will take default values if absent.
     *
     * Using the shortcut format the configuration for columns in simple cases would look like this:
     *
     * ```js
     * [
     *     'id',
     *     'amount:currency:Total Amount',
     *     'created_at:datetime',
     * ]
     * ```
     *
     * When using a [[dataProvider]] with active records, you can also display values from related records,
     * e.g. the `name` attribute of the `author` relation:
     *
     * ```js
     * // shortcut syntax
     * 'author.name',
     * // full syntax
     * {
     *     attribute: 'author.name',
     *     // ...
     * }
     * ```
     */
    public columns: Array<column | string>;
    public emptyCell = '&nbsp;';
    public filterModel: Model;
    public filterUrl: string;
    public filterSelector: string;
    public filterPosition = 'body';
    public filterRowOptions: { [key: string]: any } = { class: 'filters' };
    public filterErrorSummaryOptions: { [key: string]: any } = { class: 'error-summary' };
    public filterErrorOptions: { [key: string]: any } = { class: 'help-block' };
    public filterOnfocusOut = true;
    public layout = '{summary}\n{items}\n{pager}';

    public constructor(config: { [key: string]: any }) {
        super(config);
        Object.assign(this, config);
    }

    public async init() {
        await super.init.call(this);
        if (this.filterRowOptions.id === undefined) this.filterRowOptions.id = `${this.options.id}-filters`;
        await this.initColumns();
    }

    public async run(): Promise<string> {
        await Pwoli.view.publishAndRegisterFile(path.join(__dirname, '/../assets/js/gridView.js'));
        await Pwoli.view.publishAndRegisterFile(path.join(__dirname, '/../assets/css/bootstrap.css'));
        //await this.initialization;
        const id = this.options.id;
        const options = { ...this.getClientOptions(), filterOnfocusOut: this.filterOnfocusOut };
        await Pwoli.view.registerJs(`jQuery('#${id}').pwoliGridView(${JSON.stringify(options)});`);
        return await super.run.call(this);
    }

    public renderErrors() {
        return '';
    }

    public async render() {
        return await super.render.call(this);
    }

    public async renderSection(name: string): Promise<string> {
        switch (name) {
        case '{errors}':
            return this.renderErrors();
        default:
            return await super.renderSection.call(this, name);
        }
    }

    protected getClientOptions(): { filterUrl: string; filterSelector: string } {
        const filterUrl = this.filterUrl !== undefined ? this.filterUrl : Pwoli.request.originalUrl || Pwoli.request.url;
        const id = this.filterRowOptions.id;
        let filterSelector = `#${id} input, #${id} select`;
        if (this.filterSelector !== undefined) filterSelector += `, ${this.filterSelector}`;
        return { filterUrl, filterSelector };
    }

    public async renderItems(): Promise<string> {
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

    public renderCaption(): string | false {
        if (this.caption.length > 0) return Html.tag('caption', this.caption, this.captionOptions);
        return false;
    }

    public async renderColumnGroup(): Promise<string | false> {
        for (const column of this.columns) {
        if ((column as column).options !== undefined && (column as column).options.length > 0) {
            const cols = [];
            for (const col of this.columns) cols.push(Html.tag('col', '', (col as column).options));
            return Html.tag('colgroup', cols.join('\n'));
        }
        }
        return false;
    }

    public async renderTableHeader(): Promise<string> {
        const cells = [];
        for (const column of this.columns) cells.push(await (column as column).renderHeaderCell());
        let content = Html.tag('tr', cells.join(''), this.headerRowOptions);
        if (this.filterPosition === 'header') content = (await this.renderFilters()) + content;
        else if (this.filterPosition === 'body') content = content + (await this.renderFilters());

        return `<thead>\n${content}\n</thead>`;
    }

    public async renderTableFooter(): Promise<string> {
        const cells = [];
        for (const column of this.columns) cells.push(await (column as column).renderFooterCell());
        let content = Html.tag('tr', cells.join(''), this.footerRowOptions);
        if (this.filterPosition === 'footer') content = await this.renderFilters();
        return `<tfoot>\n${content}\n</tfoot>`;
    }

    public async renderFilters(): Promise<string> {
        if (this.filterModel !== undefined) {
        const cells = [];
        for (const column of this.columns) cells.push(await (column as column).renderFilterCell());
        return Html.tag('tr', cells.join(''), this.filterRowOptions);
        }
        return '';
    }

    public async renderTableBody(): Promise<string> {
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

    public async renderTableRow(model, key, index): Promise<string> {
        const cells = [];
        for (const column of this.columns) cells.push(await (column as column).renderDataCell(model, key, index));
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
        if (!(column as column).visible) {
            delete this.columns[i];
            continue;
        }
        this.columns[i] = column;
        i++;
        }
    }

    protected createDataColumn(text: string) {
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
