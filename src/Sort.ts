import Inflector from 'inflected';
import url = require('url');
import Component from './Component';
import Application from './Application';
import Html from './Html';

export default class Sort extends Component {
  public enableMultiSort = false;
  public attributes: any = {}; // {id: {asc: ['id', 'asc'], desc: ['id', 'desc']}, title: {asc: ['title', 'asc'], desc: ['title', 'desc']}};
  public sortParam = 'sort';
  public defaultOrder = []; // [['id','desc'], ['title', 'asc']];
  public separator = ',';
  public params;
  private _attributeOrders;

  public constructor(config) {
    super(config);
    Object.assign(this, config);
  }

  public async init() {
    await super.init.call(this);
    const attributes = [];
    for (const name in this.attributes) {
      if (typeof this.attributes[name] === 'string')
        attributes[this.attributes[name]] = {
          asc: [this.attributes[name], 'asc'],
          desc: [this.attributes[name], 'desc'],
        };
      else if (this.attributes[name].asc === undefined || this.attributes[name].desc === undefined)
        attributes[name] = { ...{ asc: [name, 'asc'], desc: [name, 'desc'] }, ...this.attributes[name] };
      else attributes[name] = this.attributes[name];
    }
    this.attributes = attributes;
  }

  public getOrders(recalculate = false) {
    const attributeOrders = this.getAttributeOrders(recalculate);
    const orders = [];
    for (const attribute of attributeOrders) {
      // if (attributeOrders[attribute] === undefined)
      //     continue;
      const definition = this.attributes[attribute[0]];
      // console.log('definition', definition, this.attributes, attribute[0], this.attributes[attribute[0]], attributeOrders);
      // console.log('attributeOrders[attribute]', attributeOrders[attribute[0]])
      const columns = this.attributes[attribute[0]][attribute[1]];
      // if (typeof columns === 'object')
      //     for (const name in columns)
      //         orders[name] = columns[name];
      // else
      // console.log('columns', columns, definition, this.attributes[attribute[0]][attribute[1]])
      orders.push(columns);
    }
    return orders;
  }

  public getAttributeOrders(recalculate = false) {
    if (this._attributeOrders === undefined || recalculate) {
      this._attributeOrders = [];
      // Component.request;
      let params = this.params;
      if (params === undefined) params = url.parse(Application.request.url, true).query;
      // console.log('paramss', params, params[this.sortParam], this.parseSortParam(params[this.sortParam]));
      if (params[this.sortParam] !== undefined) {
        for (let attribute of this.parseSortParam(params[this.sortParam])) {
          let descending = false;
          if (attribute.charAt(0) === '-') {
            descending = true;
            attribute = attribute.substring(1);
          }

          if (this.attributes[attribute] !== undefined) {
            this._attributeOrders.push([attribute, descending ? 'desc' : 'asc']);
            if (!this.enableMultiSort) return this._attributeOrders;
          }
        }
      }
      if (this._attributeOrders.length === 0 && this.defaultOrder.length > 0) this._attributeOrders = this.defaultOrder;
    }
    // console.log('ao', this._attributeOrders);
    return this._attributeOrders;
  }

  protected parseSortParam(param) {
    return typeof param === 'string' ? param.split(this.separator) : [];
  }

  public getAttributeOrder(attribute) {
    const orders = this.getAttributeOrders();
    return orders[attribute] !== undefined ? orders[attribute] : null;
  }

  public link(attribute, options) {
    const direction = this.getAttributeOrder(attribute);
    if (direction !== null) {
      const className = direction;
      if (options[className] !== undefined) options[className] = options[className] + ` ${className}`;
    }
    const sortUrl = this.createUrl(attribute);
    options['data-sort'] = this.createSortParam(attribute);
    let label;
    if (options.label !== undefined) {
      label = options.label;
      delete options.label;
    } else
      label =
        this.attributes[attribute].label !== undefined
          ? this.attributes[attribute].label
          : Inflector.humanize(attribute);
    // let optionsHtml;
    // for (const option in options)
    //     optionsHtml += `${option}=${options[option]} `;
    return Html.a(label, sortUrl.href, options); // `<a href='${sortUrl.href}' ${optionsHtml}>${label}</a>`;
  }

  public createUrl(attribute, absolute = false) {
    let params = this.params;
    if (params === undefined) params = url.parse(Application.request.url, true).query;
      params[this.sortParam] = this.createSortParam(attribute);
      console.log('cu', Application.getFullUrlOfRequest());
    const sortUrl = new URL(Application.getFullUrlOfRequest());
    for (const param in params) sortUrl.searchParams.set(param, params[param]);
    return sortUrl;
  }

  public createSortParam(attribute) {
    if (this.attributes[attribute] === undefined) throw new Error(`Unknown sort attribute: ${attribute}`);

    const definition = this.attributes[attribute];
    let directions = this.getAttributeOrders();
    let direction: any = false;
    let i = 0;
    if (attribute === 'title') console.log('csp', this.attributes[attribute], direction, directions);
    for (const dir of directions) {
      if (dir !== undefined && dir[0] === attribute) {
        direction = dir[1];
        break;
      }
      i++;
    }
    delete directions[i];
    if (direction !== false) {
      console.log('csp-dir', direction);
      direction = direction === 'desc' ? 'asc' : 'desc';
    } else direction = definition.default !== undefined ? definition.default : 'asc';
    directions = this.enableMultiSort ? [[attribute, direction]].push(directions) : [[attribute, direction]];

    const sorts = [];
    for (const dir of directions) if (dir[0] !== undefined) sorts.push(dir[1] === 'desc' ? `-${dir[0]}` : dir[0]);
    return sorts.join(this.separator);
  }

  public hasAttribute(name) {
    return this.attributes[name] !== undefined;
  }
}
