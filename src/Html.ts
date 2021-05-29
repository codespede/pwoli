import Model from './Model';
import Pwoli from './Application';
import Component from './Component';
import DataHelper from './DataHelper';
import DataProvider from './DataProvider';

export default class Html extends Component {
    public static attributeRegex = /(^|.*\])([\w\.\+]+)(\[.*|)/u;
    public static voidElements = [
        'area',
        'base',
        'br',
        'col',
        'command',
        'embed',
        'hr',
        'img',
        'input',
        'keygen',
        'link',
        'meta',
        'param',
        'source',
        'track',
        'wbr',
    ];

    public static attributeOrder = [
        'type',
        'id',
        'class',
        'name',
        'value',

        'href',
        'src',
        'srcset',
        'form',
        'action',
        'method',

        'selected',
        'checked',
        'readonly',
        'disabled',
        'multiple',

        'size',
        'maxlength',
        'width',
        'height',
        'rows',
        'cols',

        'alt',
        'title',
        'rel',
        'media',
    ];

    public static dataAttributes = ['aria', 'data', 'data-ng', 'ng'];
    
    public static tag(name, content = '', options: any = []) {
        if (name === undefined || !name) return content;
        let optionsHtml = '';
        for (const option in options) optionsHtml += ` ${option}="${options[option]}"`;
        const html = `<${name}${optionsHtml}>`;
        return this.voidElements.includes(name) ? html : `${html}${content}</${name}>`;
    }

    public static addCssClass(options, cssClass) {
        if (options.class !== undefined) {
        if (Array.isArray(options.cssClass)) options.class = this.mergeCssClasses(options.class, [cssClass]);
        else {
            const classes = options.class.split(/\s+/);
            options.class = this.mergeCssClasses(classes, [cssClass]).join(' ');
        }
        } else options.class = cssClass;
    }

    private static mergeCssClasses(existingClasses: string[], additionalClasses: string[]) {
        for (const cssClass of additionalClasses) if (!existingClasses.includes(cssClass)) existingClasses.push(cssClass);
        return [...new Set(existingClasses)];
    }

    public static a(text, url = null, options: any = {}) {
        if (url !== null) options.href = url;
        return this.tag('a', text, options);
    }

    public static ul(items, options: any = {}) {
        const tag = DataHelper.remove(options, 'tag', 'ul');
        const encode = DataHelper.remove(options, 'encode', true);
        const formatter = DataHelper.remove(options, 'formatter', 'item');
        const separator = DataHelper.remove(options, 'separator', '\n');
        const itemOptions = DataHelper.remove(options, 'itemOptions', []);

        if (items.length === 0) return this.tag(tag, '', options);

        const results = [];
        for (const index in items) {
        if (formatter !== null) results.push(formatter(items[index], index));
        else results.push(this.tag('li', encode ? this.encode(items[index]) : items[index], itemOptions));
        }
        return this.tag(tag, `${separator}${results.join(separator)}${separator}`, options);
    }

    public static encode(content) {
        return this.escape(content);
    }

    public static escape(html) {
        html = html === null? '' : html;
        const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
        };
        return html.replace(/[&<>"']/g, (m) => {
            return map[m];
        });
    }

    public static jsFile(url, options) {
        options.src = url;
        options.type = 'text/javascript';
        return this.tag('script', '', options);
    }

    public static cssFile(url, options) {
        if (options.rel === undefined) options.rel = 'stylesheet';
        options.href = url;
        return this.tag('link', '', options);
    }

    public static activeTextInput(model, attribute, options = {}) {
        return this.activeInput('text', model, attribute, options);
    }

    public static activeInput(type, model, attribute, options: any = {}) {
        const name = options.name !== undefined ? options.name : this.getInputName(model, attribute);
        const value = options.value !== undefined ? options.value : this.getAttributeValue(model, attribute);
        if (options.id === undefined) options.id = this.getInputId(model, attribute);
        this.setActivePlaceholder(model, attribute, options);
        return this.input(type, name, value, options);
    }

    public static input(type, name = null, value = null, options: any = {}) {
        if (options.type === undefined) options.type = type;
        options.name = name;
        options.value = value === undefined ? null : value.toString();
        return this.tag('input', '', options);
    }

    public static getInputName(model, attribute) {
        const formName = model.getFormName();
        
        const matches = attribute.match(this.attributeRegex);
        if (matches.length === 0) throw new Error('Attribute name must contain word characters only.');
        const prefix = matches[1];
        attribute = matches[2];
        const suffix = matches[3];
        if (formName === '' && prefix === '') return attribute + suffix;
        else if (formName !== '') return `${formName + prefix}[${attribute}]${suffix}`;
        throw new Error(`${model.constructor.name}.formName() cannot be empty for tabular inputs.`);
    }

    public static getInputId(model, attribute) {
        const name = this.getInputName(model, attribute).toLowerCase();
        const map = {
        '[]': '',
        '][': '-',
        '[': '-',
        ']': '',
        ' ': '-',
        '.': '-',
        };
        return name.replace(/\[\]|\]\[|\[|\]|\s|\./gi, (matched) => {
        return map[matched];
        });
    }

    public static getAttributeValue(model, attribute) {
        const matches = attribute.match(this.attributeRegex);
        if (matches.length === 0) throw new Error('Attribute name must contain word characters only.');
        attribute = matches[2];
        let value = model[attribute];
        
        if (matches[3] !== '') {
        for (const id of matches[3].trim().split(']['))
            if (Array.isArray(value) && value[id] !== undefined) value = value[id];
            else return null;
        }
        return value === null ? '' : value;
    }

    public static setActivePlaceholder(model, attribute, options: any = {}) {
        if (options.placeholder !== undefined && options.placeholder === true)
        options.placeholder = model.getAttributeLabel(attribute);
    }

    public static errorSummary(model, options) {
        const header = options.header !== undefined ? options.header : `<p>Please fix the following errors:</p>`;
        const footer = DataHelper.remove(options, 'footer', '');
        const encode = DataHelper.remove(options, 'encode', '');
        const showAllErrors = DataHelper.remove(options, 'showAllErrors', '');
        delete options.header;
    }

    public static script(content, options: any = {}) {
        return this.tag('script', content, options);
    }

    public static radio(name, checked = false, options: any = {}) {
        return this.booleanInput('radio', name, checked, options);
    }

    public static checkbox(name, checked = false, options: any = {}) {
        return this.booleanInput('checkbox', name, checked, options);
    }

    public static hiddenInput(name, value = null, options: any = {}) {
        return this.input('hidden', name, value, options);
    }

    public static label(content, forValue = null, options: any = {}){
        options.for = forValue;
        return this.tag('label', content, options);
    }

    public static booleanInput(type, name, checked = false, options: any = {}) {
        if (options.checked === undefined)
        options.checked = checked;
        const value = options.value !== undefined ? options.value : '1';
        let hidden;
        if (options.uncheck !== undefined) {
        const hiddenOptions: any = {};
        if (options.form !== undefined)
            hiddenOptions.form = options.form;
        if (options.disabled !== undefined)
            hiddenOptions.disabled = options.disabled;
        hidden = this.hiddenInput(name, options.uncheck, hiddenOptions);
        delete options.uncheck;
        } else
        hidden = '';
        if (options.label !== undefined) {
        const label = options.label;
        const labelOptions = options.labelOptions !== undefined ? options.labelOptions : {};
        delete options.label, options.labelOptions;
        const content = this.label(`${this.input(type, name, value, options)} ${label}`, null, labelOptions);
        return hidden + content;
        }
        if (options.checked === false)
        delete options.checked;
        return hidden + this.input(type, name, value, options);
    }

    public static beginForm(action = '', method = 'post', options: any = {}){
        let hiddenInputs = [];
        const request = Pwoli.request;
        method = method.toLowerCase();
        if (['get', 'post'].includes(method)) {
            // simulate PUT, DELETE, etc. via POST
            hiddenInputs.push(this.hiddenInput('_method', method));
            method = 'post';
        }
        options['action'] = action;
        options['method'] = method;
        let form = this.beginTag('form', options);
        if (hiddenInputs.length > 0)
            form += "\n" + hiddenInputs.join("\n");
        return form;
    }


    public static endForm(){
        return '</form>';
    }

    public static beginTag(name, options: any = {}) {
        if (name === null || name === false)
        return '';
        return `<${name}${this.renderTagAttributes(options)}>`
    }

    public static endTag(name){
        if (name === null || name === false) {
            return '';
        }
        return `</${name}>`;
    }

    public static getAttributeName(attribute) {
        const matches = attribute.match(this.attributeRegex);
        if (matches.length === 0) throw new Error('Attribute name must contain word characters only.');
        return matches[2];
    }

    public static renderTagAttributes(attributes) {
        if (attributes.length > 1) {
            let sorted = {};
            for(let name of this.attributeOrder) {
                if (attributes[name] !== undefined) {
                    sorted[name] = attributes[name];
                }
            }
            attributes = { ...sorted, ...attributes };
        }

        let html = '';
        for (let name in attributes) {
            let value = attributes[name];
            if (typeof value === 'boolean') {
                if (value) {
                    html += ` {name}`;
                }
            } else if (Array.isArray(value)) {
                if (this.dataAttributes.includes(name)) {
                    for (let n in value) {
                        let v = value[n];
                        if (Array.isArray(v)) {
                            html += ` ${name}-${n}='${JSON.stringify(v)}'`;
                        } else if (typeof v === 'boolean') {
                            if (v) {
                                html += ` ${name}-${n}`;
                            }
                        } else if (v !== null) {
                            html += ` ${name}-${n}="${this.encode(v)}"`;
                        }
                    }
                } else if (name === 'class') {
                    if (value.length === 0) {
                        continue;
                    }
                    html += ` ${name}="${this.encode(value.join(' '))}"`;
                } else if (name === 'style') {
                    if (value.length === 0) {
                        continue;
                    }
                    html += ` ${name}="${this.encode(this.cssStyleFromObject(value))}"`;
                } else {
                    html += ` ${name}='${JSON.stringify(value)}'`;
                }
            } else if (value !== null) {
                html += ` ${name}="${this.encode(value)}"`;
            }
        }

        return html;
    }
    
    public static cssStyleFromObject(style) {
        let result = '';
        for(let name in style) {
            result += `name: ${style[name]}; `;
        }
        // return null if empty to avoid rendering the "style" attribute
        return result === '' ? null : result.trimRight();
    }

    public static activeLabel(model, attribute, options: any = {}){
        let forValue = DataHelper.remove(options, 'for', this.getInputId(model, attribute));
        attribute = this.getAttributeName(attribute);
        let label = DataHelper.remove(options, 'label', this.encode(model.getAttributeLabel(attribute)));
        return this.label(label, forValue, options);
    }

    public static error(model: Model, attribute, options: any = {}){
        attribute = this.getAttributeName(attribute);
        let errorSource = DataHelper.remove(options, 'errorSource');
        let error;
        if (errorSource !== null) {
            error = errorSource(model, attribute);
        } else {
            error = model.getFirstError(attribute);
        }
        
        let tag = DataHelper.remove(options, 'tag', 'div');
        let encode = DataHelper.remove(options, 'encode', true);
        return Html.tag(tag, encode ? Html.encode(error) : error, options);
    }

    public static textarea(name, value = '', options: any = {}){
        options.name = name;
        return this.tag('textarea', Html.encode(value), options);
    }

    public static activeHint(model, attribute, options: any = {}){
        attribute = this.getAttributeName(attribute);
        let hint = (options['hint'] !== undefined) ? options['hint'] : model.getAttributeHint(attribute);
        if (hint.length === 0) {
            return '';
        }
        let tag = DataHelper.remove(options, 'tag', 'div');
        delete options['hint'];
        return this.tag(tag, hint, options);
    }

    public static activeHiddenInput(model, attribute, options: any = {}){
        return this.activeInput('hidden', model, attribute, options);
    }

    public static activePasswordInput(model, attribute, options: any = {}){
        return this.activeInput('password', model, attribute, options);
    }

    public static activeFileInput(model, attribute, options: any = {})
    {
        let hiddenOptions: any = { id: null, value: '' };
        if (options.name !== undefined) {
            hiddenOptions.name = options.name;
        }
        // make sure disabled input is not sending any value
        if (options['disabled'].length > 0) {
            hiddenOptions['disabled'] = options['disabled'];
        }
        hiddenOptions = { ...hiddenOptions, ...DataHelper.remove(options, 'hiddenOptions', {})};
        // Add a hidden field so that if a model only has a file field, we can
        // still use isset(_POST[modelClass]) to detect if the input is submitted.
        // The hidden input will be assigned its own set of html options via `hiddenOptions`.
        // This provides the possibility to interact with the hidden field via client script.
        // Note: For file-field-only model with `disabled` option set to `true` input submitting detection won't work.

        return this.activeHiddenInput(model, attribute, hiddenOptions)
            + this.activeInput('file', model, attribute, options);
    }

    public static activeTextarea(model, attribute, options: any = {})
    {
        let name = (options['name'] !== undefined) ? options['name'] : this.getInputName(model, attribute);
        let value;
        if ((options['value'])) {
            value = options['value'];
            delete options['value'];
        } else {
            value = this.getAttributeValue(model, attribute);
        }
        if (options.id === undefined)
            options.id = this.getInputId(model, attribute);
        this.setActivePlaceholder(model, attribute, options);
        return this.textarea(name, value, options);
    }

    public static activeRadio(model, attribute, options: any = {})
    {
        return this.activeBooleanInput('radio', model, attribute, options);
    }

    public static activeCheckbox(model, attribute, options: any = {})
    {
        return this.activeBooleanInput('checkbox', model, attribute, options);
    }

    protected static activeBooleanInput(type, model, attribute, options: any = {})
    {
        let name = options['name'] !== undefined ? options.name : this.getInputName(model, attribute);
        let value = this.getAttributeValue(model, attribute);

        if (options.value === undefined) {
            options.value = '1';
        }
        if (options.uncheck === undefined) {
            options.uncheck = '0';
        } else if (options.uncheck === false) {
            delete options.uncheck;
        }
        if (options.label === undefined) {
            options.label = this.encode(model.getAttributeLabel(this.getAttributeName(attribute)));
        } else if (options.label === false) {
            delete options.label;
        }

        let checked = value === `{${options.value}}`;

        if (options.id === undefined) {
            options.id = this.getInputId(model, attribute);
        }

        return this[type](name, checked, options);
    }

    public static activeDropDownList(model, attribute, items, options: any = {})
    {
        if (options.multiple.length === 0) {
            return this.activeListInput('dropDownList', model, attribute, items, options);
        }

        return this.activeListBox(model, attribute, items, options);
    }

    public static activeListBox(model, attribute, items, options: any = {})
    {
        return this.activeListInput('listBox', model, attribute, items, options);
    }

    public static activeCheckboxList(model, attribute, items, options: any = {})
    {
        return this.activeListInput('checkboxList', model, attribute, items, options);
    }

    public static activeRadioList(model, attribute, items, options: any = {})
    {
        return this.activeListInput('radioList', model, attribute, items, options);
    }

    protected static activeListInput(type, model, attribute, items, options: any = {})
    {
        let name = DataHelper.remove(options, 'name', this.getInputName(model, attribute));
        let selection = DataHelper.remove(options, 'value', this.getAttributeValue(model, attribute));
        if (options.unselect === undefined) {
            options.unselect = '';
        }
        if (options.id === undefined) {
            options.id = this.getInputId(model, attribute);
        }

        return this[type](name, selection, items, options);
    }

}
