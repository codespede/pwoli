import Pwoli from '../base/Application';
import Component from '../base/Component';
import ActiveForm from './ActiveForm';
import Model from '../base/Model';
import DataHelper from '../helpers/DataHelper';
import Html from '../helpers/Html';
const ormAdapter = Pwoli.getORMAdapter();
export default class ActiveField extends Component {
    public form: ActiveForm;
    public model: Model;
    public attribute: string;
    public options: { [key: string]: any } = { class: 'form-group' };
    public template = "{label}\n{input}\n{hint}\n{error}";
    public inputOptions: { [key: string]: any } = { class: 'form-control' };
    public errorOptions: { [key: string]: any } = { class: 'help-block' };
    public labelOptions: { [key: string]: any } = { class: 'control-label' };
    public hintOptions: { [key: string]: any } = { class: 'hint-block' };
    public enableClientValidation: boolean;
    public enableAjaxValidation: boolean;
    public validateOnChange: boolean;
    public validateOnBlur: boolean;
    public validateOnType: boolean;
    public validationDelay: number;
    public selectors: { [key: string]: string } = {};
    public parts: { [key: string]: string } = {};
    public addAriaAttributes = true;
    private _inputId: string;
    private _skipLabelFor = false;
    private clientValidators: { [key: string]: ((params: { [key: string]: any }) => string) } = {
        regex: (params) => {
            params.options = {
                message: `The value entered is invalid.`,
                pattern: params.criteria.source,
                ...params.options
            };
            return `pwoli.validation.regularExpression(value, messages, ${JSON.stringify(params.options)});`;
        },
        regexInverse: (params) => {
            //console.log('not-params', params);
            params.options = {
                message: `The value entered is invalid.`,
                pattern: params.criteria.source,
                not: true,
                ...params.options
            };
            //console.log('not-params-after', params.options);
            return `pwoli.validation.regularExpression(value, messages, ${JSON.stringify(params.options)});`;
        },
        required: (params) => {
            params.options = { message: `This field cannot be blank.`, ...params.options };
            return `pwoli.validation.required(value, messages, ${JSON.stringify(params.options)});`;
        },
        email: (params) => {
            params.options = {
                pattern: '^[a-zA-Z0-9!#$%&\'*+\\/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&\'*+\\/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$',
                fullPattern: '^[^@]*<[a-zA-Z0-9!#$%&\'*+\\/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&\'*+\\/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?>$',
                message: `Entered value should be an Email`,
                ...params.options,
            };
            return `pwoli.validation.email(value, messages, ${JSON.stringify(params.options)});`;
        },
    };

    public constructor(config) {
        super(config);
        Object.assign(this, config);
    }

    public async __toString() {
        return await this.render();
    }

    public async render(content = null) {
        const cont = content;
        if (content === null) {
            if (this.parts['{input}'] === undefined)
                this.textInput();
            if (this.parts['{label}'] === undefined)
                this.label();
            if (this.parts['{error}'] === undefined)
                this.error();
            if (this.parts['{hint}'] === undefined)
                this.hint(null);
            content = await DataHelper.replaceAsync(this.template, /{\w+}/g, async (match) => {
                return this.parts[match] !== undefined ? this.parts[match] : '';
            });
        } else if (typeof cont === 'string') {
            content = content(this);
        }
        return `${this.begin()}\n${content}\n${this.end()}`;
    }

    public begin() {
        let clientOptions;
        if (this.form.enableClientScript) {
            clientOptions = this.getClientOptions();
            //console.log('af-begin', clientOptions, this.model.activeAttributes());
            if (clientOptions !== undefined)
                this.form.attributes.push(clientOptions);
        }
        //console.log('af-begin', this.form.attributes);
        const inputId = this.getInputId();
        const attribute = Html.getAttributeName(this.attribute);
        const options = this.options;
        const cssClass = options.class !== undefined ? [options.class] : [];
        cssClass.push(`field-${inputId}`);
        if (this.model.isAttributeRequired(attribute))
            cssClass.push(this.form.requiredCssClass);
        options.class = cssClass.join(' ');
        if (this.form.validationStateOn === 'container')
            this.addErrorClassIfNeeded(options);
        const tag = DataHelper.remove(options, 'tag', 'div');
        return Html.beginTag(tag, options);
    }

    public end() {
        return Html.endTag(this.options.tag !== undefined ? this.options.tag : 'div');
    }

    public label(label = null, options: any = {}) {
        if (label === false) {
            this.parts['{label}'] = '';
            return this;
        }
        options = { ...this.labelOptions, ...options };
        if (label !== null)
            options.label = label;
        if (this._skipLabelFor)
            options.for = null;
        this.parts['{label}'] = Html.activeLabel(this.model, this.attribute, options);
        return this;
    }

    public error(options: any = {}) {
        if (options === false) {
            this.parts['{error'] = '';
            return this;
        }
        options = { ...this.errorOptions, ...options };
        this.parts['{error}'] = Html.error(this.model, this.attribute, options);
        return this;
    }

    public hint(content, options: any = {}) {
        if (content === false) {
            this.parts['{hint}'] = '';
            return this;
        }
        options = { ...this.hintOptions, options };
        if (content !== null)
            options.hint = content;
        this.parts['{hint}'] = Html.activeHint(this.model, this.attribute, options);
        return this;
    }

    public input(type, options: any = {}) {
        options = { ...this.inputOptions, ...options };
        if (this.form.validationStateOn === 'input')
            this.addErrorClassIfNeeded(options);
        this.doAddAriaAttributes(options);
        this.adjustLabelFor(options);
        this.parts['{input}'] = Html.activeInput(type, this.model, this.attribute, options);
        return this;
    }

    public textInput(options: any = {}) {
        options = { ...this.inputOptions, ...options };
        if (this.form.validationStateOn === 'input')
            this.addErrorClassIfNeeded(options);
        this.doAddAriaAttributes(options);
        this.adjustLabelFor(options);
        this.parts['{input}'] = Html.activeTextInput(this.model, this.attribute, options);
        return this;
    }

    public hiddenInput(options: any = {}) {
        options = { ...this.inputOptions, ...options };
        this.adjustLabelFor(options);
        this.parts['{input}'] = Html.activeHiddenInput(this.model, this.attribute, options);
        return this;
    }

    public passwordInput(options: any = {}) {
        options = { ...this.inputOptions, ...options };
        if (this.form.validationStateOn === 'input')
            this.addErrorClassIfNeeded(options);
        this.doAddAriaAttributes(options);
        this.adjustLabelFor(options);
        this.parts['{input}'] = Html.activePasswordInput(this.model, this.attribute, options);
        return this;
    }

    public fileInput(options: any = {}) {
        if (this.inputOptions !== { class: 'form-control' })
            options = { ...this.inputOptions, ...options };
        if (this.form.options.encType === undefined)
            this.form.options.encType = 'multipart/form-data';
        if (this.form.validationStateOn === 'input')
            this.addErrorClassIfNeeded(options);
        this.doAddAriaAttributes(options);
        this.adjustLabelFor(options);
        this.parts['{input}'] = Html.activeFileInput(this.model, this.attribute, options);
        return this;
    }

    public textarea(options: any = {}) {
        options = { ...this.inputOptions, ...options };
        if (this.form.validationStateOn === 'input')
            this.addErrorClassIfNeeded(options);
        this.doAddAriaAttributes(options);
        this.adjustLabelFor(options);
        this.parts['{input}'] = Html.activeTextarea(this.model, this.attribute, options);
        return this;
    }

    public radio(options: any = {}, enclosedByLabel = true) {
        if (this.form.validationStateOn === 'input')
            this.addErrorClassIfNeeded(options);
        this.doAddAriaAttributes(options);
        this.adjustLabelFor(options);
        if (enclosedByLabel) {
            this.parts['{input}'] = Html.activeRadio(this.model, this.attribute, options);
            this.parts['{label}'] = '';
        } else {
            if (options.label !== undefined && this.parts['{label}'] === undefined) {
                this.parts['{label}'] = options.label;
                if (options.labelOptions.length > 0)
                    this.labelOptions = options.labelOptions;
            }
            delete options.labelOptions;
            options.label = null;
            this.parts['{input}'] = Html.activeRadio(this.model, this.attribute, options);
        }
        return this;
    }

    public checkbox(options: any = {}, enclosedByLabel = true) {
        if (this.form.validationStateOn === 'input')
            this.addErrorClassIfNeeded(options);
        this.doAddAriaAttributes(options);
        this.adjustLabelFor(options);
        if (enclosedByLabel) {
            this.parts['{input}'] = Html.activeCheckbox(this.model, this.attribute, options);
            this.parts['{label}'] = '';
        } else {
            if (options.label !== undefined && this.parts['{label}'] === undefined) {
                this.parts['{label}'] = options.label;
                if (options.labelOptions.length > 0)
                    this.labelOptions = options.labelOptions;
            }
            delete options.labelOptions;
            options.label = null;
            this.parts['{input}'] = Html.activeCheckbox(this.model, this.attribute, options);
        }
        return this;
    }

    public dropDownList(items, options: any = {}) {
        options = { ...this.inputOptions, ...options };
        if (this.form.validationStateOn === 'input')
            this.addErrorClassIfNeeded(options);
        this.doAddAriaAttributes(options);
        this.adjustLabelFor(options);
        this.parts['{input}'] = Html.activeDropDownList(this.model, this.attribute, options);
        return this;
    }

    public listBox(items, options: any = {}) {
        options = { ...this.inputOptions, ...options };
        if (this.form.validationStateOn === 'input')
            this.addErrorClassIfNeeded(options);
        this.doAddAriaAttributes(options);
        this.adjustLabelFor(options);
        this.parts['{input}'] = Html.activeListBox(this.model, this.attribute, options);
        return this;
    }

    public checkboxList(items, options: any = {}) {
        if (this.form.validationStateOn === 'input')
            this.addErrorClassIfNeeded(options);
        this.doAddAriaAttributes(options);
        this.adjustLabelFor(options);
        this.parts['{input}'] = Html.activeCheckboxList(this.model, this.attribute, options);
        return this;
    }

    public radioList(items, options: any = {}) {
        if (this.form.validationStateOn === 'input')
            this.addErrorClassIfNeeded(options);
        this.doAddAriaAttributes(options);
        this.adjustLabelFor(options);
        this.parts['{input}'] = Html.activeRadioList(this.model, this.attribute, options);
        return this;
    }

    public adjustLabelFor(options) {
        if (options.id === undefined)
            return;
        this._inputId = options.id
        if (this.labelOptions.for === undefined)
            this.labelOptions.for = options.id;
    }

    protected getClientOptions(): any {
        const attribute = Html.getAttributeName(this.attribute);
        if (!this.model.activeAttributes().includes(attribute))
            return [];
        const clientValidation = this.isClientValidationEnabled();
        const ajaxValidation = this.isAjaxValidationEnabled();
        let validators = [];
        if (clientValidation) {
            const activeValidators = this.model.getActiveValidators(attribute);
            for (let validator in activeValidators) {
                let js = this.clientValidateAttribute(this.model, attribute, validator, activeValidators[validator]);
                if (js !== '') {
                    validators.push(js);
                }
            }
            //console.log('af-gco-av', activeValidators, validators);
        }

        if (!ajaxValidation && (!clientValidation || validators.length === 0)) {
            return [];
        }

        let options = [];
        ////console.log('af-gco', validators);
        const inputID = this.getInputId();
        options['id'] = Html.getInputId(this.model, this.attribute);
        options['name'] = this.attribute;

        options['container'] = (this.selectors['container'] !== undefined) ? this.selectors['container'] : `.field-${inputID}`;
        options['input'] = (this.selectors['input'] !== undefined) ? this.selectors['input'] : `#${inputID}`;
        if ((this.selectors['error'] !== undefined)) {
            options['error'] = this.selectors['error'];
        } else if ((this.errorOptions['class'] !== undefined)) {
            options['error'] = `.${this.errorOptions['class'].split(/\s+/).join('.')}`;
        } else {
            options['error'] = (this.errorOptions['tag'] !== undefined) ? this.errorOptions['tag'] : 'span';
        }

        options['encodeError'] = (this.errorOptions['encode'] === undefined) || this.errorOptions['encode'];
        if (ajaxValidation) {
            options['enableAjaxValidation'] = true;
        }
        for(let name of ['validateOnChange', 'validateOnBlur', 'validateOnType', 'validationDelay']) {
            options[name] = this[name] === undefined ? this.form[name] : this[name];
        }

        if (validators.length > 0) {
            options['validate'] = `function(attribute, value, messages, deferred, $form) { ${validators.join('')} }`;
        }

        if (this.addAriaAttributes === false) {
            options['updateAriaInvalid'] = false;
        }
        //console.log('af-gco', options);
        // only get the options that are different from the default ones (set in activeForm.js)
        return {
            'validateOnChange': true,
            'validateOnBlur': true,
            'validateOnType': false,
            'validationDelay': 500,
            'encodeError': true,
            'error': '.help-block',
            'updateAriaInvalid': true,
            ...options
        };
    }

    public clientValidateAttribute(model, attribute, validator, criteria) {
        let js = '';
        let options: any = {};
        if (this.clientValidators[validator] !== undefined) {
            const params = ormAdapter.getClientValidationParams(criteria);
            //console.log('cva', params);
            if(Object.keys(params).length > 0)
                js += this.clientValidators[validator](params);
        }
        //console.log('cva-js', js, validator, criteria)
        return js;
    }

    protected isClientValidationEnabled() {
        return this.enableClientValidation || this.enableClientValidation === undefined && this.form.enableClientValidation;
    }

    protected isAjaxValidationEnabled() {
        return this.enableAjaxValidation || this.enableAjaxValidation === undefined && this.form.enableAjaxValidation;
    }undefined

    protected getInputId() {
        return this._inputId ? this._inputId : Html.getInputId(this.model, this.attribute);
    }

    protected doAddAriaAttributes(options) {
        if (this.addAriaAttributes) {
            if ((options['aria-required'] === undefined) && this.model.isAttributeRequired(this.attribute)) {
                options['aria-required'] = 'true';
            }
            if ((options['aria-invalid'] === undefined) && this.model.hasErrors(this.attribute)) {
                options['aria-invalid'] = 'true';
            }
        }
    }

    protected addRoleAttributes(options, role) {
        if (options.role === undefined)
            options.role = role;
    }

    protected addErrorClassIfNeeded(options) {
        const attributeName = Html.getAttributeName(this.attribute);
        if (this.model.hasErrors(attributeName)) {
            Html.addCssClass(options, this.form.errorCssClass);
        }
    }

}
