import Pwoli from '../base/Application';
import Column from './Column';
import Html from '../helpers/Html';
import Model from '../base/Model';

/**
 * CheckboxColumn displays a column of checkboxes in a grid view.
 *
 * To add a CheckboxColumn to the [[GridView]], add it to the [[GridView.columns|columns]] configuration as follows:
 *
 * ```js
 * 'columns' => [
 *     // ...
 *     {
 *         class: 'CheckboxColumn',
 *         // you may configure additional properties here
 *     }
 * ]
 * ```
 *
 * Users may click on the checkboxes to select rows of the grid. The selected rows may be
 * obtained by calling the following JavaScript code:
 *
 * ```javascript
 * var keys = $('#grid').yiiGridView('getSelectedRows');
 * // keys is an array consisting of the keys associated with the selected rows
 * ```
 *
 * For more details and usage information on CheckboxColumn, see the [guide article on data widgets](guide:output-data-widgets).
 *
 */
export default class CheckboxColumn extends Column {
    /**
     * The name of the input checkbox input fields. This will be appended with `[]` to ensure it is an array.
     */
    public name = 'selection';
    /**
     * Closure the HTML attributes for checkboxes. This can either be an array of
     * attributes or an anonymous function ([[Closure]]) that returns such an array.
     * The signature of the function should be the following: `function (model, key, index, column)`.
     * Where `model`, `key`, and `index` refer to the model, key and index of the row currently being rendered
     * and `column` is a reference to the [[CheckboxColumn]] object.
     * A function may be used to assign different attributes to different rows based on the data in that row.
     * Specifically if you want to set a different value for the checkbox
     * you can use this option in the following way (in this example using the `name` attribute of the model):
     *
     * ```js
     * checkboxOptions: function (model, key, index, column) {
     *     return {value: model.name};
     * }
     * ```
     *
     * @see [[Html.renderTagAttributes]] for details on how attributes are being rendered.
     */
    public checkboxOptions: { [key: string]: any } = {};
    /**
     * Whether it is possible to select multiple rows. Defaults to `true`.
     */
    public multiple = true;
    /**
     * The css class that will be used to find the checkboxes.
     */
    public cssClass: string;

    public constructor(config: { [key: string]: any }) {
        super(config);
        Object.assign(this, config);
    }
    /**
     * {@inheritdoc}
     * @throws InvalidConfigException if [[name]] is not set.
     */
    public async init() {
        await super.init.call(this);
        if (this.name.length === 0) throw new Error('The "name" property must be set.');
        if (!/.*\[\]$/.test(this.name)) this.name += '[]';
        this.registerClientScript();
    }
    /**
     * Renders the header cell content.
     * The default implementation simply renders [[header]].
     * This method may be overridden to customize the rendering of the header cell.
     * @return the rendering result
     */
    protected async renderHeaderCellContent(): Promise<string> {
        if (this.header !== undefined || !this.multiple) return await super.renderHeaderCellContent();
        return Html.checkbox(this.getHeaderCheckBoxName(), false, { class: 'select-on-check-all' });
    }
    /** @inheritdoc */
    protected async renderDataCellContent(model: Model, key: string, index: number): Promise<string> {
        if (this.content !== undefined) return super.renderDataCellContent(model, key, index);
        let options;
        if (typeof this.checkboxOptions === 'function') options = this.checkboxOptions(model, key, index, this);
        else options = this.checkboxOptions;
        if (options.value === undefined) options.value = typeof key !== 'string' ? JSON.stringify(key) : key;
        if (this.cssClass !== undefined) Html.addCssClass(options, this.cssClass);
        return Html.checkbox(this.name, options.checked !== undefined, options);
    }
    /**
     * @return header checkbox name
     */
    protected getHeaderCheckBoxName(): string {
        let name = this.name;
        let matches = name.match(/(.*)\[\]$/);
        if (matches.length > 0) name = matches[1];
        matches = name.match(/(.*)\]$/);
        if (matches === null) matches = [];
        if (matches.length > 0) name = matches[1] + '_all]';
        else name += '_all';
        return name;
    }
    /**
     * Registers the needed JavaScript.
     */
    public registerClientScript(): void {
        const id = this.grid.options.id;
        const options = JSON.stringify({
            name: this.name,
            class: this.cssClass,
            multiple: this.multiple,
            checkAll: this.grid.showHeader ? this.getHeaderCheckBoxName() : null,
        });
        Pwoli.view.registerJs(`jQuery('#${id}').pwoliGridView('setSelectionColumn', ${options});`);
    }
}
