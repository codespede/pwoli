import Component from "./Component";
import Html from "./Html";

export default class Column extends Component {
    public grid;
    public header;
    public footer = '';
    public content;
    public visible = true;
    public options: any = [];
    public headerOptions: any = [];
    public contentOptions: any = [];
    public footerOptions: any = [];
    public filterOptions: any = [];

    public constructor(config) {
        super(config);
        Object.assign(this, config);
    }

    public async renderHeaderCell() {
        return Html.tag('th', await this.renderHeaderCellContent(), this.headerOptions);
    }

    public renderFooterCell() {
        return Html.tag('td', this.renderFooterCellContent(), this.footerOptions);
    }

    public renderDataCell(model, key, index) {
        const options = this.contentOptions;
        return Html.tag('td', this.renderDataCellContent(model, key, index), options);
    }

    public renderFilterCell() {
        return Html.tag('td', this.renderFilterCellContent(), this.filterOptions);
    }

    protected async renderHeaderCellContent() {
        return (this.header !== '' ? this.header : await this.getHeaderCellLabel()).trim();
    }

    protected getHeaderCellLabel() {
        return this.grid.emptyCell;
    }

    protected renderFooterCellContent() {
        return (this.footer !== '' ? this.footer : this.grid.emptyCell).trim();
    }

    protected renderDataCellContent(model, key, index) {
        if (this.content !== undefined)
            return this.content(model, key, index, this);
        return this.grid.emptyCell;
    }

    protected renderFilterCellContent() {
        return this.grid.emptyCell;
    }
}
