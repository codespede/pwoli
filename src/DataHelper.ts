import Component from './Component';

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
}
