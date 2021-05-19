import Component from './Component';

export default class Widget extends Component {
  public static autoIdPrefix = 'w';
  public static counter = 0;
  private _id;
  public constructor(config) {
    super(config);
    Object.assign(this, config);
  }

  public getId(autogenerate = true) {
    if (autogenerate && this._id === undefined) this._id = Widget.autoIdPrefix + Widget.counter++;
    return this._id;
  }

  public async render() {
    return await this.run();
  }

  public async run(): Promise<any> {
    //
  }

  public registerAssets() {
    //
  }
}
