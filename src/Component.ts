import Application from './Application';

export default class Component {
  public initialization: Promise<void>;
  public constructor(config: { [key: string]: any } = {}) {
    Object.assign(this, config);
    this.initialization = this.init();
  }

  public async init() {
    
  }
}
