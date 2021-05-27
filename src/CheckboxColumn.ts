import { Application as Pwoli, Column, Html } from ".";

export default class CheckboxColumn extends Column {
    public name = 'selection';
    public checkboxOptions: any = {};
    public multiple = true;
    public cssClass;

    public constructor(config) {
        super(config);
        Object.assign(this, config);
    }

    public async init() {
        await super.init.call(this);
        if (this.name.length === 0)
            throw new Error('The "name" property must be set.');
        if (!/.*\[\]$/.test(this.name))
            this.name += '[]';
        this.registerClientScript();
    }

    protected async renderHeaderCellContent() {
        if (this.header !== undefined || !this.multiple)
            return await super.renderHeaderCellContent();
        return Html.checkbox(this.getHeaderCheckBoxName(), false, { class: 'select-on-check-all' });
    }

    protected async renderDataCellContent(model, key, index) {
        if (this.content !== undefined)
            return super.renderDataCellContent(model, key, index);
        let options;
        if (typeof this.checkboxOptions === 'function')
            options = this.checkboxOptions(model, key, index, this);
        else
            options = this.checkboxOptions;
        if (options.value === undefined)
            options.value = typeof key !== 'string' ? JSON.stringify(key) : key;
        if (this.cssClass !== undefined)
            Html.addCssClass(options, this.cssClass);
        return Html.checkbox(this.name, options.checked !== undefined, options);
    }

    protected getHeaderCheckBoxName() {
        let name = this.name;
        let matches = name.match(/(.*)\[\]$/);
        console.log('matches', matches.length);

        if (matches.length > 0)
            name = matches[1];
        matches = name.match(/(.*)\]$/);
        if (matches === null)
            matches = [];
        if (matches.length > 0)
            name = matches[1] + '_all]';
        else
            name += '_all';
        return name;
    }

    public registerClientScript() {
        const id = this.grid.options.id;
        const options = JSON.stringify({ name: this.name, class: this.cssClass, multiple: this.multiple, checkAll: this.grid.showHeader ? this.getHeaderCheckBoxName() : null });
        Pwoli.view.registerJs(`jQuery('#$id').yiiGridView('setSelectionColumn', ${options});`);
    }
}
