import Column from './Column';
import Html from '../helpers/Html';
import DataHelper from '../helpers/DataHelper';

/**
 * ActionColumn is a column for the [[GridView]] widget that displays buttons for viewing and manipulating the items.
 *
 * To add an ActionColumn to the gridview, add it to the [[GridView::columns|columns]] configuration as follows:
 *
 * ```js
 * columns: [
 *     // ...
 *     {
 *         class: ActionColumn.class,
 *         // you may configure additional properties here
 *     },
 * ]
 * ```
 *
 * For more details and usage information on ActionColumn, see the [guide article on data widgets](https://internetmango.github.io/pwoli/output-data-widgets).
 *
 */
export default class ActionColumn extends Column {
    public headerOptions: { [key: string]: any } = { class: 'action-column' };
    public route;
    public actionRoutes: { [key: string]: string } = {
        view: 'view/{id}',
        update: 'update/{id}',
        delete: 'delete/{id}',
    };
    /**
     * The template used for composing each cell in the action column.
     * Tokens enclosed within curly brackets are treated as controller action IDs (also called *button names*
     * in the context of action column). They will be replaced by the corresponding button rendering callbacks
     * specified in [[buttons]]. For example, the token `{view}` will be replaced by the result of
     * the callback `buttons['view']`. If a callback cannot be found, the token will be replaced with an empty string.
     *
     * As an example, to only have the view, and update button you can add the ActionColumn to your GridView columns as follows:
     *
     * ```js
     * {class: 'ActionColumn', template: '{view} {update}'},
     * ```
     *
     * @see [[buttons]]
     */
    public template = '{view} {update} {delete}';
    /**
     * The button rendering callbacks. The array keys are the button names (without curly brackets),
     * and the values are the corresponding button rendering callbacks. The callbacks should use the following
     * signature:
     *
     * ```js
     * function (url, model, key) {
     *     // return the button HTML code
     * }
     * ```
     *
     * where `$url` is the URL that the column creates for the button, `$model` is the model object
     * being rendered for the current row, and `$key` is the key of the model in the data provider array.
     *
     * You can add further conditions to the button, for example only display it, when the model is
     * editable (here assuming you have a status field that indicates that):
     *
     * ```js
     * {
     *     update: function(url, model, key) {
     *         return model.status === 'editable' ? Html.a('Update', url) : '';
     *     },
     * },
     * ```
     */
    public buttons: { [key: string]: any } = {};
    /**
     * The array keys are the icon names and the values the corresponding html:
     * ```js
     * {
     *     eye-open: '<svg ...></svg>',
     *     pencil: Html.tag('span', '', [ {class: 'glyphicon glyphicon-pencil'})
     * }
     * ```
     * Defaults to FontAwesome 5 free svg icons.
     * @see https://fontawesome.com
     */
    public icons: { [key: string]: string } = {
        'eye-open':
            '<svg aria-hidden="true" style="display:inline-block;font-size:inherit;height:1em;overflow:visible;vertical-align:-.125em;width:1.125em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M573 241C518 136 411 64 288 64S58 136 3 241a32 32 0 000 30c55 105 162 177 285 177s230-72 285-177a32 32 0 000-30zM288 400a144 144 0 11144-144 144 144 0 01-144 144zm0-240a95 95 0 00-25 4 48 48 0 01-67 67 96 96 0 1092-71z"/></svg>',
        pencil: '<svg aria-hidden="true" style="display:inline-block;font-size:inherit;height:1em;overflow:visible;vertical-align:-.125em;width:1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M498 142l-46 46c-5 5-13 5-17 0L324 77c-5-5-5-12 0-17l46-46c19-19 49-19 68 0l60 60c19 19 19 49 0 68zm-214-42L22 362 0 484c-3 16 12 30 28 28l122-22 262-262c5-5 5-13 0-17L301 100c-4-5-12-5-17 0zM124 340c-5-6-5-14 0-20l154-154c6-5 14-5 20 0s5 14 0 20L144 340c-6 5-14 5-20 0zm-36 84h48v36l-64 12-32-31 12-65h36v48z"/></svg>',
        trash: '<svg aria-hidden="true" style="display:inline-block;font-size:inherit;height:1em;overflow:visible;vertical-align:-.125em;width:.875em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M32 464a48 48 0 0048 48h288a48 48 0 0048-48V128H32zm272-256a16 16 0 0132 0v224a16 16 0 01-32 0zm-96 0a16 16 0 0132 0v224a16 16 0 01-32 0zm-96 0a16 16 0 0132 0v224a16 16 0 01-32 0zM432 32H312l-9-19a24 24 0 00-22-13H167a24 24 0 00-22 13l-9 19H16A16 16 0 000 48v32a16 16 0 0016 16h416a16 16 0 0016-16V48a16 16 0 00-16-16z"/></svg>',
    };
    /** The visibility conditions for each button. The array keys are the button names (without curly brackets),
     * and the values are the boolean true/false or the anonymous function. When the button name is not specified in
     * this array it will be shown by default.
     * The callbacks must use the following signature:
     *
     * ```js
     * function (model, key, index) {
     *     return model.status === 'editable';
     * }
     * ```
     *
     * Or you can pass a boolean value:
     *
     * ```js
     * {
     *    update: true
     * }
     * ```
     */
    public visibleButtons: { [key: string]: boolean | (() => boolean) } = {};
    /**
     * The html options to be applied to the [[initDefaultButton|default button]].
     */
    public buttonOptions: { [key: string]: string } = {};

    public constructor(config: { [key: string]: any } = {}) {
        super(config);
        Object.assign(this, config);
    }
    /** @inheritdoc */
    public async init() {
        await super.init.call(this);
        this.initDefaultButtons();
    }
    /**
     * Initializes the default button rendering callbacks.
     */
    protected initDefaultButtons() {
        this.initDefaultButton('view', 'eye-open');
        this.initDefaultButton('update', 'pencil');
        this.initDefaultButton('delete', 'trash', {
            'data-confirm': 'Are you sure you want to delete this item?',
            'data-method': 'post',
        });
    }

    /**
     * Initializes the default button rendering callback for single button.
     * @param name Button name as it's written in template
     * @param iconName Part of Bootstrap glyphicon class that makes it unique
     * @param additionalOptions Array of additional options
     */
    protected initDefaultButton(name, iconName, additionalOptions = {}) {
        if (this.buttons[name] === undefined && this.template.indexOf(`{${name}}`) !== -1) {
            this.buttons[name] = (url, model, key) => {
                let title = name.charAt(0).toUpperCase() + name.slice(1);
                let options = {
                    title,
                    'aria-label': title,
                    'data-pjax': 'false',
                    ...additionalOptions,
                    ...this.buttonOptions,
                };
                let icon =
                    this.icons[iconName] !== undefined
                        ? this.icons[iconName]
                        : Html.tag('span', '', { class: `glyphicon glyphicon-${iconName}` });
                return Html.a(icon, url, options);
            };
        }
    }

    /**
     * Creates a URL for the given action and model.
     * This method is called for each button and each row.
     * @param action the button name (or action ID)
     * @param activeRecordInterface model the data model
     * @param key the key associated with the data model
     * @param index the current row index
     * @return the created URL
     */

    public createUrl(action, model, key, index) {
        const resolvedActionRoute = this.actionRoutes[action].replace('{id}', key);
        return this.route !== undefined ? `/${this.route}/${resolvedActionRoute}` : resolvedActionRoute;
    }

    /** @inheritdoc */
    protected async renderDataCellContent(model, key, index) {
        return await DataHelper.replaceAsync(this.template, /{\w+}/g, async (match) => {
            let name = match.replace(/\{|\}/g, '');
            let isVisible;
            if (this.visibleButtons[name] !== undefined)
                isVisible =
                    typeof this.visibleButtons[name] === 'function'
                        ? (this.visibleButtons as {})[name](this.visibleButtons[name], model, key, index)
                        : this.visibleButtons[name];
            else isVisible = true;
            if (isVisible && this.buttons[name] !== undefined)
                return this.buttons[name](this.createUrl(name, model, key, index), model, key);
            return '';
        });
    }
}
