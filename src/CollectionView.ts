import Column from './Column';
import Component from './Component';
import DataProvider from './DataProvider';
import Model from './Model';
import Pagination from './Pagination';
import Sort from './Sort';
import DataHelper from './DataHelper';
import Html from './Html';
import LinkPager from './LinkPager';
import LinkSorter from './LinkSorter';
import Widget from './Widget';

export default class CollectionView extends Widget {
    public dataProvider: DataProvider;
    public layout = '{summary}\n{items}\n{pager}';
    public emptyText: string | false;
    public emptyTextOptions: { [key: string]: any } = { class: 'empty', tag: '' };
    public pager: LinkPager;
    public sorter: LinkSorter;
    public showOnEmpty = false;
    public options: { [key: string]: any } = {id: "", tag: ""};
    protected _models: Model[] = [];
    public summary: string;
    public summaryOptions: { [key: string]: any } = {};

    /**
     * Test doc
     * @param config test
     */
    public constructor(config: {[key: string]: any}) {
        super(config);
        Object.assign(this, config);
    }

    public async init() {
        await super.init.call(this);
        if (this.dataProvider === undefined) throw new Error('The "dataProvider" property must be set.');
        if (this.emptyText === undefined) this.emptyText = 'No results found';
        if (this.options.id === undefined) this.options.id = this.getId();
    }

    public async run(): Promise<string> {
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

    public async renderSection(name: string): Promise<string> {
        name = name.replace(/\{|\}/g, '');
        
        return await this[`render${name.charAt(0).toUpperCase() + name.slice(1)}`]();
    }

    public renderEmpty(): string {
        if (!this.emptyText) return '';
        const options = this.emptyTextOptions;
        const tag = options.tag !== undefined ? options.tag : 'div';
        delete options.tag;
        return Html.tag(tag, this.emptyText, options);
    }

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
        if (summaryContent === undefined) return Html.tag(tag, `Total <b>${count}</b> ${count} item(s).`, summaryOptions);
        }
        if (summaryContent === '') return '';
        return Html.tag(tag, summaryContent, summaryOptions);
    }

    public async renderItems(): Promise<any> {
        
    }

    public async renderPager(): Promise<string> {
        await this.dataProvider.totalCountPromise;
        const pagination = this.dataProvider.getPagination();
        if (pagination === false && this.dataProvider.getCount() <= 0)
            return '';
        let pager = this.pager || new LinkPager({ pagination }); 
        return await pager.render();
    }

    public async renderSorter(): Promise<string> {
        const sort = this.dataProvider.getSort();
        if (!sort || sort.attributes.length === 0 || this.dataProvider.getCount() <= 0)
            return '';
        let sorter = this.sorter || new LinkSorter({ sort }); 
        return sorter.render();
    }
}
