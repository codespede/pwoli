import Pagination from './Pagination';
import Html from './Html';
import Widget from './Widget';

export default class LinkPager extends Widget {
  public pagination: Pagination;
  public options: { [key: string]: any } = { class: 'pagination' };
  public linkContainerOptions: { [key: string]: any } = {};
  public linkOptions: { [key: string]: any } = {};
  public pageCssClass: string;
  public firstPageCssClass = 'first';
  public lastPageCssClass = 'last';
  public prevPageCssClass = 'prev';
  public nextPageCssClass = 'next';
  public activePageCssClass = 'active';
  public disabledPageCssClass = 'disabled';
  public disabledListItemSubTagOptions: { [key: string]: any } = {};
  public maxButtonCount = 10;
  public nextPageLabel: string | boolean = '&raquo;';
  public prevPageLabel: string | boolean = '&laquo;';
  public firstPageLabel: string | boolean = false;
  public lastPageLabel: string | boolean = false;
  public registerLinkTags = false;
  public hideOnSinglePage = true;
  public disableCurrentPageButton = false;

  public constructor(config: {[key: string]: any}) {
    super(config);
    Object.assign(this, config);
  }

  public async init() {
    await super.init.call(this);
    if (this.pagination === undefined) throw new Error('The "pagination" property must be set.');
  }

  public async run(): Promise<string> {
    if (this.registerLinkTags) this.doRegisterLinkTags();
    return await this.renderPageButtons();
  }

  protected doRegisterLinkTags() {
    
  }

  protected async renderPageButtons(): Promise<string> {
    const pageCount = await this.pagination.getPageCount();

    if (pageCount < 2 && this.hideOnSinglePage) return '';
    const buttons = [];
    const currentPage = this.pagination.getPage();
    const firstPageLabel = this.firstPageLabel === true ? '1' : this.firstPageLabel;

    // first page
    if (firstPageLabel !== false)
      buttons.push(await this.renderPageButton(firstPageLabel, 0, this.firstPageCssClass, currentPage <= 0, false));

    // prev page
    if (this.prevPageLabel !== false) {
      let page = currentPage - 1;
      if (page < 0) page = 0;
      buttons.push(
        await this.renderPageButton(this.prevPageLabel, page, this.prevPageCssClass, currentPage <= 0, false),
      );
    }

    // internal pages
    const [beginPage, endPage] = this.getPageRange();
    for (let i = beginPage; i <= endPage; i++) {
      buttons.push(
        await this.renderPageButton(
          i + 1,
          i,
          undefined,
          this.disableCurrentPageButton && i === currentPage,
          i === currentPage,
        ),
      );
    }

    // next page
    if (this.nextPageLabel !== false) {
      let page = currentPage + 1;
      if (page >= pageCount - 1) page = pageCount - 1;
      buttons.push(
        await this.renderPageButton(
          this.nextPageLabel,
          page,
          this.nextPageCssClass,
          currentPage >= pageCount - 1,
          false,
        ),
      );
    }

    // last page
    const lastPageLabel = this.lastPageLabel === true ? pageCount : this.lastPageLabel;
    if (lastPageLabel !== false)
      buttons.push(
        await this.renderPageButton(
          lastPageLabel,
          pageCount - 1,
          this.lastPageCssClass,
          currentPage >= pageCount - 1,
          false,
        ),
      );
    const options = this.options;
    const tag = options.tag !== undefined ? options.tag : 'ul';
    delete options.tag;
    return Html.tag(tag, buttons.join('\n'), options);
  }

  protected async renderPageButton(label: string | number | boolean, page: number, cssClass: string, disabled: boolean, active: boolean): Promise<string> {
    let options: any = {};
    options = Object.assign(options, this.linkContainerOptions);
    
    const linkWrapTag = options.tag !== undefined ? options.tag : 'li';
    delete options.tag;
    Html.addCssClass(options, cssClass === undefined ? this.pageCssClass : cssClass);
    if (active) Html.addCssClass(options, this.activePageCssClass);
    if (disabled) {
      Html.addCssClass(options, this.disabledPageCssClass);
      const disabledItemOptions = this.disabledListItemSubTagOptions;
      const tag = disabledItemOptions.tag !== undefined ? disabledItemOptions.tag : 'span';
      delete disabledItemOptions.tag;
      return Html.tag(linkWrapTag, Html.tag(tag, label as string, disabledItemOptions), options);
    }
    const linkOptions = this.linkOptions;
    linkOptions['data-page'] = page;
    return Html.tag(linkWrapTag, Html.a(label, this.pagination.createUrl(page), linkOptions), options);
  }

  protected getPageRange(): [number, number] {
    const currentPage = this.pagination.getPage();
    const pageCount = this.pagination.getPageCount();
    
    let beginPage = Math.max(0, currentPage - this.maxButtonCount / 2);
    let endPage = beginPage + this.maxButtonCount - 1;
    if (endPage >= pageCount) {
      endPage = pageCount - 1;
      beginPage = Math.max(0, endPage - this.maxButtonCount + 1);
    }
    return [beginPage, endPage];
  }
}
