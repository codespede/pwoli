import Column from '../grid/Column';
import Component from '../base/Component';
import DataProvider from '../data/DataProvider';
import Model from '../base/Model';
import Pagination from '../data/Pagination';
import Sort from '../data/Sort';
import DataHelper from '../helpers/DataHelper';
import Html from '../helpers/Html';
import LinkPager from './LinkPager';
import LinkSorter from './LinkSorter';
import Widget from '../base/Widget';
/**
 * CollectionView is a base class for widgets displaying data from data provider
 * such as ListView and GridView.
 *
 * It provides features like sorting, paging and also filtering the data.
 *
 * For more details and usage information on CollectionView, see the [guide article on data widgets](guide:output-data-widgets).
 *
 * @author Mahesh S Warrier <https://github.com/codespede>
 */
export default class CollectionView extends Widget {
    /**
     * @var \yii\data\DataProviderInterface the data provider for the view. This property is required.
     */
    public dataProvider: DataProvider;
    /**
     * The layout that determines how different sections of the list view should be organized.
     * The following tokens will be replaced with the corresponding section contents:
     *
     * - `{summary}`: the summary section. See [[renderSummary()]].
     * - `{items}`: the list items. See [[renderItems()]].
     * - `{sorter}`: the sorter. See [[renderSorter()]].
     * - `{pager}`: the pager. See [[renderPager()]].
     */
    public layout = '{summary}\n{items}\n{pager}';
    /**
     * The HTML content to be displayed when [[dataProvider]] does not have any data.
     * When this is set to `false` no extra HTML content will be generated.
     * The default value is the text "No results found."
     * @see [[showOnEmpty]]
     * @see [[emptyTextOptions]]
     */
    public emptyText: string | false;
    public emptyTextOptions: { [key: string]: any } = { class: 'empty', tag: '' };
    /**
     * The configuration for the pager widget. By default, [[LinkPager]] will be
     * used to render the pager. You can use a different widget class by configuring the "class" property.
     * Note that the widget must support the `pagination` property which will be populated with the
     * [[DataProvider.pagination|pagination]] value of the [[dataProvider]] and will overwrite this value.
     */
    public pager: LinkPager;
    /**
     * The configuration for the sorter widget. By default, [[LinkSorter]] will be
     * used to render the sorter. You can use a different widget class by configuring the "class" property.
     * Note that the widget must support the `sort` property which will be populated with the
     * [[DataProvider.sort|sort]] value of the [[dataProvider]] and will overwrite this value.
     */
    public sorter: LinkSorter;
    /**
     * Whether to show an empty list view if [[dataProvider]] returns no data.
     * The default value is false which displays an element according to the [[emptyText]]
     * and [[emptyTextOptions]] properties.
     */
    public showOnEmpty = false;
    /**
     * The HTML attributes for the container tag of the list view.
     * The "tag" element specifies the tag name of the container element and defaults to "div".
     * @see [[Html.renderTagAttributes]] for details on how attributes are being rendered.
     */
    public options: { [key: string]: any } = { id: '', tag: '' };
    protected _models: Model[] = [];
    /**
     * The HTML content to be displayed as the summary of the list view.
     * If you do not want to show the summary, you may set it with an empty string.
     *
     * The following tokens will be replaced with the corresponding values:
     *
     * - `{begin}`: the starting row number (1-based) currently being displayed
     * - `{end}`: the ending row number (1-based) currently being displayed
     * - `{count}`: the number of rows currently being displayed
     * - `{totalCount}`: the total number of rows available
     * - `{page}`: the page number (1-based) current being displayed
     * - `{pageCount}`: the number of pages available
     */
    public summary: string;
    /**
     * The HTML attributes for the summary of the list view.
     * The "tag" element specifies the tag name of the summary element and defaults to "div".
     * @see [[Html.renderTagAttributes]] for details on how attributes are being rendered.
     */
    public summaryOptions: { [key: string]: any } = {};

    /**
     * Test doc
     * @param config test
     */
    public constructor(config: { [key: string]: any }) {
        super(config);
        Object.assign(this, config);
    }
    /**
     * Initializes the view.
     */
    public async init() {
        if (this.dataProvider === undefined) throw new Error('The "dataProvider" property must be set.');
        if (this.emptyText === undefined) this.emptyText = 'No results found';
        await super.init.call(this);
    }
    /**
     * Runs the widget.
     */
    public async run(): Promise<string> {
        await super.run.call(this);
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
    /**
     * Renders a section of the specified name.
     * If the named section is not supported, false will be returned.
     * @param name the section name, e.g., `{summary}`, `{items}`.
     * @return the rendering result of the section, or false if the named section is not supported.
     */
    public async renderSection(name: string): Promise<string> {
        name = name.replace(/\{|\}/g, '');

        return await this[`render${name.charAt(0).toUpperCase() + name.slice(1)}`]();
    }
    /**
     * Renders the HTML content indicating that the list view has no data.
     * @return string the rendering result
     * @see [[emptyText]]
     */
    public renderEmpty(): string {
        if (!this.emptyText) return '';
        const options = this.emptyTextOptions;
        const tag = options.tag !== undefined ? options.tag : 'div';
        delete options.tag;
        return Html.tag(tag, this.emptyText, options);
    }
    /**
     * Renders the summary text.
     */
    public async renderSummary(): Promise<string> {
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
            if (summaryContent === undefined)
                return Html.tag(tag, `Total <b>${count}</b> ${count} item(s).`, summaryOptions);
        }
        if (summaryContent === '') return '';
        return Html.tag(tag, summaryContent, summaryOptions);
    }
    /**
     * Renders the data models.
     * @return the rendering result.
     */
    public async renderItems(): Promise<any> {}
    /**
     * Renders the pager.
     * @return string the rendering result
     */
    public async renderPager(): Promise<string> {
        await this.dataProvider.totalCountPromise;
        const pagination = this.dataProvider.getPagination();
        if (pagination === false && this.dataProvider.getCount() <= 0) return '';
        let pager = this.pager || new LinkPager({ pagination });
        return await pager.render();
    }
    /**
     * Renders the sorter.
     * @return string the rendering result
     */
    public async renderSorter(): Promise<string> {
        const sort = this.dataProvider.getSort();
        if (!sort || sort.attributes.length === 0 || this.dataProvider.getCount() <= 0) return '';
        let sorter = this.sorter || new LinkSorter({ sort });
        return sorter.render();
    }
}
