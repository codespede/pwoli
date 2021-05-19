import { exception } from "console";
import Html from "./Html";
import Widget from "./Widget";

export default class LinkSorter extends Widget {
    public sort;
    public attributes;
    public options: any = { class: 'sorter' };
    public linkOptions: any = {};

    public constructor(config) {
        super(config);
        Object.assign(this, config);
    }

    public async init() {
        await super.init.call(this);
        if (this.sort === undefined)
            throw new exception('The "sort" property must be set.');
    }

    public async run() {
        return this.renderSortLinks();
    }

    protected renderSortLinks() {
        const attributes = this.attributes.length === 0 ? Object.keys(this.sort.attributes) : this.attributes;
        const links = [];
        for (const name of attributes) {
            links.push(this.sort.link(name, this.linkOptions))
        }
        return Html.ul(links, { ...this.options, encode: false });
    }
}
