import GridView from './GridView';
import Model from '../base/Model';
import Component from '../base/Component';
import Html from '../helpers/Html';
/**
 * Column is the base class of all [[GridView]] column classes.
 * For more details and usage information on Column, see the [guide article on data widgets](guide:output-data-widgets).
 */
export default class Column extends Component {
    /**
     * The grid view object that owns this column.
     */
    public grid: GridView;
    /**
     * The header cell content. Note that it will not be HTML-encoded.
     */
    public header: string;
    /**
     * The footer cell content. Note that it will not be HTML-encoded.
     */
    public footer: string;
    /**
     * This is a callable that will be used to generate the content of each cell.
     * The signature of the function should be the following: `function (model, key, index, column)`.
     * Where `model`, `key`, and `index` refer to the model, key and index of the row currently being rendered
     * and `column` is a reference to the [[Column]] object.
     */
    public content: string | CallableFunction;
    /**
     * Whether this column is visible. Defaults to true.
     */
    public visible = true;
    /**
     * The HTML attributes for the column group tag.
     * @see [[Html.renderTagAttributes]] for details on how attributes are being rendered.
     */
    public options: { [key: string]: any } = {};
    /**
     * The HTML attributes for the header cell tag.
     * @see [[Html.renderTagAttributes]] for details on how attributes are being rendered.
     */
    public headerOptions: { [key: string]: any } = {};
    /**
     * Closure the HTML attributes for the data cell tag. This can either be an array of
     * attributes or an anonymous function ([[Closure]]) that returns such an array.
     * The signature of the function should be the following: `function (model, key, index, column)`.
     * Where `model`, `key`, and `index` refer to the model, key and index of the row currently being rendered
     * and `column` is a reference to the [[Column]] object.
     * A function may be used to assign different attributes to different rows based on the data in that row.
     *
     * @see [[Html.renderTagAttributes]] for details on how attributes are being rendered.
     */
    public contentOptions: { [key: string]: any } = {};
    /**
     * The HTML attributes for the footer cell tag.
     * @see [[Html.renderTagAttributes]] for details on how attributes are being rendered.
     */
    public footerOptions: { [key: string]: any } = {};
    /**
     * The HTML attributes for the filter cell tag.
     * @see [[Html.renderTagAttributes]] for details on how attributes are being rendered.
     */
    public filterOptions: { [key: string]: any } = {};

    public constructor(config: { [key: string]: any } = {}) {
        super(config);
        Object.assign(this, config);
    }
    /**
     * Renders the header cell.
     */
    public async renderHeaderCell(): Promise<string> {
        return Html.tag('th', await this.renderHeaderCellContent(), this.headerOptions);
    }
    /**
     * Renders the footer cell.
     */
    public renderFooterCell(): string {
        return Html.tag('td', this.renderFooterCellContent(), this.footerOptions);
    }
    /**
     * Renders a data cell.
     * @param model the data model being rendered
     * @param key the key associated with the data model
     * @param index the zero-based index of the data item among the item array returned by [[GridView.dataProvider]].
     * @return the rendering result
     */
    public async renderDataCell(model: Model, key: string, index: number): Promise<string> {
        const options = this.contentOptions;
        return Html.tag('td', await this.renderDataCellContent(model, key, index), options);
    }
    /**
     * Renders the filter cell.
     */
    public renderFilterCell(): string {
        return Html.tag('td', this.renderFilterCellContent(), this.filterOptions);
    }
    /**
     * Renders the header cell content.
     * The default implementation simply renders [[header]].
     * This method may be overridden to customize the rendering of the header cell.
     * @return the rendering result
     */
    protected async renderHeaderCellContent(): Promise<string> {
        return (this.header !== undefined ? this.header : await this.getHeaderCellLabel()).trim();
    }
    /**
     * Returns header cell label.
     * This method may be overridden to customize the label of the header cell.
     * @return label
     */
    protected async getHeaderCellLabel(): Promise<string> {
        return this.grid.emptyCell;
    }
    /**
     * Renders the footer cell content.
     * The default implementation simply renders [[footer]].
     * This method may be overridden to customize the rendering of the footer cell.
     * @return the rendering result
     */
    protected renderFooterCellContent(): string {
        return (this.footer !== undefined ? this.footer : this.grid.emptyCell).trim();
    }
    /**
     * Renders the data cell content.
     * @param model the data model
     * @param key the key associated with the data model
     * @param index the zero-based index of the data model among the models array returned by [[GridView.dataProvider]].
     * @return the rendering result
     */
    protected async renderDataCellContent(model: Model, key: string, index: number): Promise<string> {
        console.log('rdcc', this.content, key, model);
        if (this.content !== undefined) return (this.content as CallableFunction)(model, key, index, this);
        return this.grid.emptyCell;
    }
    /**
     * Renders the filter cell content.
     * The default implementation simply renders a space.
     * This method may be overridden to customize the rendering of the filter cell (if any).
     * @return the rendering result
     */
    protected renderFilterCellContent(): string {
        return this.grid.emptyCell;
    }
}
