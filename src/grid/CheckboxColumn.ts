import Pwoli from '../base/Application';
import Column from './Column';
import Html from '../helpers/Html';
import Model from '../base/Model';

export default class CheckboxColumn extends Column {
  public name = 'selection';
  public checkboxOptions: { [key: string]: any } = {};
  public multiple = true;
  public cssClass: string;

  public constructor(config: { [key: string]: any }) {
    super(config);
    Object.assign(this, config);
  }

  public async init() {
    await super.init.call(this);
    if (this.name.length === 0) throw new Error('The "name" property must be set.');
    if (!/.*\[\]$/.test(this.name)) this.name += '[]';
    this.registerClientScript();
  }

  protected async renderHeaderCellContent(): Promise<string> {
    if (this.header !== undefined || !this.multiple) return await super.renderHeaderCellContent();
    return Html.checkbox(this.getHeaderCheckBoxName(), false, { class: 'select-on-check-all' });
  }

  protected async renderDataCellContent(model: Model, key: string, index: number): Promise<string> {
    if (this.content !== undefined) return super.renderDataCellContent(model, key, index);
    let options;
    if (typeof this.checkboxOptions === 'function') options = this.checkboxOptions(model, key, index, this);
    else options = this.checkboxOptions;
    if (options.value === undefined) options.value = typeof key !== 'string' ? JSON.stringify(key) : key;
    if (this.cssClass !== undefined) Html.addCssClass(options, this.cssClass);
    return Html.checkbox(this.name, options.checked !== undefined, options);
  }

  protected getHeaderCheckBoxName(): string {
    let name = this.name;
    let matches = name.match(/(.*)\[\]$/);
    if (matches.length > 0) name = matches[1];
    matches = name.match(/(.*)\]$/);
    if (matches === null) matches = [];
    if (matches.length > 0) name = matches[1] + '_all]';
    else name += '_all';
    return name;
  }

  public registerClientScript(): void {
    const id = this.grid.options.id;
    const options = JSON.stringify({
      name: this.name,
      class: this.cssClass,
      multiple: this.multiple,
      checkAll: this.grid.showHeader ? this.getHeaderCheckBoxName() : null,
    });
    Pwoli.view.registerJs(`jQuery('#${id}').pwoliGridView('setSelectionColumn', ${options});`);
  }
}
