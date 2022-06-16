import Pwoli from '../base/Application';
import Component from './Component';
/**
 * Widget is the base class for widgets.
 *
 * For more details and usage information on Widget, see the [guide article on widgets](https://internetmango.github.io/pwoli/output-data-widgets).
 *
 * @author Mahesh S Warrier <https://github.com/codespede>
 */
export default class Widget extends Component {
    /**
     * The prefix to the automatically generated widget IDs.
     * @see [[getId]]
     */
    public static autoIdPrefix = 'w';
    /**
     * A counter used to generate [[id]] for widgets.
     * @internal
     */
    public static counter = 0;
    /**
     * The HTML attributes for the container tag of the widget.
     * @see [[Html.renderTagAttributes]] for details on how attributes are being rendered.
     */
    public options: { [key: string]: any } = {};
    /**
     * Whether to enable [Pjax](https://github.com/MoOx/pjax) on this widget.
     */
    public enablePjax = true;
    private _id;
    public constructor(config: { [key: string]: any }) {
        super(config);
        Object.assign(this, config);
    }
    /**
     * Initializes the widget.
     */
    public async init() {
        await super.init.call(this);
        if (this.options.id === undefined) this.options.id = this.getId();
    }
    /**
     * Returns the ID of the widget.
     * @param autoGenerate whether to generate an ID if it is not set previously
     * @return ID of the widget.
     */
    public getId(autogenerate = true): string {
        if (autogenerate && this._id === undefined) this._id = Widget.autoIdPrefix + Widget.counter++;
        return this._id;
    }
    /**
     * Renders a widget.
     *
     * @return string the rendering result.
     * @throws InvalidArgumentException if the view file does not exist.
     */
    public async render(): Promise<string> {
        return await this.run();
    }
    /**
     * Executes the widget.
     * @return the result of widget execution to be outputted.
     */
    public async run(): Promise<any> {
        await this.initialization;
        if (this.enablePjax) {
            console.log('wrun', )
            await Pwoli.view.registerJs(
                `jQuery(document).on('submit', '#${this.options.id} form[data-pjax]', function(event){ jQuery.pjax.submit(event, {id: '${this.options.id}', container: '#${this.options.id}'})});`,
            );
            await Pwoli.view.registerJs(`jQuery(document).pjax('#${this.options.id} a', '#${this.options.id}');`);
        }
        return '';
    }

    public registerAssets() {}
}
