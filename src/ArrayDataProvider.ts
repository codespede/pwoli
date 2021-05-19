import DataProvider from './DataProvider';

export default class ArrayDataProvider extends DataProvider {
  public constructor(config) {
    super(config);
    Object.assign(this, config);
  }
}
