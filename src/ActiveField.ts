import { Component, DataHelper, Html } from '.';
import Pwoli from './Application';
export default class ActiveField extends Component {
    public form;
    public model;
    public attribute;
    public options: any = { class: 'form-group' };
    public template = "{label}\n{input}\n{hint}\n{error}";
    public inputOptions: any = { class: 'form-control' };
    public errorOptions: any = { class: 'help-block' };
    public labelOptions: any = { class: 'control-label' };
    public hintOptions: any = { class: 'hint-block' };
    public enableClientValidation;
    public enableAjaxValidation;
    public validateOnChange;
    public validateOnBlur;
    public validateOnType;
    public validationDelay;
    public selectors: any = {};
    public parts: any = {};
    public addAriaAttributes = true;
    private _inputId;
    private _skipLabelFor = false;

    public __toString() {
        try {
            return this.render();
        } catch (e) {
            throw new Error(e);
        }
    }

    public render(content = null) {
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
            // content = DataHelper.replaceAsync(this.template, /{\w+}/g, async (match) => {
            //     return this.parts[match] !== undefined ? this.parts[match] : '';
            // });
        } else if (typeof cont === 'string') {
            content = content(this);
        }
        return `${this.begin()}\n${content}\n${this.end()}`;
    }

    public begin() {
        let clientOptions;
        if (this.form.enableClientScript) {
            clientOptions = this.getClientOptions();
            if (clientOptions.length > 0)
                this.form.attributes.push(clientOptions);
        }
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
        options = { ...this.errorOptions, options };
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

    public input(type, options: any = []) {
        options = { ...this.inputOptions, ...options };
        if (this.form.validateionStateOn === 'input')
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

    protected getClientOptions() {
        const attribute = Html.getAttributeName(this.attribute);
        if (!this.model.activeAttributes().includes(attribute))
            return [];
        const clientValidation = this.isClientValidationEnabled();
        const ajaxValidation = this.isAjaxValidationEnabled();
        let validators = [];
        if (clientValidation) {
            const activeValidators = this.model.getActiveValidators(attribute);
            for (let validator in activeValidators) {
                let js = this.clientValidateAttribute(attribute, validator, activeValidators[validator]);
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
            options[name] = this[name] === null ? this.form.name : this[name];
        }

        if (validators.length > 0) {
            options['validate'] = `function (attribute, value, messages, deferred, $form) { ${validators.join('')} }`;
        }

        if (this.addAriaAttributes === false) {
            options['updateAriaInvalid'] = false;
        }

        // only get the options that are different from the default ones (set in yii.activeForm.js)
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

    public clientValidateAttribute(attribute, validator, option) {
        
    }

    protected isClientValidationEnabled() {
        return this.enableClientValidation || this.enableClientValidation === null && this.form.enableClientValidation;
    }

    protected isAjaxValidationEnabled() {
        return this.enableAjaxValidation || this.enableAjaxValidation === null && this.form.enableAjaxValidation;
    }

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
