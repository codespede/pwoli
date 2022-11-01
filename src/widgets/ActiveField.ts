import Pwoli from '../base/Application';
import Component from '../base/Component';
import ActiveForm from './ActiveForm';
import Model from '../base/Model';
import DataHelper from '../helpers/DataHelper';
import Html from '../helpers/Html';
const ormAdapter = Pwoli.getORMAdapter();

/**
 * ActiveField represents a form input field within an [[ActiveForm]].
 *
 * For more details and usage information on ActiveField, see the [guide article on forms](guide:input-forms).
 *
 * @author Mahesh S Warrier <https://github.com/codespede>
 */
export default class ActiveField extends Component {
    /**
     * The form that this field is associated with.
     */
    public form: ActiveForm;
    /**
     * The data model that this field is associated with.
     */
    public model: Model;
    /**
     * The model attribute that this field is associated with.
     */
    public attribute: string;
    /**
     * The HTML attributes (name-value pairs) for the field container tag.
     * The values will be HTML-encoded using [[Html.encode]].
     * If a value is `null`, the corresponding attribute will not be rendered.
     * The following special options are recognized:
     *
     * - `tag`: the tag name of the container element. Defaults to `div`. Setting it to `false` will not render a container tag.
     *   See also [[Html.tag]].
     *
     * If you set a custom `id` for the container element, you may need to adjust the [[selectors]] accordingly.
     *
     * @see [[Html.renderTagAttributes]] for details on how attributes are being rendered.
     */
    public options: { [key: string]: any } = { class: 'form-group' };
    /**
     * The template that is used to arrange the label, the input field, the error message and the hint text.
     * The following tokens will be replaced when [[render()]] is called: `{label}`, `{input}`, `{error}` and `{hint}`.
     */
    public template = '{label}\n{input}\n{hint}\n{error}';
    /**
     * The default options for the input tags. The parameter passed to individual input methods
     * (e.g. [[textInput]]) will be merged with this property when rendering the input tag.
     *
     * If you set a custom `id` for the input element, you may need to adjust the [[selectors]] accordingly.
     *
     * @see [[Html.renderTagAttributes]] for details on how attributes are being rendered.
     */
    public inputOptions: { [key: string]: any } = { class: 'form-control' };
    /**
     * @var array the default options for the error tags. The parameter passed to [[error]] will be
     * merged with this property when rendering the error tag.
     * The following special options are recognized:
     *
     * - `tag`: the tag name of the container element. Defaults to `div`. Setting it to `false` will not render a container tag.
     *   See also [[Html.tag]].
     * - `encode`: whether to encode the error output. Defaults to `true`.
     *
     * If you set a custom `id` for the error element, you may need to adjust the [[selectors]] accordingly.
     *
     * @see [[Html.renderTagAttributes]] for details on how attributes are being rendered.
     */
    public errorOptions: { [key: string]: any } = { class: 'help-block' };
    /**
     * The default options for the label tags. The parameter passed to [[label]] will be
     * merged with this property when rendering the label tag.
     * @see [[Html.renderTagAttributes]] for details on how attributes are being rendered.
     */
    public labelOptions: { [key: string]: any } = { class: 'control-label' };
    /**
     * The default options for the hint tags. The parameter passed to [[hint]] will be
     * merged with this property when rendering the hint tag.
     * The following special options are recognized:
     *
     * - `tag`: the tag name of the container element. Defaults to `div`. Setting it to `false` will not render a container tag.
     *   See also [[Html.tag]].
     *
     * @see [[Html.renderTagAttributes]] for details on how attributes are being rendered.
     */
    public hintOptions: { [key: string]: any } = { class: 'hint-block' };
    /**
     * Whether to enable client-side data validation.
     * If not set, it will take the value of [[ActiveForm.enableClientValidation]].
     */
    public enableClientValidation: boolean;
    /**
     * Whether to enable AJAX-based data validation.
     * If not set, it will take the value of [[ActiveForm.enableAjaxValidation]].
     */
    public enableAjaxValidation: boolean;
    /**
     * Whether to perform validation when the value of the input field is changed.
     * If not set, it will take the value of [[ActiveForm.validateOnChange]].
     */
    public validateOnChange: boolean;
    /**
     * Whether to perform validation when the input field loses focus.
     * If not set, it will take the value of [[ActiveForm.validateOnBlur]].
     */
    public validateOnBlur: boolean;
    /**
     * Whether to perform validation while the user is typing in the input field.
     * If not set, it will take the value of [[ActiveForm.validateOnType]].
     * @see [[validationDelay]]
     */
    public validateOnType: boolean;
    /**
     * Number of milliseconds that the validation should be delayed when the user types in the field
     * and [[validateOnType]] is set `true`.
     * If not set, it will take the value of [[ActiveForm.validationDelay]].
     */
    public validationDelay: number;
    /**
     * The jQuery selectors for selecting the container, input and error tags.
     * The array keys should be `container`, `input`, and/or `error`, and the array values
     * are the corresponding selectors. For example, `{ input: '#my-input'}`.
     *
     * The container selector is used under the context of the form, while the input and the error
     * selectors are used under the context of the container.
     *
     * You normally do not need to set this property as the default selectors should work well for most cases.
     */
    public selectors: { [key: string]: string } = {};
    /**
     * Different parts of the field (e.g. input, label). This will be used together with
     * [[template]] to generate the final field HTML code. The keys are the token names in [[template]],
     * while the values are the corresponding HTML code. Valid tokens include `{input}`, `{label}` and `{error}`.
     * Note that you normally don't need to access this property directly as
     * it is maintained by various methods of this class.
     */
    public parts: { [key: string]: string } = {};
    /**
     * Adds aria HTML attributes `aria-required` and `aria-invalid` for inputs
     */
    public addAriaAttributes = true;
    /**
     * This property holds a custom input id if it was set using [[inputOptions]] or in one of the
     * `options` parameters of the `input*` methods.
     */
    private _inputId: string;
    /**
     * If "for" field label attribute should be skipped.
     */
    private _skipLabelFor = false;
    /**
     * The params with which /assets/js/activeForm.js should perform the client validation.
     */
    private clientValidators: { [key: string]: (params: { [key: string]: any }) => string } = {
        regex: (params) => {
            
            params.options = {
                message: `The value entered is invalid.`,
                pattern: params.criteria.source,
                ...params.options,
            };
            return `pwoli.validation.regularExpression(value, messages, ${JSON.stringify(params.options)});`;
        },
        regexInverse: (params) => {
            params.options = {
                message: `The value entered is invalid.`,
                pattern: params.criteria.source,
                not: true,
                ...params.options,
            };

            return `pwoli.validation.regularExpression(value, messages, ${JSON.stringify(params.options)});`;
        },
        required: (params) => {
            params.options = { message: `This field cannot be blank.`, ...params.options };
            return `pwoli.validation.required(value, messages, ${JSON.stringify(params.options)});`;
        },
        email: (params) => {
            params.options = {
                pattern:
                    "^[a-zA-Z0-9!#$%&'*+\\/=?^_`{|}~-]+(?:.[a-zA-Z0-9!#$%&'*+\\/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$",
                fullPattern:
                    "^[^@]*<[a-zA-Z0-9!#$%&'*+\\/=?^_`{|}~-]+(?:.[a-zA-Z0-9!#$%&'*+\\/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?>$",
                message: `Entered value should be an Email`,
                ...params.options,
            };
            return `pwoli.validation.email(value, messages, ${JSON.stringify(params.options)});`;
        },
    };

    public constructor(config: { [key: string]: any } = {}) {
        super(config);
        Object.assign(this, config);
    }
    /**
     * Returns the string representation of this object.
     * @return string the string representation of this object.
     */
    public async __toString() {
        return await this.render();
    }
    /**
     * Renders the whole field.
     * This method will generate the label, error tag, input tag and hint tag (if any), and
     * assemble them into HTML according to [[template]].
     * @param content the content within the field container.
     * If `null` (not set), the default methods will be called to generate the label, error tag and input tag,
     * and use them as the content.
     * If a callback, it will be called to generate the content. The signature of the callback should be:
     *
     * ```js
     * function (field) {
     *     return html;
     * }
     * ```
     *
     * @return the rendering result.
     */
    public async render(content: null | string | ((field: ActiveField) => string) = null) {
        const cont = content;
        if (content === null) {
            if (this.parts['{input}'] === undefined) this.textInput();
            if (this.parts['{label}'] === undefined) this.label();
            if (this.parts['{error}'] === undefined) this.error();
            if (this.parts['{hint}'] === undefined) this.hint(null);
            content = await DataHelper.replaceAsync(this.template, /{\w+}/g, async (match) => {
                return this.parts[match] !== undefined ? this.parts[match] : '';
            });
        } else if (typeof cont === 'string') {
            content = (content as CallableFunction)(this);
        }
        return `${this.begin()}\n${content}\n${this.end()}`;
    }
    /**
     * Renders the opening tag of the field container.
     * @return the rendering result.
     */
    public begin() {
        let clientOptions;
        if (this.form.enableClientScript) {
            clientOptions = this.getClientOptions();

            if (clientOptions !== undefined) this.form.attributes.push(clientOptions);
        }

        const inputId = this.getInputId();
        const attribute = Html.getAttributeName(this.attribute);
        const options = this.options;
        const cssClass = options.class !== undefined ? [options.class] : [];
        cssClass.push(`field-${inputId}`);
        if (this.model.isAttributeRequired(attribute)) cssClass.push(this.form.requiredCssClass);
        options.class = cssClass.join(' ');
        if (this.form.validationStateOn === 'container') this.addErrorClassIfNeeded(options);
        const tag = DataHelper.remove(options, 'tag', 'div');
        return Html.beginTag(tag, options);
    }
    /**
     * Renders the closing tag of the field container.
     * @return the rendering result.
     */
    public end() {
        return Html.endTag(this.options.tag !== undefined ? this.options.tag : 'div');
    }
    /**
     * Generates a label tag for [[attribute]].
     * @param label the label to use. If `null`, the label will be generated via [[Model.getAttributeLabel]].
     * If `false`, the generated field will not contain the label part.
     * Note that this will NOT be [[Html.encode|encoded]].
     * @param options the tag options in terms of name-value pairs. It will be merged with [[labelOptions]].
     * The options will be rendered as the attributes of the resulting tag. The values will be HTML-encoded
     * using [[Html.encode]]. If a value is `null`, the corresponding attribute will not be rendered.
     * @return the field object itself.
     */
    public label(label = null, options: { [key: string]: any } = {}) {
        if (label === false) {
            this.parts['{label}'] = '';
            return this;
        }
        options = { ...this.labelOptions, ...options };
        if (label !== null) options.label = label;
        if (this._skipLabelFor) options.for = null;
        this.parts['{label}'] = Html.activeLabel(this.model, this.attribute, options);
        return this;
    }
    /**
     * Generates a tag that contains the first validation error of [[attribute]].
     * Note that even if there is no validation error, this method will still return an empty error tag.
     * @param options the tag options in terms of name-value pairs. It will be merged with [[errorOptions]].
     * The options will be rendered as the attributes of the resulting tag. The values will be HTML-encoded
     * using [[Html.encode]]. If this parameter is `false`, no error tag will be rendered.
     *
     * The following options are specially handled:
     *
     * - `tag`: this specifies the tag name. If not set, `div` will be used.
     *   See also [[Html.tag]].
     *
     * If you set a custom `id` for the error element, you may need to adjust the [[selectors]] accordingly.
     * @see [[errorOptions]]
     * @return the field object itself.
     */
    public error(options: { [key: string]: any } | false = {}) {
        if (options === false) {
            this.parts['{error'] = '';
            return this;
        }
        options = { ...this.errorOptions, ...options };
        this.parts['{error}'] = Html.error(this.model, this.attribute, options);
        return this;
    }
    /**
     * Renders the hint tag.
     * @param content the hint content.
     * If `null`, the hint will be generated via [[Model.getAttributeHint]].
     * If `false`, the generated field will not contain the hint part.
     * Note that this will NOT be [[Html.encode|encoded]].
     * @param options the tag options in terms of name-value pairs. These will be rendered as
     * the attributes of the hint tag. The values will be HTML-encoded using [[Html.encode]].
     *
     * The following options are specially handled:
     *
     * - `tag`: this specifies the tag name. If not set, `div` will be used.
     *   See also [[Html.tag]].
     *
     * @return the field object itself.
     */
    public hint(content: string | null | false, options: { [key: string]: any } = {}) {
        if (content === false) {
            this.parts['{hint}'] = '';
            return this;
        }
        options = { ...this.hintOptions, options };
        if (content !== null) options.hint = content;
        this.parts['{hint}'] = Html.activeHint(this.model, this.attribute, options);
        return this;
    }
    /**
     * Renders an input tag.
     * @param type the input type (e.g. `text`, `password`)
     * @param options the tag options in terms of name-value pairs. These will be rendered as
     * the attributes of the resulting tag. The values will be HTML-encoded using [[Html.encode]].
     *
     * If you set a custom `id` for the input element, you may need to adjust the [[selectors]] accordingly.
     *
     * @return the field object itself.
     */
    public input(type: string, options: { [key: string]: any } = {}) {
        options = { ...this.inputOptions, ...options };
        if (this.form.validationStateOn === 'input') this.addErrorClassIfNeeded(options);
        this.doAddAriaAttributes(options);
        this.adjustLabelFor(options);
        this.parts['{input}'] = Html.activeInput(type, this.model, this.attribute, options);
        return this;
    }
    /**
     * Renders a text input.
     * This method will generate the `name` and `value` tag attributes automatically for the model attribute
     * unless they are explicitly specified in `options`.
     * @param options the tag options in terms of name-value pairs. These will be rendered as
     * the attributes of the resulting tag. The values will be HTML-encoded using [[Html.encode]].
     *
     * The following special options are recognized:
     *
     * - `maxlength`: int|bool, when `maxlength` is set `true` and the model attribute is validated
     *   by a string validator, the `maxlength` option will take the value of [[StringValidator.max]].
     *
     * Note that if you set a custom `id` for the input element, you may need to adjust the value of [[selectors]] accordingly.
     *
     * @return the field object itself.
     */
    public textInput(options: { [key: string]: any } = {}) {
        options = { ...this.inputOptions, ...options };
        if (this.form.validationStateOn === 'input') this.addErrorClassIfNeeded(options);
        this.doAddAriaAttributes(options);
        this.adjustLabelFor(options);
        this.parts['{input}'] = Html.activeTextInput(this.model, this.attribute, options);
        return this;
    }
    /**
     * Renders a hidden input.
     *
     * Note that this method is provided for completeness. In most cases because you do not need
     * to validate a hidden input, you should not need to use this method. Instead, you should
     * use [[Html.activeHiddenInput]].
     *
     * This method will generate the `name` and `value` tag attributes automatically for the model attribute
     * unless they are explicitly specified in `options`.
     * @param the tag options in terms of name-value pairs. These will be rendered as
     * the attributes of the resulting tag. The values will be HTML-encoded using [[Html.encode]].
     *
     * If you set a custom `id` for the input element, you may need to adjust the [[selectors]] accordingly.
     *
     * @return the field object itself.
     */
    public hiddenInput(options: { [key: string]: any } = {}) {
        options = { ...this.inputOptions, ...options };
        this.adjustLabelFor(options);
        this.parts['{input}'] = Html.activeHiddenInput(this.model, this.attribute, options);
        return this;
    }
    /**
     * Renders a password input.
     * This method will generate the `name` and `value` tag attributes automatically for the model attribute
     * unless they are explicitly specified in `options`.
     * @param options the tag options in terms of name-value pairs. These will be rendered as
     * the attributes of the resulting tag. The values will be HTML-encoded using [[Html.encode]].
     *
     * If you set a custom `id` for the input element, you may need to adjust the [[selectors]] accordingly.
     *
     * @return the field object itself.
     */
    public passwordInput(options: { [key: string]: any } = {}) {
        options = { ...this.inputOptions, ...options };
        if (this.form.validationStateOn === 'input') this.addErrorClassIfNeeded(options);
        this.doAddAriaAttributes(options);
        this.adjustLabelFor(options);
        this.parts['{input}'] = Html.activePasswordInput(this.model, this.attribute, options);
        return this;
    }
    /**
     * Renders a file input.
     * This method will generate the `name` and `value` tag attributes automatically for the model attribute
     * unless they are explicitly specified in `options`.
     * @param options the tag options in terms of name-value pairs. These will be rendered as
     * the attributes of the resulting tag. The values will be HTML-encoded using [[Html.encode]].
     *
     * If you set a custom `id` for the input element, you may need to adjust the [[selectors]] accordingly.
     *
     * @return the field object itself.
     */
    public fileInput(options: { [key: string]: any } = {}) {
        if (this.inputOptions !== { class: 'form-control' }) options = { ...this.inputOptions, ...options };
        if (this.form.options.encType === undefined) this.form.options.encType = 'multipart/form-data';
        if (this.form.validationStateOn === 'input') this.addErrorClassIfNeeded(options);
        this.doAddAriaAttributes(options);
        this.adjustLabelFor(options);
        this.parts['{input}'] = Html.activeFileInput(this.model, this.attribute, options);
        return this;
    }
    /**
     * Renders a text area.
     * The model attribute value will be used as the content in the textarea.
     * @param options the tag options in terms of name-value pairs. These will be rendered as
     * the attributes of the resulting tag. The values will be HTML-encoded using [[Html.encode]].
     *
     * If you set a custom `id` for the textarea element, you may need to adjust the [[selectors]] accordingly.
     *
     * @return the field object itself.
     */
    public textarea(options: { [key: string]: any } = {}) {
        options = { ...this.inputOptions, ...options };
        if (this.form.validationStateOn === 'input') this.addErrorClassIfNeeded(options);
        this.doAddAriaAttributes(options);
        this.adjustLabelFor(options);
        this.parts['{input}'] = Html.activeTextarea(this.model, this.attribute, options);
        return this;
    }
    /**
     * Renders a radio button.
     * This method will generate the `checked` tag attribute according to the model attribute value.
     * @param options the tag options in terms of name-value pairs. The following options are specially handled:
     *
     * - `uncheck`: string, the value associated with the uncheck state of the radio button. If not set,
     *   it will take the default value `0`. This method will render a hidden input so that if the radio button
     *   is not checked and is submitted, the value of this attribute will still be submitted to the server
     *   via the hidden input. If you do not want any hidden input, you should explicitly set this option as `null`.
     * - `label`: string, a label displayed next to the radio button. It will NOT be HTML-encoded. Therefore you can pass
     *   in HTML code such as an image tag. If this is coming from end users, you should [[Html.encode|encode]] it to prevent XSS attacks.
     *   When this option is specified, the radio button will be enclosed by a label tag. If you do not want any label, you should
     *   explicitly set this option as `null`.
     * - `labelOptions`: array, the HTML attributes for the label tag. This is only used when the `label` option is specified.
     *
     * The rest of the options will be rendered as the attributes of the resulting tag. The values will
     * be HTML-encoded using [[Html.encode]]. If a value is `null`, the corresponding attribute will not be rendered.
     *
     * If you set a custom `id` for the input element, you may need to adjust the [[selectors]] accordingly.
     *
     * @param enclosedByLabel whether to enclose the radio within the label.
     * If `true`, the method will still use [[template]] to layout the radio button and the error message
     * except that the radio is enclosed by the label tag.
     * @return the field object itself.
     */
    public radio(options: { [key: string]: any } = {}, enclosedByLabel = true) {
        if (this.form.validationStateOn === 'input') this.addErrorClassIfNeeded(options);
        this.doAddAriaAttributes(options);
        this.adjustLabelFor(options);
        if (enclosedByLabel) {
            this.parts['{input}'] = Html.activeRadio(this.model, this.attribute, options);
            this.parts['{label}'] = '';
        } else {
            if (options.label !== undefined && this.parts['{label}'] === undefined) {
                this.parts['{label}'] = options.label;
                if (options.labelOptions.length > 0) this.labelOptions = options.labelOptions;
            }
            delete options.labelOptions;
            options.label = null;
            this.parts['{input}'] = Html.activeRadio(this.model, this.attribute, options);
        }
        return this;
    }
    /**
     * Renders a checkbox.
     * This method will generate the `checked` tag attribute according to the model attribute value.
     * @param options the tag options in terms of name-value pairs. The following options are specially handled:
     *
     * - `uncheck`: string, the value associated with the uncheck state of the radio button. If not set,
     *   it will take the default value `0`. This method will render a hidden input so that if the radio button
     *   is not checked and is submitted, the value of this attribute will still be submitted to the server
     *   via the hidden input. If you do not want any hidden input, you should explicitly set this option as `null`.
     * - `label`: string, a label displayed next to the checkbox. It will NOT be HTML-encoded. Therefore you can pass
     *   in HTML code such as an image tag. If this is coming from end users, you should [[Html.encode|encode]] it to prevent XSS attacks.
     *   When this option is specified, the checkbox will be enclosed by a label tag. If you do not want any label, you should
     *   explicitly set this option as `null`.
     * - `labelOptions`: array, the HTML attributes for the label tag. This is only used when the `label` option is specified.
     *
     * The rest of the options will be rendered as the attributes of the resulting tag. The values will
     * be HTML-encoded using [[Html.encode]]. If a value is `null`, the corresponding attribute will not be rendered.
     *
     * If you set a custom `id` for the input element, you may need to adjust the [[selectors]] accordingly.
     *
     * @param enclosedByLabel whether to enclose the checkbox within the label.
     * If `true`, the method will still use [[template]] to layout the checkbox and the error message
     * except that the checkbox is enclosed by the label tag.
     * @return the field object itself.
     */
    public checkbox(options: { [key: string]: any } = {}, enclosedByLabel = true) {
        if (this.form.validationStateOn === 'input') this.addErrorClassIfNeeded(options);
        this.doAddAriaAttributes(options);
        this.adjustLabelFor(options);
        if (enclosedByLabel) {
            this.parts['{input}'] = Html.activeCheckbox(this.model, this.attribute, options);
            this.parts['{label}'] = '';
        } else {
            if (options.label !== undefined && this.parts['{label}'] === undefined) {
                this.parts['{label}'] = options.label;
                if (options.labelOptions.length > 0) this.labelOptions = options.labelOptions;
            }
            delete options.labelOptions;
            options.label = null;
            this.parts['{input}'] = Html.activeCheckbox(this.model, this.attribute, options);
        }
        return this;
    }
    /**
     * Renders a drop-down list.
     * The selection of the drop-down list is taken from the value of the model attribute.
     * @param items the option data items. The array keys are option values, and the array values
     * are the corresponding option labels. The array can also be nested (i.e. some array values are arrays too).
     * For each sub-array, an option group will be generated whose label is the key associated with the sub-array.
     * If you have a list of data models, you may convert them into the format described above using
     * [[ArrayHelper.map]].
     *
     * Note, the values and labels will be automatically HTML-encoded by this method, and the blank spaces in
     * the labels will also be HTML-encoded.
     * @param options the tag options in terms of name-value pairs.
     *
     * For the list of available options please refer to the `$options` parameter of [[Html.activeDropDownList]].
     *
     * If you set a custom `id` for the input element, you may need to adjust the [[selectors]] accordingly.
     *
     * @return the field object itself.
     */
    public dropDownList(items: [], options: { [key: string]: any } = {}) {
        options = { ...this.inputOptions, ...options };
        if (this.form.validationStateOn === 'input') this.addErrorClassIfNeeded(options);
        this.doAddAriaAttributes(options);
        this.adjustLabelFor(options);
        this.parts['{input}'] = Html.activeDropDownList(this.model, this.attribute, items, options);
        return this;
    }
    /**
     * Renders a list box.
     * The selection of the list box is taken from the value of the model attribute.
     * @param items the option data items. The array keys are option values, and the array values
     * are the corresponding option labels. The array can also be nested (i.e. some array values are arrays too).
     * For each sub-array, an option group will be generated whose label is the key associated with the sub-array.
     * If you have a list of data models, you may convert them into the format described above using
     * [[ArrayHelper.map]].
     *
     * Note, the values and labels will be automatically HTML-encoded by this method, and the blank spaces in
     * the labels will also be HTML-encoded.
     * @param options the tag options in terms of name-value pairs.
     *
     * For the list of available options please refer to the `$options` parameter of [[Html.activeListBox]].
     *
     * If you set a custom `id` for the input element, you may need to adjust the [[selectors]] accordingly.
     *
     * @return the field object itself.
     */
    public listBox(items: [], options: { [key: string]: any } = {}) {
        options = { ...this.inputOptions, ...options };
        if (this.form.validationStateOn === 'input') this.addErrorClassIfNeeded(options);
        this.doAddAriaAttributes(options);
        this.adjustLabelFor(options);
        this.parts['{input}'] = Html.activeListBox(this.model, this.attribute, items, options);
        return this;
    }
    /**
     * Renders a list of checkboxes.
     * A checkbox list allows multiple selection, like [[listBox]].
     * As a result, the corresponding submitted value is an array.
     * The selection of the checkbox list is taken from the value of the model attribute.
     * @param items the data item used to generate the checkboxes.
     * The array values are the labels, while the array keys are the corresponding checkbox values.
     * @param options options (name => config) for the checkbox list.
     * For the list of available options please refer to the `$options` parameter of [[Html.activeCheckboxList]].
     * @return the field object itself.
     */
    public checkboxList(items: [], options: { [key: string]: any } = {}) {
        if (this.form.validationStateOn === 'input') this.addErrorClassIfNeeded(options);
        this.doAddAriaAttributes(options);
        this.adjustLabelFor(options);
        this.parts['{input}'] = Html.activeCheckboxList(this.model, this.attribute, items, options);
        return this;
    }
    /**
     * Renders a list of radio buttons.
     * A radio button list is like a checkbox list, except that it only allows single selection.
     * The selection of the radio buttons is taken from the value of the model attribute.
     * @param items the data item used to generate the radio buttons.
     * The array values are the labels, while the array keys are the corresponding radio values.
     * @param options options (name => config) for the radio button list.
     * For the list of available options please refer to the `options` parameter of [[Html.activeRadioList]].
     * @return the field object itself.
     */
    public radioList(items: [], options: { [key: string]: any } = {}) {
        if (this.form.validationStateOn === 'input') this.addErrorClassIfNeeded(options);
        this.doAddAriaAttributes(options);
        this.adjustLabelFor(options);
        this.parts['{input}'] = Html.activeRadioList(this.model, this.attribute, items, options);
        return this;
    }
    /**
     * Adjusts the `for` attribute for the label based on the input options.
     * @param options the input options.
     */
    public adjustLabelFor(options: { [key: string]: any } = {}) {
        if (options.id === undefined) return;
        this._inputId = options.id;
        if (this.labelOptions.for === undefined) this.labelOptions.for = options.id;
    }
    /**
     * Returns the JS options for the field.
     * @return the JS options.
     */
    protected getClientOptions(): { [key: string]: any } {
        const attribute = Html.getAttributeName(this.attribute);
        if (!this.model.activeAttributes().includes(attribute)) return [];
        const clientValidation = this.isClientValidationEnabled();
        const ajaxValidation = this.isAjaxValidationEnabled();
        let validators = [];
        if (clientValidation) {
            const activeValidators = this.model.getActiveValidators(attribute);
            for (let validator in activeValidators) {
                let js = this.clientValidateAttribute(validator, activeValidators[validator]);
                if (js !== '') {
                    validators.push(js);
                }
            }
        }

        if (!ajaxValidation && (!clientValidation || validators.length === 0)) {
            return [];
        }

        let options = [];
        const inputID = this.getInputId();
        options['id'] = Html.getInputId(this.model, this.attribute);
        options['name'] = this.attribute;

        options['container'] =
            this.selectors['container'] !== undefined ? this.selectors['container'] : `.field-${inputID}`;
        options['input'] = this.selectors['input'] !== undefined ? this.selectors['input'] : `#${inputID}`;
        if (this.selectors['error'] !== undefined) {
            options['error'] = this.selectors['error'];
        } else if (this.errorOptions['class'] !== undefined) {
            options['error'] = `.${this.errorOptions['class'].split(/\s+/).join('.')}`;
        } else {
            options['error'] = this.errorOptions['tag'] !== undefined ? this.errorOptions['tag'] : 'span';
        }

        options['encodeError'] = this.errorOptions['encode'] === undefined || this.errorOptions['encode'];
        if (ajaxValidation) {
            options['enableAjaxValidation'] = true;
        }
        for (let name of ['validateOnChange', 'validateOnBlur', 'validateOnType', 'validationDelay']) {
            options[name] = this[name] === undefined ? this.form[name] : this[name];
        }

        if (validators.length > 0) {
            options['validate'] = `function(attribute, value, messages, deferred, $form) { ${validators.join('')} }`;
        }

        if (this.addAriaAttributes === false) {
            options['updateAriaInvalid'] = false;
        }

        // only get the options that are different from the default ones (set in activeForm.js)
        return {
            validateOnChange: true,
            validateOnBlur: true,
            validateOnType: false,
            validationDelay: 500,
            encodeError: true,
            error: '.help-block',
            updateAriaInvalid: true,
            ...options,
        };
    }
    /**
     * Returns the JavaScript needed for performing client-side validation.
     *
     * Calls [[getClientOptions]] to generate options array for client-side validation.
     *
     * You may override this method to return the JavaScript validation code if
     * the validator can support client-side validation.
     *
     * The following JavaScript variables are predefined and can be used in the validation code:
     *
     * - `attribute`: an object describing the the attribute being validated.
     * - `value`: the value being validated.
     * - `messages`: an array used to hold the validation error messages for the attribute.
     * - `deferred`: an array used to hold deferred objects for asynchronous validation
     * - `$form`: a jQuery object containing the form element
     *
     * The `attribute` object contains the following properties:
     * - `id`: a unique ID identifying the attribute (e.g. "loginform-username") in the form
     * - `name`: attribute name or expression (e.g. "[0]content" for tabular input)
     * - `container`: the jQuery selector of the container of the input field
     * - `input`: the jQuery selector of the input field under the context of the form
     * - `error`: the jQuery selector of the error tag under the context of the container
     * - `status`: status of the input field, 0: empty, not entered before, 1: validated, 2: pending validation, 3: validating
     *
     * @param validator the key of the client validator defined in [[clientValidators]]
     * @param criteria the validation criteria as defined in [[clientValidators]]
     * @return the client-side validation script. Null if the validator does not support
     * client-side validation.
     * @see [[getClientOptions]]
     * @see [[ActiveForm.enableClientValidation]]
     */
    public clientValidateAttribute(validator: string, criteria: boolean | { [key: string]: any }) {
        let js = '';
        let options: any = {};
        if (this.clientValidators[validator] !== undefined) {
            const params = ormAdapter.getClientValidationParams(criteria);

            if (Object.keys(params).length > 0) js += this.clientValidators[validator](params);
        }

        return js;
    }
    /**
     * Checks if client validation enabled for the field.
     * @return bool
     */
    protected isClientValidationEnabled(): boolean {
        return (
            this.enableClientValidation ||
            (this.enableClientValidation === undefined && this.form.enableClientValidation)
        );
    }
    /**
     * Checks if ajax validation enabled for the field.
     * @return bool
     */
    protected isAjaxValidationEnabled(): boolean {
        return this.enableAjaxValidation || (this.enableAjaxValidation === undefined && this.form.enableAjaxValidation);
    }
    /**
     * Returns the HTML `id` of the input element of this form field.
     * @return the input id.
     */
    protected getInputId(): string {
        return this._inputId ? this._inputId : Html.getInputId(this.model, this.attribute);
    }
    /**
     * Adds aria attributes to the input options.
     * @param options input options
     */
    protected doAddAriaAttributes(options: { [key: string]: any }) {
        if (this.addAriaAttributes) {
            if (options['aria-required'] === undefined && this.model.isAttributeRequired(this.attribute)) {
                options['aria-required'] = 'true';
            }
            if (options['aria-invalid'] === undefined && this.model.hasErrors(this.attribute)) {
                options['aria-invalid'] = 'true';
            }
        }
    }
    /**
     * Add role attributes to the input options
     * @param options input options
     * @param role
     */
    protected addRoleAttributes(options: { [key: string]: any }, role) {
        if (options.role === undefined) options.role = role;
    }
    /**
     * Adds validation class to the input options if needed.
     * @param options input options
     */
    protected addErrorClassIfNeeded(options: { [key: string]: any }) {
        const attributeName = Html.getAttributeName(this.attribute);
        if (this.model.hasErrors(attributeName)) {
            Html.addCssClass(options, this.form.errorCssClass);
        }
    }
}
