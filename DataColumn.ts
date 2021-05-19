import Inflector from "inflected";
import ActiveDataProvider from "./ActiveDataProvider";
import ArrayDataProvider from "./ArrayDataProvider";
import Column from "./Column";
import Html from "./Html";
import { Model } from "./Model";

export default class DataColumn extends Column {
    public attribute;
    public label;
    public encodeLabel = true;
    public value;
    public format = 'text';
    public enableSorting = true;
    public sortLinkOptions: any = {};
    public filter;
    public filterInputOptions: any = { class: 'form-control', id: null };
    public filterAttribute;

    public constructor(config) {
        super(config);
        Object.assign(this, config);
    }

    public async init() {
        await super.init.call(this);
        if (this.filterAttribute === undefined)
            this.filterAttribute = this.attribute;
    }

    protected async renderHeaderCellContent() {
        if (this.header !== undefined || (this.label === undefined && this.attribute === undefined))
            return super.renderHeaderCellContent();
        let label = await this.getHeaderCellLabel();

        if (this.encodeLabel)
            label = Html.encode(label);
        const sort = this.grid.dataProvider.getSort();
        // console.log('rhcc', this.attribute !== undefined && this.enableSorting && (sort !== false) && sort.hasAttribute(this.attribute));
        if (this.attribute !== undefined && this.enableSorting && (sort !== false) && sort.hasAttribute(this.attribute))
            return sort.link(this.attribute, { ...this.sortLinkOptions, label });
        return label;
    }

    protected async getHeaderCellLabel() {

        const provider = this.grid.dataProvider;
        let modelClass;
        let model;
        let models;
        let label;
        if (this.label === undefined) {
            if ((provider instanceof ActiveDataProvider) || (provider instanceof ArrayDataProvider && provider.modelClass !== undefined)) {
                modelClass = provider.modelClass;
                model = new modelClass({});
                label = model.getAttributeLabel(this.attribute)
            } else if (this.grid.filterModel !== undefined && this.grid.filterModel instanceof Model) {
                label = this.grid.filterModel.getAttributeLabel(this.filterAttribute)
            } else {
                models = await provider.getModels();
                model = models[0];
                if (model instanceof Model) {
                    label = model.getAttributeLabel(this.attribute);
                } else {
                    label = Inflector.humanize(this.attribute)
                }
            }
        } else
            label = this.label;
        return label;
    }

    protected renderFilterCellContent() {
        if (typeof this.filter === 'string')
            return this.filter;
        const model = this.grid.filterModel;
        if (this.filter !== false && model instanceof Model && this.filterAttribute !== undefined) {
            const options = { maxlength: true, ...this.filterInputOptions };
            return Html.activeTextInput(model, this.filterAttribute, options);
        }
        return super.renderFilterCellContent.call(this);
    }

    public getDataCellvalue(model, key, index) {
        if (this.value !== undefined) {
            if (typeof this.value === 'string')
                return this.value;
            return this.value(model, key, index, this);
        } else if (this.attribute !== undefined)
            return model[this.attribute];
        return null;
    }

    protected renderDataCellContent(model, key, index) {
        if (this.content === undefined)
            return this.getDataCellvalue(model, key, index);
        return super.renderDataCellContent.call(this, model, key, index);
    }
}
