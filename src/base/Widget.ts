import Component from './Component';
/**
 * Widget is the base class for widgets.
 *
 * For more details and usage information on Widget, see the [guide article on widgets](guide:structure-widgets).
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
    private _id;
    public constructor(config: { [key: string]: any }) {
        super(config);
        Object.assign(this, config);
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
        return '';
    }

    public registerAssets() {}
}
