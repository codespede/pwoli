import Component from './Component';
import url = require('url');
export default class DataHelper extends Component {
  public static remove(object, key, defaultValue = null) {
    const value = object[key] !== undefined ? object[key] : defaultValue;
    delete object[key];
    return value;
  }

  public static async replaceAsync(str, regex, asyncFn) {
    const promises = [];
    str.replace(regex, (match, ...args) => {
      const promise = asyncFn(match, ...args);
      promises.push(promise);
    });
    const data = await Promise.all(promises);
    return str.replace(regex, () => data.shift());
  }

  public static parseUrl(queryString) {
    const params = url.parse(queryString, true).query;
    let parsedParams = {};
    for (let param in params) {
      let matches = param.match(/(.*)\[(.*)\]/);
      if (matches) {
        console.log(param, matches);
        parsedParams[matches[1]] = parsedParams[matches[1]] !== undefined? parsedParams[matches[1]] : {};
        parsedParams[matches[1]][matches[2]] = params[param];
      }else
        parsedParams[param] = params[param];
    }
    return parsedParams;
  }
}
