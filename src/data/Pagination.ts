import url = require('url');
import Component from '../base/Component';
import Application from '../base/Application';
/**
 * Pagination represents information relevant to pagination of data items.
 *
 * When data needs to be rendered in multiple pages, Pagination can be used to
 * represent information such as [[totalCount|total item count]], [[pageSize|page size]],
 * [[page|current page]], etc. These information can be passed to [[LinkPager|pagers]]
 * to render pagination buttons or links.
 *
 * The following example shows how to create a pagination object and feed it
 * to a pager.
 *
 * Controller action:
 *
 * ```js
 * async sampleRouteHandler(request, response, next)
 * {
 *     let query = { where: { status: 1 } };
 *     let pages = new Pagination(['totalCount' => Posts.count(query)]);
 *     let models = Posts.findAll({ ...query, offset: pages.offset, limit: pages.limit });
 *     let pager = new LinkPager({
 *          pagination: pages,
 *     })
 *     return response.render('/index.ejs', { models, pages, pager });
 * }
 * ```
 *
 * View:
 *
 * ```js
 * for(let model of models) {
 *     // display model here
 * }
 *
 * // display pagination
 * <%- pager.render(); %>
 * ```
 *
 * For more details and usage information on Pagination, see the [pagination section in this guide](https://internetmango.github.io/pwoli/output-data-widgets).
 *
 * @property-read int limit The limit of the data. This may be used to set the LIMIT value for a SQL
 * statement for fetching the current page of data. Note that if the page size is infinite, a value -1 will be
 * returned. This property is read-only.
 * @property-read array links The links for navigational purpose. The array keys specify the purpose of the
 * links (e.g. [[LINK_FIRST]]), and the array values are the corresponding URLs. This property is read-only.
 * @property-read int offset The offset of the data. This may be used to set the OFFSET value for a SQL
 * statement for fetching the current page of data. This property is read-only.
 * @property int $page The zero-based current page number.
 * @property-read int pageCount Number of pages. This property is read-only.
 * @property int pageSize The number of items per page. If it is less than 1, it means the page size is
 * infinite, and thus a single page contains all items.
 *
 * @author Mahesh S Warrier <https://github.com/codespede>
 */
export default class Pagination extends Component {
    /**
     * Name of the parameter storing the current page index.
     * @see [[params]]
     */
    public pageParam = 'page';
    /**
     * Name of the parameter storing the page size.
     * @see [[params]]
     */
    public pageSizeParam = 'per-page';
    /**
     * Whether to always have the page parameter in the URL created by [[createUrl]].
     * If false and [[page]] is 0, the page parameter will not be put in the URL.
     */
    public forcePageParam = true;
    /**
     * Parameters (name => value) that should be used to obtain the current page number
     * and to create new pagination URLs. If not set, all parameters from request will be used instead.
     *
     * The object element indexed by [[pageParam]] is considered to be the current page number (defaults to 0);
     * while the element indexed by [[pageSizeParam]] is treated as the page size (defaults to [[defaultPageSize]]).
     */
    public params: { [key: string]: any };
    /**
     * Whether to check if [[page]] is within valid range.
     * When this property is true, the value of [[page]] will always be between 0 and ([[pageCount]]-1).
     * Because [[pageCount]] relies on the correct value of [[totalCount]] which may not be available
     * in some cases (e.g. MongoDB), you may want to set this property to be false to disable the page
     * number validation. By doing so, [[page]] will return the value indexed by [[pageParam]] in [[params]].
     */
    public validatePage = true;
    /**
     * The default page size. This property will be returned by [[pageSize]] when page size
     * cannot be determined by [[pageSizeParam]] from [[params]].
     */
    public defaultPageSize = 20;
    /**
     * Total number of items.
     */
    public totalCount = 0;
    /**
     * The page size limits. The first array element stands for the minimal page size, and the second
     * the maximal page size. If this is false, it means [[pageSize]] should always return the value of [[defaultPageSize]].
     */
    public pageSizeLimit = [1, 50];
    /**
     * Number of items on each page.
     * If it is less than 1, it means the page size is infinite, and thus a single page contains all items.
     */
    private _pageSize;
    private _page;

    public constructor(config: { [key: string]: any }) {
        super(config);
        Object.assign(this, config);
    }
    /**
     * @return number of pages
     */
    public getPageCount(): number {
        const pageSize = this.getPageSize();
        if (pageSize < 1) return this.totalCount > 0 ? 1 : 0;
        const totalCount = this.totalCount < 0 ? 0 : this.totalCount;
        return Math.floor((totalCount + pageSize - 1) / pageSize);
    }
    /**
     * Returns the zero-based current page number.
     * @param recalculate whether to recalculate the current page based on the page size and item count.
     * @return the zero-based current page number.
     */
    public getPage(recalculate = false): number {
        if (this._page === undefined || recalculate)
            this.setPage(parseInt(this.getQueryParam(this.pageParam, 1)) - 1, true);
        return parseInt(this._page, 10);
    }
    /**
     * Sets the current page number.
     * @param value the zero-based index of the current page.
     * @param validatePage whether to validate the page number. Note that in order
     * to validate the page number, both [[validatePage]] and this parameter must be true.
     */
    public setPage(value: string | number, validatePage = false) {
        if (value === undefined) this._page = undefined;
        else {
            value = parseInt(value as string, 10);
            if (validatePage && this.validatePage) {
                const pageCount = this.getPageCount();
                if (value >= pageCount) value = pageCount - 1;
            }
            if (value < 0) value = 0;
            this._page = value;
        }
    }
    /**
     * Returns the number of items per page.
     * By default, this method will try to determine the page size by [[pageSizeParam]] in [[params]].
     * If the page size cannot be determined this way, [[defaultPageSize]] will be returned.
     * @return the number of items per page. If it is less than 1, it means the page size is infinite,
     * and thus a single page contains all items.
     * @see [[pageSizeLimit]]
     */
    public getPageSize(): number {
        if (this._pageSize === undefined) {
            if (
                this.pageSizeLimit.length === 0 ||
                this.pageSizeLimit[0] === undefined ||
                this.pageSizeLimit[1] === undefined
            )
                this.setPageSize(this.defaultPageSize);
            else this.setPageSize(this.getQueryParam(this.pageSizeParam, this.defaultPageSize), true);
        }
        return this._pageSize;
    }
    /**
     * @param value the number of items per page.
     * @param validatePageSize whether to validate page size.
     */
    public setPageSize(value: string | number, validatePageSize = false) {
        if (value === undefined) this._pageSize = undefined;
        else {
            value = parseInt(value as string, 10);
            if (validatePageSize && this.pageSizeLimit[0] !== undefined && this.pageSizeLimit[1] !== undefined) {
                if (value < this.pageSizeLimit[0]) value = this.pageSizeLimit[0];
                else if (value > this.pageSizeLimit[1]) value = this.pageSizeLimit[1];
            }
            this._pageSize = value;
        }
    }
    /**
     * Creates the URL suitable for pagination with the specified page number.
     * This method is mainly called by pagers when creating URLs used to perform pagination.
     * @param page the zero-based page number that the URL should point to.
     * @param pageSize the number of items on each page. If not set, the value of [[pageSize]] will be used.
     * @param absolute whether to create an absolute URL. Defaults to `false`.
     * @return the created URL
     * @see [[params]]
     * @see [[forcePageParam]]
     */
    public createUrl(page: string | number, pageSize: number = undefined, absolute = false): URL {
        page = parseInt(page as string, 10);
        // pageSize = parseInt(pageSize, 10);
        let params = this.params;
        if (params === undefined) params = url.parse(Application.request.url, true).query;
        if (page > 0 || (page === 0 && this.forcePageParam)) params[this.pageParam] = page + 1;
        else delete params[this.pageParam];
        if (pageSize <= 0 || pageSize === undefined) pageSize = this.getPageSize();

        if (pageSize !== undefined && pageSize !== this.defaultPageSize) params[this.pageSizeParam] = pageSize;
        else {
            delete params[this.pageSizeParam];
        }

        const pageUrl = new URL(Application.getFullUrlOfRequest());
        for (const param in params) pageUrl.searchParams.set(param, params[param]);

        return pageUrl;
    }
    /**
     * @return the offset of the data. This may be used to set the
     * OFFSET value for a SQL statement for fetching the current page of data.
     */
    public getOffset(): number {
        const pageSize = this.getPageSize();
        return pageSize < 1 ? 0 : this.getPage() * pageSize;
    }
    /**
     * @return the limit of the data. This may be used to set the
     * LIMIT value for a SQL statement for fetching the current page of data.
     * Note that if the page size is infinite, a value -1 will be returned.
     */
    public getLimit(): number {
        const pageSize = this.getPageSize();
        return pageSize < 1 ? -1 : pageSize;
    }
    /**
     * Returns a whole set of links for navigating to the first, last, next and previous pages.
     * @param absolute whether the generated URLs should be absolute.
     * @return the links for navigational purpose. The array keys specify the purpose of the links (e.g. [[LINK_FIRST]]),
     * and the array values are the corresponding URLs.
     */
    public getLinks(absolute = false): { [key: string]: any } {
        const currentPage = this.getPage();
        const pageCount = this.getPageCount();
        const links: { [key: string]: any } = { self: this.createUrl(currentPage, null, absolute) };
        if (pageCount > 0) {
            links.first = this.createUrl(0, null, absolute);
            links.last = this.createUrl(pageCount - 1, null, absolute);
            if (currentPage > 0) links.prev = this.createUrl(currentPage - 1, null, absolute);
            if (currentPage < pageCount - 1) {
                links.next = this.createUrl(currentPage + 1, null, absolute);
            }
        }
        return links;
    }
    /**
     * Returns the value of the specified query parameter.
     * This method returns the named parameter value from [[params]]. Null is returned if the value does not exist.
     * @param name the parameter name
     * @param defaultValue the value to be returned when the specified parameter does not exist in [[params]].
     * @return the parameter value
     */
    protected getQueryParam(name: string, defaultValue: string | number): string {
        let params = this.params;
        if (params === undefined) {
            params = url.parse(Application.request.url, true).query;
        }
        return params[name] !== undefined && /boolean|number|string/.test(typeof params[name])
            ? params[name]
            : defaultValue;
    }
}
