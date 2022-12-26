import path = require('path');
import Html from '../helpers/Html';
import Widget from '../base/Widget';
import Model from '../base/Model';
import Pwoli from '../base/Application';
import ActiveField from './ActiveField';
/**
 * ActiveForm is a widget that builds an interactive HTML form for one or multiple data models.
 *
 * For more details and usage information on ActiveForm, see the [guide article on forms](https://internetmango.github.io/pwoli/input-forms).
 *
 * @author Mahesh S Warrier <https://github.com/codespede>
 */
export default class ActiveForm extends Widget {
    /**
     * The form action URL.
     * @see [[method]] for specifying the HTTP method for this form.
     */
    public action = '';
    /**
     * The form submission method. This should be either `post` or `get`. Defaults to `post`.
     *
     * When you set this to `get` you may see the url parameters repeated on each request.
     * This is because the default value of [[action]] is set to be the current request url and each submit
     * will add new parameters instead of replacing existing ones.
     * You may set [[action]] explicitly to avoid this:
     *
     * ```js
     * let form = new ActiveForm({
     *     method: 'get',
     *     action: '/my-url',
     * });
     * ```
     */
    public method = 'post';
    /**
     * The HTML attributes (name-value pairs) for the form tag.
     * @see [[Html.renderTagAttributes]] for details on how attributes are being rendered.
     */
    public options: { [key: string]: any } = {};
    /**
     * The default field class name when calling [[field()]] to create a new field.
     * @see [[fieldConfig]]
     */
    public fieldClass = ActiveField;
    /**
     * The default configuration used by [[field()]] when creating a new field object.
     * This can be either a configuration array or an anonymous function returning a configuration array.
     * If the latter, the signature should be as follows:
     *
     * ```js
     * function (model, attribute)
     * ```
     *
     * The value of this property will be merged recursively with the `$options` parameter passed to [[field]].
     *
     * @see fieldClass
     */
    public fieldConfig: { [key: string]: any } | ((model: Model, attribute: string) => { [key: string]: any }) = {};
    /**
     * Whether to perform encoding on the error summary.
     */
    public encodeErrorSummary = true;
    /**
     * The default CSS class for the error summary container.
     * @see [[errorSummary]]
     */
    public errorSummaryCssClass = 'error-summary';
    /**
     * The CSS class that is added to a field container when the associated attribute is required.
     */
    public requiredCssClass = 'required';
    /**
     * The CSS class that is added to a field container when the associated attribute is required.
     */
    public successCssClass = 'has-success';
    /**
     * The CSS class that is added to a field container when the associated attribute has validation error.
     */
    public errorCssClass = 'has-error';
    /**
     * The CSS class that is added to a field container when the associated attribute is being validated.
     */
    public validatingCssClass = 'validating';
    /**
     * @var string where to render validation state class
     * Could be either "container" or "input".
     * Default is "container".
     */
    public validationStateOn = 'container';
    /**
     * Whether to enable client-side data validation.
     * If [[ActiveField.enableClientValidation]] is set, its value will take precedence for that input field.
     */
    public enableClientValidation = true;
    /**
     * Whether to enable AJAX-based data validation.
     * If [[ActiveField.enableAjaxValidation]] is set, its value will take precedence for that input field.
     */
    public enableAjaxValidation = false;
    /**
     * Whether to hook up `pwoli.activeForm` JavaScript plugin.
     * This property must be set `true` if you want to support client validation and/or AJAX validation, or if you
     * want to take advantage of the `yii.activeForm` plugin. When this is `false`, the form will not generate
     * any JavaScript.
     * @see [[registerClientScript]]
     */
    public enableClientScript = true;
    /**
     * The URL for performing AJAX-based validation.
     * If this property is not set, it will take the value of the form's action attribute.
     */
    public validationUrl: string;
    /**
     * Whether to perform validation when the form is submitted.
     */
    public validateOnSubmit = true;
    /**
     * Whether to perform validation when the value of an input field is changed.
     * If [[ActiveField.validateOnChange]] is set, its value will take precedence for that input field.
     */
    public validateOnChange = true;
    /**
     * @var bool whether to perform validation while the user is typing in an input field.
     * If [[ActiveField.validateOnType]] is set, its value will take precedence for that input field.
     * @see [[validationDelay]]
     */
    public validateOnType = false;
    /**
     * Whether to perform validation when an input field loses focus.
     * If [[ActiveField.validateOnBlur]] is set, its value will take precedence for that input field.
     */
    public validateOnBlur = true;
    /**
     * Number of milliseconds that the validation should be delayed when the user types in the field
     * and [[validateOnType]] is set `true`.
     * If [[ActiveField.validationDelay]] is set, its value will take precedence for that input field.
     */
    public validationDelay = 500;
    /**
     * The name of the GET parameter indicating the validation request is an AJAX request.
     */
    public ajaxParam = 'ajax';
    /**
     * The type of data that you're expecting back from the server.
     */
    public ajaxDataType = 'json';
    /**
     * Whether to scroll to the first error after validation.
     */
    public scrollToError = true;
    /**
     * Offset in pixels that should be added when scrolling to the first error.
     */
    public scrollToErrorOffset = 0;
    /**
     * The client validation options for individual attributes. Each element of the array
     * represents the validation options for a particular attribute.
     * @internal
     */
    public attributes = [];
    /**
     * The ActiveField objects that are currently active
     */
    private _fields = [];

    public constructor(config: { [key: string]: any } = {}) {
        super(config);
        Object.assign(this, config);
    }
    /**
     * Runs the widget.
     * @throws `Error` if `beginField()` and `endField()` calls are not matching.
     */
    public async run() {
        if (this._fields.length === 0) throw new Error('Each beginField() should have a matching endField() call.');
    }
    /**
     * Begins the form with `<form>` tag.
     */
    public async begin() {
        let html = Html.beginForm(this.action, this.method, this.options);
        return html;
    }
    /**
     * Ends the form with `</form>` tag.
     * This registers the necessary JavaScript code and renders the form open and close tags.
     */
    public async end() {
        const html = Html.endForm();
        if (this.enableClientScript) await this.registerClientScript();
        await super.run.call(this);
        return html;
    }
    /**
     * This registers the necessary JavaScript code for the frontend.
     */
    public async registerClientScript() {
        const id = this.options.id;
        const options = JSON.stringify(this.getClientOptions());
        let attributes = JSON.stringify(this.attributes);
        attributes = attributes.replace(/\"(function.*?\})\"/g, `$1`).replace(/(\\":?!)|({?!\\")|(\\")/g, '"');

        await Pwoli.view.publishAndRegisterFile(path.join(__dirname, '/../assets/css/bootstrap.css'));
        await Pwoli.view.publishAndRegisterFile(path.join(__dirname, '/../assets/js/activeForm.js'));
        await Pwoli.view.publishAndRegisterFile(path.join(__dirname, '/../assets/js/validation.js'));
        Pwoli.view.registerJs(`jQuery('#${id}').pwoliActiveForm(${attributes}, ${options});`);
    }
    /**
     * Returns the options for the form JS widget.
     * @return the options.
     */
    protected getClientOptions(): { [key: string]: any } {
        const options: any = {
            encodeErrorSummary: this.encodeErrorSummary,
            errorSummary: '.' + this.errorSummaryCssClass.split(/\s+/).join('.'),
            validateOnSubmit: this.validateOnSubmit,
            errorCssClass: this.errorCssClass,
            successCssClass: this.successCssClass,
            validatingCssClass: this.validatingCssClass,
            ajaxParam: this.ajaxParam,
            ajaxDataType: this.ajaxDataType,
            scrollToError: this.scrollToError,
            scrollToErrorOffset: this.scrollToErrorOffset,
            validationStateOn: this.validationStateOn,
        };

        if (this.validationUrl !== undefined) options.validationUrl = this.validationUrl;
        return {
            encodeErrorSummary: true,
            errorSummary: '.error-summary',
            validateOnSubmit: true,
            errorCssClass: 'has-error',
            successCssClass: 'has-success',
            validatingCssClass: 'validating',
            ajaxParam: 'ajax',
            ajaxDataType: 'json',
            scrollToError: true,
            scrollToErrorOffset: 0,
            validationStateOn: 'container',
            ...options,
        };
    }
    /**
     * Generates a summary of the validation errors.
     * If there is no validation error, an empty error summary markup will still be generated, but it will be hidden.
     * @param models the model(s) associated with this form.
     * @param options the tag options in terms of name-value pairs. The following options are specially handled:
     *
     * - `header`: string, the header HTML for the error summary. If not set, a default prompt string will be used.
     * - `footer`: string, the footer HTML for the error summary.
     *
     * The rest of the options will be rendered as the attributes of the container tag. The values will
     * be HTML-encoded using [[Html.encode]]. If a value is `null`, the corresponding attribute will not be rendered.
     * @return string the generated error summary.
     * @see [[errorSummaryCssClass]]
     */
    public errorSummary(models: Model[], options: { [key: string]: any } = {}) {
        Html.addCssClass(options, this.errorSummaryCssClass);
        options.encode = this.encodeErrorSummary;
        return Html.errorSummary(models, options);
    }
    /**
     * Generates a form field.
     * A form field is associated with a model and an attribute. It contains a label, an input and an error message
     * and use them to interact with end users to collect their inputs for the attribute.
     * @param model the data model.
     * @param attribute the attribute name or expression. See [[Html.getAttributeName]] for the format
     * about attribute expression.
     * @param options the additional configurations for the field object. These are properties of [[ActiveField]]
     * or a subclass, depending on the value of [[fieldClass]].
     * @return ActiveField the created ActiveField object.
     * @see [[fieldConfig]]
     */
    public field(model: Model, attribute: string, options: { [key: string]: any } = {}): ActiveField {
        let config = this.fieldConfig;
        if (typeof config === 'function') config = config(model, attribute);
        if ((config as { [key: string]: any }).class === undefined)
            (config as { [key: string]: any }).class = this.fieldClass;
        return new (config as { [key: string]: any }).class({ ...options, model, attribute, form: this });
    }
    /**
     * Begins a form field.
     * This method will create a new form field and returns its opening tag.
     * You should call [[endField]] afterwards.
     * @param model the data model.
     * @param attribute the attribute name or expression. See [[Html.getAttributeName]] for the format
     * about attribute expression.
     * @param options the additional configurations for the field object.
     * @return the opening tag.
     * @see [[endField]]
     * @see [[field]]
     */
    public beginField(model: Model, attribute: string, options: { [key: string]: any } = {}): string {
        const field = this.field(model, attribute, options);
        this._fields.push(field);
        return field.begin();
    }
    /**
     * Ends a form field.
     * This method will return the closing tag of an active form field started by [[beginField]].
     * @return the closing tag of the form field.
     * @throws `Error` if this method is called without a prior [[beginField]] call.
     */
    public endField(): string {
        const field = this._fields.pop();
        if (field instanceof ActiveField) return field.end();
        throw new Error('Mismatching endField() call.');
    }
    /**
     * Validates one or several models and returns an error message array indexed by the attribute IDs.
     * This is a helper method that simplifies the way of writing AJAX validation code.
     *
     * For example, you may use the following code in a controller action to respond
     * to an AJAX validation request:
     *
     * ```js
     * let model = new Post;
     * model.load(request.body);
     * if (request.xhr) {
     *     response.setHeader('Content-Type', 'application/json');
     *     response.write(JSON.stringify(await ActiveForm.validate(model)));
     * }
     * // ... respond to non-AJAX request ...
     * ```
     *
     * To validate multiple models, simply pass each model as a parameter to this method, like
     * the following:
     *
     * ```js
     * ActiveForm.validate($model1, $model2, ...);
     * ```
     *
     * @param model the model to be validated.
     * @param attributes list of attributes that should be validated.
     * If this parameter is empty, it means any attribute listed in the applicable
     * validation rules should be validated.
     *
     * When this method is used to validate multiple models, this parameter will be interpreted
     * as a model.
     *
     * @return the error message array indexed by the attribute IDs.
     */
    public static async validate(model: Model, attributes: string[] = null): Promise<{ [key: string]: string[] }> {
        let result = {};
        let models = [model];
        for (let model of models) {
            await model.verify(attributes);
            for (let attribute in model._errors) result[Html.getInputId(model, attribute)] = [model._errors[attribute]];
        }
        return result;
    }
    /**
     * Validates an array of model instances and returns an error message array indexed by the attribute IDs.
     * This is a helper method that simplifies the way of writing AJAX validation code for tabular input.
     *
     * For example, you may use the following code in a controller action to respond
     * to an AJAX validation request:
     *
     * ```js
     * // ... load models ...
     * if (request.xhr) {
     *     response.setHeader('Content-Type', 'application/json');
     *     response.write(JSON.stringify(await ActiveForm.validateMultiple(model)));
     * }
     * // ... respond to non-AJAX request ...
     * ```
     *
     * @param models an array of models to be validated.
     * @param attributes list of attributes that should be validated.
     * If this parameter is empty, it means any attribute listed in the applicable
     * validation rules should be validated.
     * @return the error message array indexed by the attribute IDs.
     */
    public static async validateMultiple(
        models: Model[],
        attributes: string[] = null,
    ): Promise<{ [key: string]: string[] }> {
        let result = {};
        let i = 0;
        for (let model of models) {
            await model.validate(attributes);
            for (let attribute in model.errors)
                result[Html.getInputId(model, `[${i}]${attribute}`)] = model.errors[attribute];
            i++;
        }
        return result;
    }
}
