import GridView from './GridView';
import Model from './Model';
import Component from './Component';
import Html from './Html';

export default class Column extends Component {
  public grid: GridView;
  public header: string;
  public footer: string;
  public content: string | CallableFunction;
  public visible = true;
  public options: { [key: string]: any } = {};
  public headerOptions: { [key: string]: any } = {};
  public contentOptions: { [key: string]: any } = {};
  public footerOptions: { [key: string]: any } = {};
  public filterOptions: { [key: string]: any } = {};

  public constructor(config) {
    super(config);
    Object.assign(this, config);
  }

  public async renderHeaderCell(): Promise<string> {
    return Html.tag('th', await this.renderHeaderCellContent(), this.headerOptions);
  }

  public renderFooterCell(): string {
    return Html.tag('td', this.renderFooterCellContent(), this.footerOptions);
  }

  public async renderDataCell(model: Model, key: string, index: number): Promise<string> {
    const options = this.contentOptions;
    return Html.tag('td', await this.renderDataCellContent(model, key, index), options);
  }

  public renderFilterCell(): string {
    return Html.tag('td', this.renderFilterCellContent(), this.filterOptions);
  }

  protected async renderHeaderCellContent(): Promise<string> {
    return (this.header !== undefined ? this.header : await this.getHeaderCellLabel()).trim();
  }

  protected async getHeaderCellLabel(): Promise<string> {
    return this.grid.emptyCell;
  }

  protected renderFooterCellContent(): string {
    return (this.footer !== undefined ? this.footer : this.grid.emptyCell).trim();
  }

  protected async renderDataCellContent(model: Model, key: string, index: number): Promise<string> {
    if (this.content !== undefined) return (this.content as CallableFunction)(model, key, index, this);
    return this.grid.emptyCell;
  }

  protected renderFilterCellContent(): string {
    return this.grid.emptyCell;
  }
}
