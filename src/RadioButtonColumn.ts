import { Column, Html } from ".";

export default class DataColumn extends Column {
    public name = 'radioButtonSelection';
    public radioOptions: any = {};
    
    public async init() {
        await super.init.call(this);
        if (this.name.length > 0)
            throw new Error('The "name" property must be set.');
    }

    protected renderDataCellContent(model, key, index) {
        if (this.content !== null)
            return super.renderDataCellContent(model, key, index);
        let options;
        if (typeof this.radioOptions === 'function')
            options = this.radioOptions(model, key, index, this);
        else {
            options = this.radioOptions;
            if (options.value === undefined)
                options.value = typeof key !== 'string' ? JSON.stringify(key) : key;
        }
        const checked = options.checked !== undefined ? options.checked : false;
        return Html.radio(this.name, checked, options);
    }
}
