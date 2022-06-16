import Sort from '../data/Sort';
import Html from '../helpers/Html';
import Widget from '../base/Widget';
/**
 * LinkSorter renders a list of sort links for the given sort definition.
 *
 * LinkSorter will generate a hyperlink for every attribute declared in [[sort]].
 *
 * For more details and usage information on LinkSorter, see the [guide article on sorting](guide:output-sorting).
 *
 * @author Mahesh S Warrier <https://github.com/codespede>
 */
export default class LinkSorter extends Widget {
    /**
     * the sort definition
     */
    public sort: Sort;
    /**
     * List of the attributes that support sorting. If not set, it will be determined
     * using [[Sort.attributes]].
     */
    public attributes: any = {};
    /**
     * HTML attributes for the sorter container tag.
     * @see [[Html.ul]] for special attributes.
     * @see [[Html.renderTagAttributes]] for details on how attributes are being rendered.
     */
    public options: { [key: string]: any } = { class: 'sorter' };
    /**
     * HTML attributes for the link in a sorter container tag which are passed to [[Sort.link]].
     * @see [[Html.renderTagAttribute]]s for details on how attributes are being rendered.
     */
    public linkOptions: { [key: string]: any } = {};

    public constructor(config: { [key: string]: any }) {
        super(config);
        Object.assign(this, config);
    }
    /**
     * Initializes the sorter.
     */
    public async init() {
        await super.init.call(this);
        if (this.sort === undefined) throw new Error('The "sort" property must be set.');
    }
    /**
     * Executes the widget.
     * This method renders the sort links.
     */
    public async run(): Promise<string> {
        return this.renderSortLinks();
    }
    /**
     * Renders the sort links.
     * @return the rendering result
     */
    protected renderSortLinks(): string {
        const attributes = Object.keys(this.attributes).length === 0 ? Object.keys(this.sort.attributes) : this.attributes;
        const links = [];
        for (const name of attributes) {
            links.push(this.sort.link(name, this.linkOptions));
        }
        return Html.ul(links, { ...this.options, encode: false });
    }
}
