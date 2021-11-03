import Column from './Column';
import Html from '../helpers/Html';
import Model from '../base/Model';
/**
 * RadioButtonColumn displays a column of radio buttons in a grid view.
 *
 * To add a RadioButtonColumn to the [[GridView]], add it to the [[GridView.columns|columns]] configuration as follows:
 *
 * ```js
 * { 
 *  columns: [
 *     // ...
 *     {
 *         class: 'RadioButtonColumn',
 *         radioOptions: function (model) {
 *              return {
 *                  value: model['value'],
 *                  checked: model['value']
 *              }
 *          }
 *     }
 *  ]
 * }
 * ```
 */
export default class DataColumn extends Column {
  /**
   * The name of the input radio button input fields.
   */
  public name = 'radioButtonSelection';
  /**
   * Closure the HTML attributes for the radio buttons. This can either be an array of
   * attributes or an anonymous function ([[Closure]]) returning such an array.
   *
   * The signature of the function should be as follows: `function (model, key, index, column)`
   * where `model`, `key`, and `index` refer to the model, key and index of the row currently being rendered
   * and `column` is a reference to the [[RadioButtonColumn]] object.
   *
   * A function may be used to assign different attributes to different rows based on the data in that row.
   * Specifically if you want to set a different value for the radio button you can use this option
   * in the following way (in this example using the `name` attribute of the model):
   *
   * ```js
   * {
   *    radioOptions: function (model, key, index, column) {
   *     return {value: model.attribute}
   *  }
   * }
   * ```
   * @see [[Html.renderTagAttributes]] for details on how attributes are being rendered.
   */
  public radioOptions: { [key: string]: any } = {};

  public constructor(config: { [key: string]: any }) {
    super(config);
    Object.assign(this, config);
  }
  /**
     * {@inheritdoc}
     * @throws InvalidConfigException if [[name]] is not set.
     */
  public async init() {
    await super.init.call(this);
    if (this.name.length === 0) throw new Error('The "name" property must be set.');
  }
  /** @inheritdoc */
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
