import Column from './Column';
import Model from '../base/Model';
/**
 * SerialColumn displays a column of row numbers (1-based).
 *
 * To add a SerialColumn to the [[GridView]], add it to the [[GridView.columns|columns]] configuration as follows:
 *
 * ```js
 * {
 *  columns:
 *     // ...
 *     {
 *         class => 'SerialColumn',
 *         // you may configure additional properties here
 *     }
 * }
 * ```
 * For more details and usage information on SerialColumn, see the [guide article on data widgets](guide:output-data-widgets).
 */
export default class DataColumn extends Column {
  /** @inheritdoc */
  public header = '#';

  public constructor(config: { [key: string]: any }) {
    super(config);
    Object.assign(this, config);
  }
  /** @inheritdoc */
  protected async renderDataCellContent(model: Model, key: string, index: number): Promise<string> {
    const pagination = this.grid.dataProvider.getPagination();
    if (pagination !== false) return pagination.getOffset() + index + 1;
    return (index + 1).toString();
  }
}
