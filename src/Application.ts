import url = require('url');
import Component from './Component';
import SequelizeAdapter from './ORMAdapters/SequelizeAdapter';
import View from './View';

export default class Application extends Component {
  public static request;
  public static charset = 'UTF-8';
  public static view = new View({});
  public static aliases = {};
  public static viewPath;
  public static orm: 'sequelize' | 'other' = 'sequelize';
  public static ormAdapterClasses = { sequelize: SequelizeAdapter };
  private static _ormAdapter;
  public static ormModelClass;
  public static getFullUrlOfRequest() {
    const req = this.request;
    console.log('gfuor', {
        protocol: req.protocol || 'http',
        host: req.host || req.headers.host,
        pathname: req.originalUrl || req.url,
      })
    return decodeURIComponent(
      url.format({
        protocol: req.protocol || 'http',
        host: req.host || req.headers.host,
        pathname: req.originalUrl || req.url,
      }),
    );
  }

  public static setAlias(alias, path) {
    this.aliases[alias] = path;
  }

  public static getAlias(alias) {
    return this.aliases[alias] !== undefined ? this.aliases[alias] : false;
  }

  public static setViewPath(path) {
    const resolved = this.getAlias(path);
    this.viewPath = resolved !== false ? resolved : path;
  }

  public static getViewPath() {
    return this.viewPath;
  }

  public static getORMAdapter() {
    if(this._ormAdapter === undefined)
      this._ormAdapter = new this.ormAdapterClasses[this.orm]({});
    return this._ormAdapter;
  }
}
