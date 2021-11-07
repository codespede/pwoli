import Model from '../base/Model';
import Application from '../base/Application';
import CollectionView from './CollectionView';
import DataHelper from '../helpers/DataHelper';
import Html from '../helpers/Html';
import Widget from '../base/Widget';
/**
 * The ListView widget is used to display data from data
 * provider. Each data model is rendered using the view
 * specified.
 *
 * For more details and usage information on ListView, see the [guide article on data widgets](guide:output-data-widgets).
 *
 * @author Mahesh S Warrier <https://github.com/codespede>
 */
export default class ListView extends CollectionView {
    /**
     * The HTML attributes for the container of the rendering result of each data model.
     * This can be either an array specifying the common HTML attributes for rendering each data item,
     * or a callback that returns an array of the HTML attributes. The anonymous function will be
     * called once for every data model returned by [[dataProvider]].
     * The "tag" element specifies the tag name of the container element and defaults to "div".
     * If "tag" is false, it means no container element will be rendered.
     *
     * If this property is specified as a callback, it should have the following signature:
     *
     * ```js
     * function (model, key, index, widget)
     * ```
     *
     * @see \yii\helpers\Html::renderTagAttributes() for details on how attributes are being rendered.
     */
    public itemOptions:
        | { [key: string]: any }
        | ((model: Model, key: string, index: number, widget: Widget) => { [key: string]: any }) = {};
    /**
     * The name of the view for rendering each data item, or a callback (e.g. an anonymous function)
     * for rendering each data item. If it specifies a view name, the following variables will
     * be available in the view:
     *
     * - `model`: mixed, the data model
     * - `key`: mixed, the key value associated with the data item
     * - `index`: integer, the zero-based index of the data item in the items array returned by [[dataProvider]].
     * - `widget`: ListView, this widget instance
     *
     * Note that the view name is resolved into the view file by the current context of the [[view]] object.
     *
     * If this property is specified as a callback, it should have the following signature:
     *
     * ```js
     * function (model, key, index, widget)
     * ```
     */
    public itemView: string | ((model: Model, key: string, index: number, widget: Widget) => string) | undefined;
    /**
     * Additional parameters to be passed to [[itemView]] when it is being rendered.
     * This property is used only when [[itemView]] is a string representing a view name.
     */
    public viewParams: { [key: string]: any } = {};
    /**
     * @var string the HTML code to be displayed between any two consecutive items.
     */
    public separator = '\n';
    /**
     * @var array the HTML attributes for the container tag of the list view.
     * The "tag" element specifies the tag name of the container element and defaults to "div".
     * @see \yii\helpers\Html::renderTagAttributes() for details on how attributes are being rendered.
     */
    public options: { [key: string]: any } = { class: 'list-view' };

    public constructor(config: { [key: string]: any }) {
        super(config);
        Object.assign(this, config);
    }
    /**
     * Renders all data models.
     * @return the rendering result
     */
    public async renderItems(): Promise<string> {
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
    /**
     * Renders a single data model.
     * @param model the data model to be rendered
     * @param key the key value associated with the data model
     * @param index the zero-based index of the data model in the model array returned by [[dataProvider]].
     * @return the rendering result
     */
    public async renderItem(model: Model, key: string, index: number): Promise<string> {
        let content;
        let options;
        if (this.itemView === undefined) content = key;
        else if (typeof this.itemView === 'string')
            content = await Application.view.render(this.itemView, {
                model,
                key,
                index,
                widget: this,
                ...this.viewParams,
            });
        else content = this.itemView(model, key, index, this);
        if (typeof this.itemOptions === 'function') options = this.itemOptions(model, key, index, this);
        else options = this.itemOptions;
        const tag = DataHelper.remove(options, 'tag', 'div');
        options['data-key'] = Array.isArray(key) ? JSON.stringify(key) : key;
        return Html.tag(tag, content, options);
    }
}
