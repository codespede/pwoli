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
 * For more details and usage information on GridView, see the [guide article on data widgets](https://codespede.github.io/pwoli/output-data-widgets).
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
     *     'amount:text:Total Amount',
     *     'created_at:text',
     * ]
     * ```
     * Note: Format is now restricted to 'text' only. You can convert the data to a specific format by using
     * callbacks as of now:
     *
     * [
     *     'id',
     *     'title:text:Company Name',
     *     {
     *         title: 'Created Date',
     *         value: (model, attribute) => (new Date(form.startDate.value)).toString('dd MMMM yyyy')
     *     }
     * ]
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
    /**
     * The HTML display when the content of a cell is empty.
     * This property is used to render cells that have no defined content,
     * e.g. empty footer or filter cells.
     */
    public emptyCell = '&nbsp;';
    /**
     * The model that keeps the user-entered filter data. When this property is set,
     * the grid view will enable column-based filtering. Each data column by default will display a text field
     * at the top that users can fill in to filter the data.
     *
     * Note that in order to show an input field for filtering, a column must have its [[DataColumn.attribute]]
     * property set and the attribute should be active in the current scenario of $filterModel or have
     * [[DataColumn.filter]] set as the HTML code for the input field.
     *
     * When this property is not set (null) the filtering feature is disabled.
     */
    public filterModel: Model;
    /**
     * The URL for returning the filtering result. [[Url.to]] will be called to
     * normalize the URL. If not set, the current controller action will be used.
     * When the user makes change to any filter input, the current filtering inputs will be appended
     * as GET parameters to this URL.
     */
    public filterUrl: string;
    /**
     * Additional jQuery selector for selecting filter input fields
     */
    public filterSelector: string;
    /**
     * Whether the filters should be displayed in the grid view. Valid values include:
     *
     * - header: the filters will be displayed on top of each column's header cell.
     * - body: the filters will be displayed right below each column's header cell.
     * - footer: the filters will be displayed below each column's footer cell.
     */
    public filterPosition = 'body';
    /**
     * The HTML attributes for the filter row element.
     * @see [[Html::renderTagAttributes]] for details on how attributes are being rendered.
     */
    public filterRowOptions: { [key: string]: any } = { class: 'filters' };
    /**
     * The options for rendering the filter error summary.
     * Please refer to [[Html.errorSummary]] for more details about how to specify the options.
     * @see [[renderErrors]]
     */
    public filterErrorSummaryOptions: { [key: string]: any } = { class: 'error-summary' };
    /**
     * The options for rendering every filter error message.
     * This is mainly used by [[Html.error]] when rendering an error message next to every filter input field.
     */
    public filterErrorOptions: { [key: string]: any } = { class: 'help-block' };
    /**
     * Whatever to apply filters on losing focus. Leaves an ability to manage filters via gridView JS
     */
    public filterOnfocusOut = true;
    /**
     * The layout that determines how different sections of the grid view should be organized.
     * The following tokens will be replaced with the corresponding section contents:
     *
     * - `{summary}`: the summary section. See [[renderSummary()]].
     * - `{errors}`: the filter model error summary. See [[renderErrors()]].
     * - `{items}`: the list items. See [[renderItems()]].
     * - `{sorter}`: the sorter. See [[renderSorter()]].
     * - `{pager}`: the pager. See [[renderPager()]].
     */
    public layout = '{summary}\n{items}\n{pager}';

    public constructor(config: { [key: string]: any }) {
        super(config);
        Object.assign(this, config);
    }
    /**
     * Initializes the grid view.
     * This method will initialize required property values and instantiate [[columns]] objects.
     */
    public async init() {
        await super.init.call(this);
        if (this.filterRowOptions.id === undefined)
            this.filterRowOptions.id = `${this.options.id || this.getId()}-filters`;
        await this.initColumns();
    }
    /**
     * Runs the widget.
     */
    public async run(): Promise<string> {
        await this.initialization;
        await Pwoli.view.publishAndRegisterFile(path.join(__dirname, '/../assets/js/gridView.js'));
        await Pwoli.view.publishAndRegisterFile(path.join(__dirname, '/../assets/css/bootstrap.css'));
        const id = this.options.id;
        const options = { ...this.getClientOptions(), filterOnfocusOut: this.filterOnfocusOut };
        await Pwoli.view.registerJs(`jQuery('#${id}').pwoliGridView(${JSON.stringify(options)});`);
        return await super.run.call(this);
    }
    /**
     * Renders validator errors of filter model.
     * @return the rendering result.
     */
    public renderErrors() {
        return ''; //coming soon..
    }
    /** @inheritdoc */
    public async renderSection(name: string): Promise<string> {
        switch (name) {
            case '{errors}':
                return this.renderErrors();
            default:
                return await super.renderSection.call(this, name);
        }
    }
    /**
     * Returns the options for the grid view JS widget.
     * @return the options
     */
    protected getClientOptions(): { filterUrl: string; filterSelector: string } {
        const filterUrl =
            this.filterUrl !== undefined ? this.filterUrl : Pwoli.request.originalUrl || Pwoli.request.url;
        const id = this.filterRowOptions.id;
        let filterSelector = `#${id} input, #${id} select`;
        if (this.filterSelector !== undefined) filterSelector += `, ${this.filterSelector}`;
        return { filterUrl, filterSelector };
    }
    /**
     * Renders the data models for the grid view.
     * @return the HTML code of table
     */
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
    /**
     * Renders the caption element.
     * @return the rendered caption element or `false` if no caption element should be rendered.
     */
    public renderCaption(): string | false {
        if (this.caption.length > 0) return Html.tag('caption', this.caption, this.captionOptions);
        return false;
    }
    /**
     * Renders the column group HTML.
     * @return the column group HTML or `false` if no column group should be rendered.
     */
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
    /**
     * Renders the table header.
     * @return the rendering result.
     */
    public async renderTableHeader(): Promise<string> {
        const cells = [];
        for (const column of this.columns) cells.push(await (column as column).renderHeaderCell());
        let content = Html.tag('tr', cells.join(''), this.headerRowOptions);
        if (this.filterPosition === 'header') content = (await this.renderFilters()) + content;
        else if (this.filterPosition === 'body') content = content + (await this.renderFilters());

        return `<thead>\n${content}\n</thead>`;
    }
    /**
     * Renders the table footer.
     * @return the rendering result.
     */
    public async renderTableFooter(): Promise<string> {
        const cells = [];
        for (const column of this.columns) cells.push(await (column as column).renderFooterCell());
        let content = Html.tag('tr', cells.join(''), this.footerRowOptions);
        if (this.filterPosition === 'footer') content = await this.renderFilters();
        return `<tfoot>\n${content}\n</tfoot>`;
    }
    /**
     * Renders the filter.
     * @return the rendering result.
     */
    public async renderFilters(): Promise<string> {
        if (this.filterModel !== undefined) {
            const cells = [];
            for (const column of this.columns) cells.push(await (column as column).renderFilterCell());
            return Html.tag('tr', cells.join(''), this.filterRowOptions);
        }
        return '';
    }
    /**
     * Renders the table body.
     * @return the rendering result.
     */
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
    /**
     * Renders a table row with the given data model and key.
     * @param model the data model to be rendered
     * @param key the key associated with the data model
     * @param index the zero-based index of the data model among the model array returned by [[dataProvider]].
     * @return the rendering result
     */
    public async renderTableRow(model: Model, key: string, index: number): Promise<string> {
        const cells = [];
        for (const column of this.columns) cells.push(await (column as column).renderDataCell(model, key, index));
        const options = this.rowOptions;
        options['data-key'] = key;
        return Html.tag('tr', cells.join(''), options);
    }
    /**
     * Creates column objects and initializes them.
     */
    public async initColumns() {
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
    /**
     * Creates a [[DataColumn]] object based on a string in the format of "attribute:format:label".
     * @param text the column specification string
     * @return the column instance
     * @throws Error if the column specification is invalid
     */
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
    /**
     * This function tries to guess the columns to show from the given data
     * if [[columns]] are not explicitly specified.
     */
    protected guessColumns() {
        const models = this._models;
        const model = models[1];
        for (const name in model)
            if (model[name] === null || /boolean|number|string/.test(typeof model[name])) this.columns.push(name);
    }
}
