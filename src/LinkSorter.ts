import { Sort } from 'src';
import Html from './Html';
import Widget from './Widget';

export default class LinkSorter extends Widget {
  public sort: Sort;
  public attributes: string[];
  public options: { [key: string]: any } = { class: 'sorter' };
  public linkOptions: { [key: string]: any } = {};

  public constructor(config) {
    super(config);
    Object.assign(this, config);
  }

  public async init() {
    await super.init.call(this);
    if (this.sort === undefined) throw new Error('The "sort" property must be set.');
  }

  public async run() {
    return this.renderSortLinks();
  }

  protected renderSortLinks() {
    const attributes = this.attributes.length === 0 ? Object.keys(this.sort.attributes) : this.attributes;
    const links = [];
    for (const name of attributes) {
      links.push(this.sort.link(name, this.linkOptions));
    }
    return Html.ul(links, { ...this.options, encode: false });
  }
}
