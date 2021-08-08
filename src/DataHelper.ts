import Component from './Component';
import url = require('url');
import { link } from 'fs';
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
    return this.parseQueryParams(url.parse(queryString, true).query);
  }

  public static parseQueryParams(params) {
    let parsedParams = {};
    for (let param in params) {
      let matches = param.match(/(.*)\[(.*)\]/);
      if (matches) {
        parsedParams[matches[1]] = parsedParams[matches[1]] !== undefined? parsedParams[matches[1]] : {};
        parsedParams[matches[1]][matches[2]] = params[param];
      }else
        parsedParams[param] = params[param];
    }
    return parsedParams;
  }

    public static multiSort(array, key, direction: string | {} = 'SORT_ASC', sortFlag: string | {} = 'SORT_REGULAR') {
        const keys = Array.isArray(key) ? key : [key];
        if (keys.length === 0 || array.length === 0) {
            return;
        }
        let n = keys.length;
        if (typeof direction === 'string') {
            direction = this.arrayFill(0, n, direction);
        } else if (Object.keys(direction).length !== n) {
            throw new Error('The length of direction parameter must be the same as that of keys.');
        }
        if (typeof sortFlag === 'string') {
            sortFlag = this.arrayFill(0, n, sortFlag);
        } else if (Object.keys(sortFlag).length !== n) {
            throw new Error('The length of sortFlag parameter must be the same as that of keys.');
        }
        let args = [];
        let i = 0;
        for(let k of keys) {
            let flag = sortFlag[i];
            args.push(this.getColumn(array, k));
            args.push(direction[i]);
            args.push(flag);
            i++;
        }

        // This fix is used for cases when main sorting specified by columns has equal values
        // Without it it will lead to Fatal Error: Nesting level too deep - recursive dependency?
        args.push(this.range(1, array.length));
        args.push('SORT_ASC');
        args.push('SORT_NUMERIC');

        args.push(array);
        this.arrayMultiSort.apply(null, args);
    }

    public static getColumn(array, name) {
        const result = {};
        for(let k in array)
            result[k] = array[k][name];
        return result;
    }

    public static arrayMultiSort(arr) {
        var g, i, j, k, l, sal, vkey, elIndex, lastSorts, tmpArray, zlast;

        var sortFlag = [0];
        var thingsToSort = [];
        var nLastSort = [];
        var lastSort = [];
        // possibly redundant
        var args = arguments;

        var flags = {
        'SORT_REGULAR' : 16,
        'SORT_NUMERIC' : 17,
        'SORT_STRING'  : 18,
        'SORT_ASC'     : 32,
        'SORT_DESC'    : 40
        };

        var sortDuplicator = function(a, b) {
        return nLastSort.shift();
        };

        var sortFunctions = [
            [

                function(a, b) {
                lastSort.push(a > b ? 1 : (a < b ? -1 : 0));
                return a > b ? 1 : (a < b ? -1 : 0);
                },
                function(a, b) {
                lastSort.push(b > a ? 1 : (b < a ? -1 : 0));
                return b > a ? 1 : (b < a ? -1 : 0);
                }
            ],
            [

                function(a, b) {
                lastSort.push(a - b);
                return a - b;
                },
                function(a, b) {
                lastSort.push(b - a);
                return b - a;
                }
            ],
            [

                function(a, b) {
                lastSort.push((a + '') > (b + '') ? 1 : ((a + '') < (b + '') ? -1 : 0));
                return (a + '') > (b + '') ? 1 : ((a + '') < (b + '') ? -1 : 0);
                },
                function(a, b) {
                lastSort.push((b + '') > (a + '') ? 1 : ((b + '') < (a + '') ? -1 : 0));
                return (b + '') > (a + '') ? 1 : ((b + '') < (a + '') ? -1 : 0);
                }
            ]
        ];

        var sortArrs = [
        []
        ];

        var sortKeys = [
        []
        ];

        // Store first argument into sortArrs and sortKeys if an Object.
        // First Argument should be either a Javascript Array or an Object, otherwise function would return FALSE like in PHP
        if (Object.prototype.toString.call(arr) === '[object Array]') {
        sortArrs[0] = arr;
        } else if (arr && typeof arr === 'object') {
            for (i in arr) {
                if (arr.hasOwnProperty(i)) {
                sortKeys[0].push(i);
                sortArrs[0].push(arr[i]);
                }
            }
        } else {
            return false;
        }

        // arrMainLength: Holds the length of the first array. All other arrays must be of equal length, otherwise function would return FALSE like in PHP
        //
        // sortComponents: Holds 2 indexes per every section of the array that can be sorted. As this is the start, the whole array can be sorted.
        var arrMainLength = sortArrs[0].length;
        var sortComponents = [0, arrMainLength];

        // Loop through all other arguments, checking lengths and sort flags of arrays and adding them to the above variables.
        var argl = arguments.length;
        for (j = 1; j < argl; j++) {
            if (Object.prototype.toString.call(arguments[j]) === '[object Array]') {
                sortArrs[j] = arguments[j];
                sortFlag[j] = 0;
                if (arguments[j].length !== arrMainLength) {
                return false;
                }
            } else if (arguments[j] && typeof arguments[j] === 'object') {
                sortKeys[j] = [];
                sortArrs[j] = [];
                sortFlag[j] = 0;
                for (i in arguments[j]) {
                if (arguments[j].hasOwnProperty(i)) {
                    sortKeys[j].push(i);
                    sortArrs[j].push(arguments[j][i]);
                }
                }
                if (sortArrs[j].length !== arrMainLength) {
                return false;
                }
            } else if (typeof arguments[j] === 'string') {
                var lFlag = sortFlag.pop();
                // Keep extra parentheses around latter flags check to avoid minimization leading to CDATA closer
                if (typeof flags[arguments[j]] === 'undefined' || ((((flags[arguments[j]]) >>> 4) & (lFlag >>> 4)) > 0)) {
                return false;
                }
                sortFlag.push(lFlag + flags[arguments[j]]);
            } else {
                return false;
            }
        }

        for (i = 0; i !== arrMainLength; i++) {
            thingsToSort.push(true);
        }

        // Sort all the arrays....
        for (i in sortArrs) {
            if (sortArrs.hasOwnProperty(i)) {
                lastSorts = [];
                tmpArray = [];
                elIndex = 0;
                nLastSort = [];
                lastSort = [];

                // If there are no sortComponents, then no more sorting is neeeded. Copy the array back to the argument.
                if (sortComponents.length === 0) {
                    if (Object.prototype.toString.call(arguments[i]) === '[object Array]') {
                        args[i] = sortArrs[i];
                    } else {
                        for (k in arguments[i]) {
                        if (arguments[i].hasOwnProperty(k)) {
                            delete arguments[i][k];
                        }
                        }
                        sal = sortArrs[i].length;
                        for (j = 0, vkey = 0; j < sal; j++) {
                        vkey = sortKeys[i][j];
                        args[i][vkey] = sortArrs[i][j];
                        }
                    }
                    delete sortArrs[i];
                    delete sortKeys[i];
                    continue;
                }

                // Sort function for sorting. Either sorts asc or desc, regular/string or numeric.
                var sFunction = sortFunctions[(sortFlag[i] & 3)][((sortFlag[i] & 8) > 0) ? 1 : 0];

                // Sort current array.
                for (l = 0; l !== sortComponents.length; l += 2) {
                    tmpArray = sortArrs[i].slice(sortComponents[l], sortComponents[l + 1] + 1);
                    tmpArray.sort(sFunction);
                    // Is there a better way to copy an array in Javascript?
                    lastSorts[l] = [].concat(lastSort);
                    elIndex = sortComponents[l];
                    for (g in tmpArray) {
                        if (tmpArray.hasOwnProperty(g)) {
                        sortArrs[i][elIndex] = tmpArray[g];
                        elIndex++;
                        }
                    }
                }

                // Duplicate the sorting of the current array on future arrays.
                sFunction = sortDuplicator;
                for (j in sortArrs) {
                    if (sortArrs.hasOwnProperty(j)) {
                        if (sortArrs[j] === sortArrs[i]) {
                        continue;
                        }
                        for (l = 0; l !== sortComponents.length; l += 2) {
                        tmpArray = sortArrs[j].slice(sortComponents[l], sortComponents[l + 1] + 1);
                        // alert(l + ':' + nLastSort);
                        nLastSort = [].concat(lastSorts[l]);
                        tmpArray.sort(sFunction);
                        elIndex = sortComponents[l];
                        for (g in tmpArray) {
                            if (tmpArray.hasOwnProperty(g)) {
                            sortArrs[j][elIndex] = tmpArray[g];
                            elIndex++;
                            }
                        }
                        }
                    }
                }

                // Duplicate the sorting of the current array on array keys
                for (j in sortKeys) {
                    if (sortKeys.hasOwnProperty(j)) {
                        for (l = 0; l !== sortComponents.length; l += 2) {
                        tmpArray = sortKeys[j].slice(sortComponents[l], sortComponents[l + 1] + 1);
                        nLastSort = [].concat(lastSorts[l]);
                        tmpArray.sort(sFunction);
                        elIndex = sortComponents[l];
                        for (g in tmpArray) {
                            if (tmpArray.hasOwnProperty(g)) {
                            sortKeys[j][elIndex] = tmpArray[g];
                            elIndex++;
                            }
                        }
                        }
                    }
                }

                // Generate the next sortComponents
                zlast = null;
                sortComponents = [];
                for (j in sortArrs[i]) {
                    if (sortArrs[i].hasOwnProperty(j)) {
                        if (!thingsToSort[j]) {
                        if ((sortComponents.length & 1)) {
                            sortComponents.push(j - 1);
                        }
                        zlast = null;
                        continue;
                        }
                        if (!(sortComponents.length & 1)) {
                        if (zlast !== null) {
                            if (sortArrs[i][j] === zlast) {
                            sortComponents.push(j - 1);
                            } else {
                            thingsToSort[j] = false;
                            }
                        }
                        zlast = sortArrs[i][j];
                        } else {
                        if (sortArrs[i][j] !== zlast) {
                            sortComponents.push(j - 1);
                            zlast = sortArrs[i][j];
                        }
                        }
                    }
                }

                if (sortComponents.length & 1) {
                    sortComponents.push(j);
                }
                if (Object.prototype.toString.call(arguments[i]) === '[object Array]') {
                    args[i] = sortArrs[i];
                } else {
                    for (j in arguments[i]) {
                        if (arguments[i].hasOwnProperty(j)) {
                        delete arguments[i][j];
                        }
                    }

                    sal = sortArrs[i].length;
                    for (j = 0, vkey = 0; j < sal; j++) {
                        vkey = sortKeys[i][j];
                        args[i][vkey] = sortArrs[i][j];
                    }
                }
                delete sortArrs[i];
                delete sortKeys[i];
            }
        }
        return true;
    }

    public static arrayFill(startIndex, num, mixedVal) {
        let key
        const tmpArr = {}
        if (!isNaN(startIndex) && !isNaN(num)) {
            for (key = 0; key < num; key++) {
            tmpArr[(key + startIndex)] = mixedVal
            }
        }
        return tmpArr
    }

    public static range (low, high, step = 1) {
        const matrix = []
        let iVal
        let endval
        let plus
        const walker = step || 1
        let chars = false
        if (!isNaN(low) && !isNaN(high)) {
            iVal = low
            endval = high
        } else if (isNaN(low) && isNaN(high)) {
            chars = true
            iVal = low.charCodeAt(0)
            endval = high.charCodeAt(0)
        } else {
            iVal = (isNaN(low) ? 0 : low)
            endval = (isNaN(high) ? 0 : high)
        }
        plus = !(iVal > endval)
        if (plus) {
            while (iVal <= endval) {
            matrix.push(((chars) ? String.fromCharCode(iVal) : iVal))
            iVal += walker
            }
        } else {
            while (iVal >= endval) {
            matrix.push(((chars) ? String.fromCharCode(iVal) : iVal))
            iVal -= walker
            }
        }
        return matrix
    }

    public static serializeLinks(links) {
        for (let rel in links) {
            if (Array.isArray(links[rel])) {
                for (let i = 0; i <= links[rel].length; i++)
                    links[rel][i] = { href: links[rel][i] };
            }
        }
        return links;
    }
}
