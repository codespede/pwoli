import Component from '../base/Component';
import url = require('url');
/**
 * BaseDataHelper provides concrete implementation for [[DataHelper]].
 *
 * Do not use BaseDataHelper. Use [[DataHelper]] instead.
 *
 */
export default class DataHelper extends Component {
    /**
     * Removes an item from an array and returns the value. If the key does not exist in the array, the default value
     * will be returned instead.
     *
     * Usage examples,
     *
     * ```js
     * // let array = {type: 'A', options: [1, 2]};
     * // working with array
     * let type = DataHelper.remove(array, 'type');
     * // array content
     * // array = {options: [1, 2]];
     * ```
     *
     * @param array the array to extract value from
     * @param key key name of the array element
     * @param default the default value to be returned if the specified key does not exist
     * @return the value of the element if found, default value otherwise
     */
    public static remove(object: { [key: string]: any }, key: string, defaultValue: any = null) {
        const value = object[key] !== undefined ? object[key] : defaultValue;
        delete object[key];
        return value;
    }

    public static async replaceAsync(string: string, regex, asyncFn: CallableFunction) {
        const promises = [];
        let string2 = string;
        string2.replace(regex, (match, ...args) => {
            const promise = asyncFn(match, ...args);
            promises.push(promise);
            return '';
        });
        const data = await Promise.all(promises);
        return string.replace(regex, () => data.shift());
    }

    public static parseUrl(queryString: string): { [key: string]: string } {
        return this.parseQueryParams(url.parse(queryString, true).query);
    }

    public static parseQueryParams(params: { [key: string]: string | string[] | undefined }): {
        [key: string]: any;
    } {
        let parsedParams = {};
        for (let param in params) {
            let matches = param.match(/(.*)\[(.*)\]/);
            if (matches) {
                parsedParams[matches[1]] = parsedParams[matches[1]] !== undefined ? parsedParams[matches[1]] : {};
                parsedParams[matches[1]][matches[2]] = params[param];
            } else parsedParams[param] = params[param];
        }
        return parsedParams;
    }
    /**
     * Sorts an array of objects or arrays (with the same structure) by one or several keys.
     * @param array the array to be sorted. The array will be modified after calling this method.
     * @param key the key(s) to be sorted by. This refers to a key name of the sub-array
     * elements, a property name of the objects, or a callback function returning the values for comparison
     * purpose. The callback function signature should be: `function(item)`.
     * To sort by multiple keys, provide an array of keys here.
     * @param direction the sorting direction. It can be either `SORT_ASC` or 'SORT_DESC'.
     * When sorting by multiple keys with different sorting directions, use an array of sorting directions.
     * @param sortFlag the JS sort flag. Valid values include
     * 'SORT_REGULAR', 'SORT_NUMERIC', 'SORT_STRING', 'SORT_LOCALE_STRING', 'SORT_NATURAL' and 'SORT_FLAG_CASE'.
     * for more details. When sorting by multiple keys with different sort flags, use an array of sort flags.
     * @throws InvalidArgumentException if the direction or sortFlag parameters do not have
     * correct number of elements as that of key.
     */
    public static multiSort(
        array: Array<any>,
        key: Array<string | number> | string | number,
        direction: string | {} = 'SORT_ASC',
        sortFlag: string | {} = 'SORT_REGULAR',
    ) {
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
        for (let k of keys) {
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
    /**
     * Returns the values of a specified column in an array.
     * The input array should be multidimensional or an array of objects.
     *
     * For example,
     *
     * ```js
     * let array = [
     *     {id: '123', data: 'abc'},
     *     {id: '345', data: 'def'},
     * ]
     * let result = DataHelper.getColumn(array, 'id');
     * // the result is: ['123', '345']
     *
     * // using callback
     * result = DataHelper.getColumn(array, (element) => {
     *     return element['id'];
     * });
     * ```
     *
     * @param array
     * @param name
     * @param keepKeys whether to maintain the array keys. If false, the resulting array
     * will be re-indexed with integers.
     * @return the list of column values
     */
    public static getColumn(array: Array<any>, name: string | number): { [key: string]: any } {
        const result = {};
        for (let k in array) result[k] = array[k][name];
        return result;
    }

    public static arrayMultiSort(arr: Array<any>) {
        var g, i, j, k, l, sal, vkey, elIndex, lastSorts, tmpArray, zlast;

        var sortFlag = [0];
        var thingsToSort = [];
        var nLastSort = [];
        var lastSort = [];
        // possibly redundant
        var args = arguments;

        var flags = {
            SORT_REGULAR: 16,
            SORT_NUMERIC: 17,
            SORT_STRING: 18,
            SORT_ASC: 32,
            SORT_DESC: 40,
        };

        var sortDuplicator = function (a, b) {
            return nLastSort.shift();
        };

        var sortFunctions = [
            [
                function (a, b) {
                    lastSort.push(a > b ? 1 : a < b ? -1 : 0);
                    return a > b ? 1 : a < b ? -1 : 0;
                },
                function (a, b) {
                    lastSort.push(b > a ? 1 : b < a ? -1 : 0);
                    return b > a ? 1 : b < a ? -1 : 0;
                },
            ],
            [
                function (a, b) {
                    lastSort.push(a - b);
                    return a - b;
                },
                function (a, b) {
                    lastSort.push(b - a);
                    return b - a;
                },
            ],
            [
                function (a, b) {
                    lastSort.push(a + '' > b + '' ? 1 : a + '' < b + '' ? -1 : 0);
                    return a + '' > b + '' ? 1 : a + '' < b + '' ? -1 : 0;
                },
                function (a, b) {
                    lastSort.push(b + '' > a + '' ? 1 : b + '' < a + '' ? -1 : 0);
                    return b + '' > a + '' ? 1 : b + '' < a + '' ? -1 : 0;
                },
            ],
        ];

        var sortArrs = [[]];

        var sortKeys = [[]];

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
                if (typeof flags[arguments[j]] === 'undefined' || ((flags[arguments[j]] >>> 4) & (lFlag >>> 4)) > 0) {
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
                var sFunction = sortFunctions[sortFlag[i] & 3][(sortFlag[i] & 8) > 0 ? 1 : 0];

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
                            if (sortComponents.length & 1) {
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
        let key;
        const tmpArr = {};
        if (!isNaN(startIndex) && !isNaN(num)) {
            for (key = 0; key < num; key++) {
                tmpArr[key + startIndex] = mixedVal;
            }
        }
        return tmpArr;
    }

    public static range(low, high, step = 1) {
        const matrix = [];
        let iVal;
        let endval;
        let plus;
        const walker = step || 1;
        let chars = false;
        if (!isNaN(low) && !isNaN(high)) {
            iVal = low;
            endval = high;
        } else if (isNaN(low) && isNaN(high)) {
            chars = true;
            iVal = low.charCodeAt(0);
            endval = high.charCodeAt(0);
        } else {
            iVal = isNaN(low) ? 0 : low;
            endval = isNaN(high) ? 0 : high;
        }
        plus = !(iVal > endval);
        if (plus) {
            while (iVal <= endval) {
                matrix.push(chars ? String.fromCharCode(iVal) : iVal);
                iVal += walker;
            }
        } else {
            while (iVal >= endval) {
                matrix.push(chars ? String.fromCharCode(iVal) : iVal);
                iVal -= walker;
            }
        }
        return matrix;
    }

    public static serializeLinks<T extends { [key: string]: any }>(links: T): T {
        for (let rel in links) {
            if (Array.isArray(links[rel])) {
                for (let i = 0; i <= links[rel].length; i++) links[rel][i] = { href: links[rel][i] };
            }
        }
        return links;
    }
    /**
     * Retrieves the value of an array element or object property with the given key or property name.
     * If the key does not exist in the array, the default value will be returned instead.
     * Not used when getting value from an object.
     *
     * The key may be specified in a dot format to retrieve the value of a sub-array or the property
     * of an embedded object. In particular, if the key is `x.y.z`, then the returned value would
     * be `array['x']['y']['z']` or `array.x.y.z` (if `array` is an object). If `array['x']`
     * or `array.x` is neither an array nor an object, the default value will be returned.
     * Note that if the array already has an element `x.y.z`, then its value will be returned
     * instead of going through the sub-arrays. So it is better to be done specifying an array of key names
     * like `['x', 'y', 'z']`.
     *
     * Below are some usage examples,
     *
     * ```js
     * // working with array
     * let username = DataHelper.getValue(POST, 'username');
     * // working with object
     * username = DataHelper.getValue(user, 'username');
     * // working with callback function
     * let fullName = DataHelper.getValue(user, (user, defaultValue) => {
     *     return user.firstName . ' ' . user.lastName;
     * });
     * // using dot format to retrieve the property of embedded object
     * let street = DataHelper.getValue(users, 'address.street');
     * // using an array of keys to retrieve the value
     * let value = DataHelper.getValue(versions, ['1.0', 'date']);
     * ```
     *
     * @param object array or object to extract value from
     * @param key key name of the array element, an array of keys or property name of the object,
     * or a callback function returning the value. The callback function signature should be:
     * `function(array, defaultValue)`.
     * @param default the default value to be returned if the specified array key does not exist. Not used when
     * getting value from an object.
     * @return the value of the element if found, default value otherwise
     */
    public static getValue(object, key, defaultValue = null) {
        if (typeof key === 'function') {
            return key(object, defaultValue);
        }

        if (object?.[key] !== undefined) {
            return object?.[key];
        }

        let pos = key.indexOf('.');
        if (pos !== -1) {
            object = this.getValue(object, key.substr(0, pos), defaultValue);
            key = key.substr(pos + 1);
        }

        if (object?.[key] !== undefined) {
            return object?.[key];
        }

        return defaultValue;
    }

    public static substrCompare(mainStr, str, offset, length, caseInsensitivity = false) {
        // eslint-disable-line camelcase
        //  discuss at: https://locutus.io/php/substr_compare/
        // original by: Brett Zamir (https://brett-zamir.me)
        // original by: strcasecmp, strcmp
        //   example 1: substr_compare("abcde", "bc", 1, 2)
        //   returns 1: 0
        if (!offset && offset !== 0) {
            throw new Error('Missing offset for substr_compare()');
        }
        if (offset < 0) {
            offset = mainStr.length + offset;
        }
        if (length && length > mainStr.length - offset) {
            return false;
        }
        length = length || mainStr.length - offset;
        mainStr = mainStr.substr(offset, length);
        // Should only compare up to the desired length
        str = str.substr(0, length);
        if (caseInsensitivity) {
            // Works as strcasecmp
            mainStr = (mainStr + '').toLowerCase();
            str = (str + '').toLowerCase();
            if (mainStr === str) {
                return 0;
            }
            return mainStr > str ? 1 : -1;
        }
        // Works as strcmp
        return mainStr === str ? 0 : mainStr > str ? 1 : -1;
    }

    public static strcmp(str1, str2) {
        // http://kevin.vanzonneveld.net
        // +   original by: Waldo Malqui Silva
        // +      input by: Steve Hilder
        // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +    revised by: gorthaur
        // *     example 1: strcmp( 'waldo', 'owald' );
        // *     returns 1: 1
        // *     example 2: strcmp( 'owald', 'waldo' );
        // *     returns 2: -1
        return str1 == str2 ? 0 : str1 > str2 ? 1 : -1;
    }

    public static resolveDotStructuredObject(object, attribute){
        
        let nests = attribute.split('.');
        let dotResolved = this.findValuesByPrefix(object, nests[0] + ".");
        if(Object.values(dotResolved).length === 0)
            return { ...object, ...dotResolved };
        
        return {[nests[0]]: this.resolveDotStructuredObject(dotResolved, nests.slice(1).join('.'))};
    }

    public static findValuesByPrefix(object, prefix) {
        let output = {};
        for (var property in object) { //
          if (object.hasOwnProperty(property) && 
             property.toString().startsWith(prefix)) { //
             output[property.toString().split(prefix)[1]] = object[property]
          }
        }
        return output;
      }
}
