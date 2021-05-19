import Application from "./Application";
import CollectionView from "./CollectionView";
import DataHelper from "./DataHelper";
import DataProvider from "./DataProvider";
import Html from "./Html";

export default class ListView extends CollectionView {
    public itemOptions: any = {};
    public itemView;
    public viewParams = {};
    public separator = "\n";
    public options; any = { class: 'list-view' };

    public constructor(config) {
        super(config);
        Object.assign(this, config);
    }
    public async renderItems(): Promise<any> {
        const models = await this.dataProvider.getModels();
        const keys = this.dataProvider.getKeys();
        const rows = [];
        let i = 0;
        for (const model of models) {
            const key = keys[i];
            rows.push(await this.renderItem(model, key, i));
            i++;
        }
        return rows.join(this.separator);
    }

    public async renderItem(model, key, index) {
        let content;
        let options;
        if (this.itemView === undefined)
            content = key;
        else if (typeof this.itemView === 'string')
            content = await Application.view.render(this.itemView, { model, key, index, widget: this, ...this.viewParams });
        else
            content = this.itemView(model, key, index, this);
        if (typeof this.itemOptions === 'function')
            options = this.itemOptions(model, key, index, this);
        else
            options = this.itemOptions;
        const tag = DataHelper.remove(options, 'tag', 'div');
        options['data-key'] = Array.isArray(key) ? JSON.stringify(key) : key;
        return Html.tag(tag, content, options);
    }
}
