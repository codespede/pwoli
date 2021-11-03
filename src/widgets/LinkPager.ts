import Pagination from '../data/Pagination';
import Html from '../helpers/Html';
import Widget from '../base/Widget';
/**
 * LinkPager displays a list of hyperlinks that lead to different pages of target.
 *
 * LinkPager works with a [[Pagination]] object which specifies the total number
 * of pages and the current page number.
 *
 * Note that LinkPager only generates the necessary HTML markups. In order for it
 * to look like a real pager, you should provide some CSS styles for it.
 * With the default configuration, LinkPager should look good using Twitter Bootstrap CSS framework.
 *
 * For more details and usage information on LinkPager, see the [guide article on pagination](guide:output-pagination).
 *
 * @author Mahesh S Warrier <https://github.com/codespede>
 */
export default class LinkPager extends Widget {
    /**
     * The pagination object that this pager is associated with.
     * You must set this property in order to make LinkPager work.
     */
    public pagination: Pagination;
    /**
     * HTML attributes for the pager container tag.
     * @see [[Html.renderTagAttributes]] for details on how attributes are being rendered.
     */
    public options: { [key: string]: any } = { class: 'pagination' };
    /**
     * HTML attributes which will be applied to all link containers
     */
    public linkContainerOptions: { [key: string]: any } = {};
    /**
     * HTML attributes for the link in a pager container tag.
     * @see [[Html.renderTagAttributes]] for details on how attributes are being rendered.
     */
    public linkOptions: { [key: string]: any } = {};
    /**
     * The CSS class for the each page button.
     */
    public pageCssClass: string;
    /**
     * The CSS class for the "first" page button.
     */
    public firstPageCssClass = 'first';
    /**
     * The CSS class for the "last" page button.
     */
    public lastPageCssClass = 'last';
    /**
     * The CSS class for the "previous" page button.
     */
    public prevPageCssClass = 'prev';
    /**
     * The CSS class for the "next" page button.
     */
    public nextPageCssClass = 'next';
    /**
     * The CSS class for the "active" page button.
     */
    public activePageCssClass = 'active';
    /**
     * The CSS class for the "disabled" page buttons.
     */
    public disabledPageCssClass = 'disabled';
    /**
     * The options for the disabled tag to be generated inside the disabled list element.
     * In order to customize the html tag, please use the tag key.
     *
     * ```js
     * let disabledListItemSubTagOptions = { tag: 'div', class: 'disabled-div' };
     * ```
     */
    public disabledListItemSubTagOptions: { [key: string]: any } = {};
    /**
     * Maximum number of page buttons that can be displayed. Defaults to 10.
     */
    public maxButtonCount = 10;
    /**
     * The label for the "next" page button. Note that this will NOT be HTML-encoded.
     * If this property is false, the "next" page button will not be displayed.
     */
    public nextPageLabel: string | boolean = '&raquo;';
    /**
     * The label for the "previous" page button. Note that this will NOT be HTML-encoded.
     * If this property is false, the "previous" page button will not be displayed.
     */
    public prevPageLabel: string | boolean = '&laquo;';
    /**
     * The label for the "first" page button. Note that this will NOT be HTML-encoded.
     * If this property is false, the "first" page button will not be displayed.
     */
    public firstPageLabel: string | boolean = false;
    /**
     * The label for the "last" page button. Note that this will NOT be HTML-encoded.
     * If this property is false, the "last" page button will not be displayed.
     */
    public lastPageLabel: string | boolean = false;
    /**
     * Hide widget when only one page exist.
     */
    public hideOnSinglePage = true;
    /**
     * Whether to render current page button as disabled.
     */
    public disableCurrentPageButton = false;

    public constructor(config: { [key: string]: any }) {
        super(config);
        Object.assign(this, config);
    }
    /**
     * Initializes the pager.
     */
    public async init() {
        await super.init.call(this);
        if (this.pagination === undefined) throw new Error('The "pagination" property must be set.');
    }
    /**
     * Executes the widget.
     * This overrides the parent implementation by displaying the generated page buttons.
     */
    public async run(): Promise<string> {
        return await this.renderPageButtons();
    }
    /**
     * Renders the page buttons.
     * @return string the rendering result
     */
    protected async renderPageButtons(): Promise<string> {
        const pageCount = await this.pagination.getPageCount();

        if (pageCount < 2 && this.hideOnSinglePage) return '';
        const buttons = [];
        const currentPage = this.pagination.getPage();
        const firstPageLabel = this.firstPageLabel === true ? '1' : this.firstPageLabel;

        // first page
        if (firstPageLabel !== false)
            buttons.push(
                await this.renderPageButton(firstPageLabel, 0, this.firstPageCssClass, currentPage <= 0, false),
            );

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
    /**
     * Renders a page button.
     * You may override this method to customize the generation of page buttons.
     * @param label the text label for the button
     * @param page the page number
     * @param class the CSS class for the page button.
     * @param disabled whether this page button is disabled
     * @param active whether this page button is active
     * @return the rendering result
     */
    protected async renderPageButton(
        label: string | number | boolean,
        page: number,
        cssClass: string,
        disabled: boolean,
        active: boolean,
    ): Promise<string> {
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
    /**
     * @return the begin and end pages that need to be displayed.
     */
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
