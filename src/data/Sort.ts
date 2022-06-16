import { humanize } from 'inflected';
import url = require('url');
import Component from '../base/Component';
import Application from '../base/Application';
import Html from '../helpers/Html';

/**
 * Sort represents information relevant to sorting.
 *
 * When data needs to be sorted according to one or several attributes,
 * we can use Sort to represent the sorting information and generate
 * appropriate hyperlinks that can lead to sort actions.
 *
 * A typical usage example is as follows,
 *
 * ```js
 * async sampleRouteHandler(request, response, next)
 * {
 *     let sort = new Sort({
 *         attributes': {
 *             age',
 *             name': {
 *                 asc': { first_name: 'asc', last_name: 'asc' },
 *                 desc': { first_name: 'desc', last_name: 'desc' },
 *                 default': 'desc',
 *                 label': 'Name',
 *             },
 *         },
 *     });
 *
 *     let models = Post::findAll({ where: { status: 1 }, order: sort.getOrders()})
 *
 *     return response.render('/index.ejs', { models, sort, sorter });
 * }
 * ```
 *
 * View:
 *
 * ```js
 * // display links leading to sort actions
 * <%- sort.link('name') + ' | ' + sort.link('age') %>
 *
 * fore(let model of models) {
 *     // display model here
 * }
 * ```
 *
 * In the above, we declare two [[attributes]] that support sorting: `name` and `age`.
 * We pass the sort information to the Post query so that the query results are
 * sorted by the orders specified by the Sort object. In the view, we show two hyperlinks
 * that can lead to pages with the data sorted by the corresponding attributes.
 *
 * For more details and usage information on Sort, see the [guide article on sorting](guide:output-sorting).
 *
 * @property attributeOrders Sort directions indexed by attribute names. Sort direction can be either
 * `SORT_ASC` for ascending order or `SORT_DESC` for descending order. Note that the type of this property
 * differs in getter and setter. See [[getAttributeOrders]] and [[setAttributeOrders]] for details.
 * @property-read orders The columns (keys) and their corresponding sort directions (values). This can
 * be passed to the 'order by' clause of the DB query. This property is read-only.
 *
 * @author Mahesh S Warrier <https://github.com/codespede>
 */
export default class Sort extends Component {
    public enableMultiSort = false;
    public attributes: any = {}; // {id: {asc: ['id', 'asc'], desc: ['id', 'desc']}, title: {asc: ['title', 'asc'], desc: ['title', 'desc']}};
    public sortParam = 'sort';
    public defaultOrder = []; // [['id','desc'], ['title', 'asc']];
    public separator = ',';
    public params: { [key: string]: any };
    private _attributeOrders: Array<any>;
    public sortFlags = 'SORT_REGULAR';

    public constructor(config: { [key: string]: any }) {
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

    public getOrders(recalculate = false): Array<any> {
        const attributeOrders = this.getAttributeOrders(recalculate);
        const orders = [];
        for (const attribute of attributeOrders) {
            // if (attributeOrders[attribute] === undefined)
            //     continue;
            const definition = this.attributes[attribute[0]];

            const columns = this.attributes[attribute[0]][attribute[1]];
            // if (typeof columns === 'object')
            //     for (const name in columns)
            //         orders[name] = columns[name];
            // else
            orders.push(columns);
        }
        return orders;
    }

    public getAttributeOrders(recalculate = false): Array<any> {
        if (this._attributeOrders === undefined || recalculate) {
            this._attributeOrders = [];
            // Component.request;
            let params = this.params;
            if (params === undefined) params = url.parse(Application.request.url, true).query;

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
            if (this._attributeOrders.length === 0 && this.defaultOrder.length > 0)
                this._attributeOrders = this.defaultOrder;
        }

        return this._attributeOrders;
    }

    protected parseSortParam(param: string): string[] {
        return typeof param === 'string' ? param.split(this.separator) : [];
    }

    public getAttributeOrder(attribute: string): string {
        const orders = this.getAttributeOrders();
        return orders[attribute] !== undefined ? orders[attribute] : null;
    }

    public link(attribute: string, options: { [key: string]: any }): string {
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
                    : humanize(attribute);
        // let optionsHtml;
        // for (const option in options)
        //     optionsHtml += `${option}=${options[option]} `;
        return Html.a(label, sortUrl.href, options); // `<a href='${sortUrl.href}' ${optionsHtml}>${label}</a>`;
    }

    public createUrl(attribute: string, absolute = false): URL {
        let params = this.params;
        if (params === undefined) params = url.parse(Application.request.url, true).query;
        params[this.sortParam] = this.createSortParam(attribute);

        const sortUrl = new URL(Application.getFullUrlOfRequest());
        for (const param in params) sortUrl.searchParams.set(param, params[param]);
        return sortUrl;
    }

    public createSortParam(attribute: string): string {
        if (this.attributes[attribute] === undefined) throw new Error(`Unknown sort attribute: ${attribute}`);

        const definition = this.attributes[attribute];
        let directions = this.getAttributeOrders();
        let direction: any = false;
        let i = 0;
        for (const dir of directions) {
            if (dir !== undefined && dir[0] === attribute) {
                direction = dir[1];
                break;
            }
            i++;
        }
        delete directions[i];
        if (direction !== false) {
            direction = direction === 'desc' ? 'asc' : 'desc';
        } else direction = definition.default !== undefined ? definition.default : 'asc';
        directions = (
            this.enableMultiSort ? [[attribute, direction]].push(directions) : [[attribute, direction]]
        ) as Array<any>;

        const sorts = [];
        for (const dir of directions) if (dir[0] !== undefined) sorts.push(dir[1] === 'desc' ? `-${dir[0]}` : dir[0]);
        return sorts.join(this.separator);
    }

    public hasAttribute(name: string): boolean {
        return this.attributes[name] !== undefined;
    }
}
