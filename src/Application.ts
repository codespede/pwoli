import url = require('url');
import Component from './Component';
import View from './View';

export default class Application extends Component {
  public static request;
  public static charset = 'UTF-8';
  public static view = new View({});
  public static aliases = {};
  public static viewPath;

  public static getFullUrlOfRequest() {
    const req = this.request;
    return decodeURIComponent(
      url.format({
        protocol: req.protocol,
        host: req.get('host'),
        pathname: req.originalUrl,
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
}
