import Application from './Application';

export default class Component {
  public initialization;
  public constructor(config = {}) {
    Object.assign(this, config);
    this.initialization = this.init();
  }

  public async init() {
    
  }
}
