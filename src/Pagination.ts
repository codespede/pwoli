import url = require('url');
import Component from './Component';
import Application from './Application';
export default class Pagination extends Component {
  public pageParam = 'page';
  public pageSizeParam = 'per-page';
  public forcePageParam = true;
  public params;
  public validatePage = true;
  public defaultPageSize = 20;
  public totalCount = 0;
  public pageSizeLimit = [1, 50];
  private _pageSize;
  private _page;

  public constructor(config) {
    super(config);
    Object.assign(this, config);
  }

  public getPageCount() {
    console.log('gpc', this.totalCount);
    const pageSize = this.getPageSize();
    if (pageSize < 1) return this.totalCount > 0 ? 1 : 0;
    const totalCount = this.totalCount < 0 ? 0 : this.totalCount;
    return Math.floor((totalCount + pageSize - 1) / pageSize);
  }

  public getPage(recalculate = false) {
    if (this._page === undefined || recalculate) this.setPage(this.getQueryParam(this.pageParam, 1) - 1, true);
    return parseInt(this._page, 10);
  }

  public setPage(value, validatePage = false) {
    if (value === undefined) this._page = undefined;
    else {
      value = parseInt(value, 10);
      if (validatePage && this.validatePage) {
        const pageCount = this.getPageCount();
        if (value >= pageCount) value = pageCount - 1;
      }
      if (value < 0) value = 0;
      this._page = value;
    }
  }

  public getPageSize() {
    if (this._pageSize === undefined) {
      if (this.pageSizeLimit.length === 0 || this.pageSizeLimit[0] === undefined || this.pageSizeLimit[1] === undefined)
        this.setPageSize(this.defaultPageSize);
      else this.setPageSize(this.getQueryParam(this.pageSizeParam, this.defaultPageSize), true);
    }
    return this._pageSize;
  }

  public setPageSize(value, validatePageSize = false) {
    if (value === undefined) this._pageSize = undefined;
    else {
      value = parseInt(value, 10);
      if (validatePageSize && this.pageSizeLimit[0] !== undefined && this.pageSizeLimit[1] !== undefined) {
        if (value < this.pageSizeLimit[0]) value = this.pageSizeLimit[0];
        else if (value > this.pageSizeLimit[1]) value = this.pageSizeLimit[1];
      }
      this._pageSize = value;
    }
  }

  public createUrl(page, pageSize, absolute = false) {
    page = parseInt(page, 10);
    // pageSize = parseInt(pageSize, 10);
    let params = this.params;
    if (params === undefined) params = url.parse(Application.request.url, true).query;
    if (page > 0 || (page === 0 && this.forcePageParam)) params[this.pageParam] = page + 1;
    else delete params[this.pageParam];
    if (pageSize <= 0 || pageSize === undefined) pageSize = this.getPageSize();
    // console.log('pageSize', pageSize);
    if (pageSize !== undefined && pageSize !== this.defaultPageSize) params[this.pageSizeParam] = pageSize;
    else {
      // console.log('delete', 's');
      delete params[this.pageSizeParam];
    }

    const pageUrl = new URL(Application.getFullUrlOfRequest());
    for (const param in params) pageUrl.searchParams.set(param, params[param]);
    // console.log('paramss', params, pageSize, pageUrl);
    return pageUrl;
  }

  public getOffset() {
    const pageSize = this.getPageSize();
    return pageSize < 1 ? 0 : this.getPage() * pageSize;
  }

  public getLimit() {
    const pageSize = this.getPageSize();
    return pageSize < 1 ? -1 : pageSize;
  }

  public getLinks(absolute = false) {
    const currentPage = this.getPage();
    const pageCount = this.getPageCount();
    const links: any = { self: this.createUrl(currentPage, null, absolute) };
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

  protected getQueryParam(name, defaultValue) {
    let params = this.params;
    if (params === undefined) {
      params = url.parse(Application.request.url, true).query;
    }
    return params[name] !== undefined && /boolean|number|string/.test(typeof params[name])
      ? params[name]
      : defaultValue;
  }
}
