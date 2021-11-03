import Column from './Column';
import Html from '../helpers/Html';
import Model from '../base/Model';

export default class DataColumn extends Column {
  public name = 'radioButtonSelection';
  public radioOptions: { [key: string]: any } = {};

  public constructor(config: { [key: string]: any }) {
    super(config);
    Object.assign(this, config);
  }

  public async init() {
    await super.init.call(this);
    if (this.name.length === 0) throw new Error('The "name" property must be set.');
  }

  protected async renderDataCellContent(model: Model, key: string, index: number) {
    if (this.content !== undefined) return super.renderDataCellContent(model, key, index);
    let options;
    if (typeof this.radioOptions === 'function') options = this.radioOptions(model, key, index, this);
    else {
      options = this.radioOptions;
      if (options.value === undefined) options.value = typeof key !== 'string' ? JSON.stringify(key) : key;
    }
    const checked = options.checked !== undefined ? options.checked : false;
    return Html.radio(this.name, checked, options);
  }
}
