import DataHelper from './DataHelper';
import Html from './Html';
import LinkPager from './LinkPager';
import LinkSorter from './LinkSorter';
import Widget from './Widget';

export default class CollectionView extends Widget {
  public dataProvider;
  public layout = '{summary}\n{items}\n{pager}';
  public emptyText;
  public emptyTextOptions: any = { class: 'empty' };
  public pager: any = {};
  public sorter: any = {};
  public showOnEmpty = false;
  public options: any = {};
  public columns: any = ['title'];
  protected _models = [];
  public summary;
  public summaryOptions: any = {};

  public constructor(config) {
    super(config);
    Object.assign(this, config);
  }

  public async init() {
    await super.init.call(this);
    if (this.dataProvider === undefined) throw new Error('The "dataProvider" property must be set.');
    if (this.emptyText === undefined) this.emptyText = 'No results found';
    if (this.options.id === undefined) this.options.id = this.getId();
    
  }

  public async run() {
    let content;
    this._models = await this.dataProvider.getModels();
    if (this.showOnEmpty || this.dataProvider.getCount() > 0)
      content = await DataHelper.replaceAsync(this.layout, /{\w+}/g, async (match) => {
        return await this.renderSection(match);
      });
    else content = this.renderEmpty();
    
    const options = this.options;
    const tag = options.tag !== undefined ? options.tag : 'div';
    return Html.tag(tag, content, options);
  }

  public async renderSection(name) {
    name = name.replace(/\{|\}/g, '');
    
    return await this[`render${name.charAt(0).toUpperCase() + name.slice(1)}`]();
  }

  public renderEmpty() {
    if (!this.emptyText) return '';
    const options = this.emptyTextOptions;
    const tag = options.tag !== undefined ? options.tag : 'div';
    delete options.tag;
    return Html.tag(tag, this.emptyText, options);
  }

  public async renderSummary() {
    const count = await this.dataProvider.getCount();
    if (count <= 0) return '';
    const summaryOptions = this.summaryOptions;
    const tag = DataHelper.remove(summaryOptions, 'tag', 'div');
    const pagination = this.dataProvider.getPagination();
    let begin;
    let end;
    let page;
    let pageCount;
    let totalCount;
    const summaryContent = this.summary;
    if (pagination !== false) {
      await pagination.totalCountPromise;
      totalCount = await this.dataProvider.getTotalCount();
      
      begin = pagination.getPage() * pagination.getPageSize() + 1;
      end = begin + count - 1;
      if (begin > end) begin = end;
      page = pagination.getPage() + 1;
      pageCount = pagination.pageCount;
      if (summaryContent === undefined)
        return Html.tag(tag, `Showing <b>${begin}-${end}</b> of <b>${totalCount}</b> item(s).`, summaryOptions);
    } else {
      begin = page = pageCount = 1;
      end = totalCount = count;
      if (summaryContent === undefined) return Html.tag(tag, `Total <b>${count}</b> ${count} item(s).`, summaryOptions);
    }
    if (summaryContent === '') return '';
    return Html.tag(tag, summaryContent, summaryOptions);
  }

  public async renderItems(): Promise<any> {
    
  }

  public async renderPager() {
    await this.dataProvider.totalCountPromise;
    const pagination = this.dataProvider.getPagination();
    
    if (pagination === false && this.dataProvider.getCount() <= 0) return '';

    const pager = this.pager;
    const classInstance = pager.class !== undefined ? pager.class : LinkPager;
    pager.pagination = pagination;
    
    return await new classInstance(pager).render();
  }

  public renderSorter() {
    const sort = this.dataProvider.getSort();
    if (!sort || sort.attributes.length === 0 || this.dataProvider.getCount() <= 0) return '';
    const sorter = this.sorter;
    const classInstance = sorter.class !== undefined ? sorter.class : LinkSorter;
    sorter.sort = sort;
    return new classInstance(sorter).render();
  }
}
