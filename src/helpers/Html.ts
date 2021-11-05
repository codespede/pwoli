import Model from '../base/Model';
import Pwoli from '../base/Application';
import Component from '../base/Component';
import DataHelper from './DataHelper';
import DataProvider from '../data//DataProvider';
/**
 * BaseHtml provides concrete implementation for [[Html]].
 *
 * Do not use BaseHtml. Use [[Html]] instead.
 */
export default class Html extends Component {
    /**
     * Regular expression used for attribute name validation.
     */
    public static attributeRegex = /(^|.*\])([\w\.\+]+)(\[.*|)/u;
    /**
     * List of void elements {elementname: 1}
     * @see http://www.w3.org/TR/html-markup/syntax.html#void-element
     */
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
    /**
     * The preferred order of attributes in a tag. This mainly affects the order of the attributes
     * that are rendered by [[renderTagAttributes]].
     */
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
    /**
     * List of tag attributes that should be specially handled when their values are of array type.
     * In particular, if the value of the `data` attribute is `{name: 'xyz', age: 13}`, two attributes
     * will be generated instead of one: `data-name="xyz" data-age="13"`.
     */
    public static dataAttributes = ['aria', 'data', 'data-ng', 'ng'];
    /**
     * Generates a complete HTML tag.
     * @param name the tag name. If name is `null` or `false`, the corresponding content will be rendered without any tag.
     * @param content the content to be enclosed between the start and end tags. It will not be HTML-encoded.
     * If this is coming from end users, you should consider [[encode]] it to prevent XSS attacks.
     * @param options the HTML tag attributes (HTML options) in terms of name-value pairs.
     * These will be rendered as the attributes of the resulting tag. The values will be HTML-encoded using [[encode]].
     * If a value is null, the corresponding attribute will not be rendered.
     *
     * For example when using `{class: 'my-class', target: '_blank', value: null}` it will result in the
     * html attributes rendered like this: `class="my-class" target="_blank"`.
     *
     * See [[renderTagAttributes]] for details on how attributes are being rendered.
     *
     * @return the generated HTML tag
     * @see [[beginTag]]
     * @see [[endTag]]
     */
    public static tag(name, content = '', options: any = []) {
        if (name === undefined || !name) return content;
        let optionsHtml = '';
        for (const option in options) optionsHtml += ` ${option}="${options[option]}"`;
        const html = `<${name}${optionsHtml}>`;
        return this.voidElements.includes(name) ? html : `${html}${content}</${name}>`;
    }
    /**
     * Adds a CSS class (or several classes) to the specified options.
     *
     * If the CSS class is already in the options, it will not be added again.
     * If class specification at given options is an array, and some class placed there with the named (string) key,
     * overriding of such key will have no effect. For example:
     *
     * ```js
     * let options = {class: {persistent: 'initial'}};
     * Html.addCssClass(options, {persistent: 'override'});

     * ```
     *
     * @param options the options to be modified.
     * @param class the CSS class(es) to be added
     * @see [[mergeCssClasses]]
     * @see [[removeCssClass]]
     */
    public static addCssClass(options, cssClass) {
        if (options.class !== undefined) {
            if (Array.isArray(options.cssClass)) options.class = this.mergeCssClasses(options.class, [cssClass]);
            else {
                const classes = options.class.split(/\s+/);
                options.class = this.mergeCssClasses(classes, [cssClass]).join(' ');
            }
        } else options.class = cssClass;
    }
    /**
     * Merges already existing CSS classes with new one.
     * This method provides the priority for named existing classes over additional.
     * @param existingClasses already existing CSS classes.
     * @param additionalClasses CSS classes to be added.
     * @return merge result.
     * @see [[addCssClass]]
     */
    private static mergeCssClasses(existingClasses: string[], additionalClasses: string[]) {
        for (const cssClass of additionalClasses)
            if (!existingClasses.includes(cssClass)) existingClasses.push(cssClass);
        return [...new Set(existingClasses)];
    }
    /**
     * Generates a hyperlink tag.
     * @param text link body. It will NOT be HTML-encoded. Therefore you can pass in HTML code
     * such as an image tag. If this is coming from end users, you should consider [[encode]]
     * it to prevent XSS attacks.
     * @param url the URL for the hyperlink tag.
     * and will be used for the "href" attribute of the tag. If this parameter is null, the "href" attribute
     * will not be generated.
     *
     * @param options the tag options in terms of name-value pairs. These will be rendered as
     * the attributes of the resulting tag. The values will be HTML-encoded using [[encode]].
     * If a value is null, the corresponding attribute will not be rendered.
     * See [[renderTagAttributes]] for details on how attributes are being rendered.
     * @return the generated hyperlink
     */
    public static a(text, url = null, options: any = {}) {
        if (url !== null) options.href = url;
        return this.tag('a', text, options);
    }
    /**
     * Generates an unordered list.
     * @param Traversable items the items for generating the list. Each item generates a single list item.
     * Note that items will be automatically HTML encoded if `options['encode']` is not set or true.
     * @param options {name: 'config'} for the radio button list. The following options are supported:
     *
     * - encode: boolean, whether to HTML-encode the items. Defaults to true.
     *   This option is ignored if the `item` option is specified.
     * - separator: string, the HTML code that separates items. Defaults to a simple newline (`"\n"`).
     * - itemOptions: array, the HTML attributes for the `li` tags. This option is ignored if the `item` option is specified.
     * - item: callable, a callback that is used to generate each individual list item.
     *   The signature of this callback must be:
     *
     *   ```js
     *   function (item, index)
     *   ```
     *
     *   where index is the array key corresponding to `item` in `items`. The callback should return
     *   the whole list item tag.
     *
     * See [[renderTagAttributes]] for details on how attributes are being rendered.
     *
     * @return the generated unordered list. An empty list tag will be returned if `items` is empty.
     */
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
    /**
     * Encodes special characters into HTML entities.
     * @param content the content to be encoded
     * @param doubleEncode whether to encode HTML entities in `content`. If false,
     * HTML entities in `content` will not be further encoded.
     * @return the encoded content
     * @see [[decode]]
     * @see https://www.php.net/manual/en/function.htmlspecialchars.php
     */
    public static encode(content) {
        return this.escape(content);
    }

    public static escape(html) {
        html = html === null ? '' : html;
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
    /**
     * Generates a script tag that refers to an external JavaScript file.
     * @param url the URL of the external JavaScript file.
     * @param options the tag options in terms of name-value pairs. The following option is specially handled:
     *
     * - condition: specifies the conditional comments for IE, e.g., `lt IE 9`. When this is specified,
     *   the generated `script` tag will be enclosed within the conditional comments. This is mainly useful
     *   for supporting old versions of IE browsers.
     *
     * The rest of the options will be rendered as the attributes of the resulting script tag. The values will
     * be HTML-encoded using [[encode]]. If a value is null, the corresponding attribute will not be rendered.
     * See [[renderTagAttributes]] for details on how attributes are being rendered.
     * @return the generated script tag
     */
    public static jsFile(url, options) {
        options.src = url;
        options.type = 'text/javascript';
        return this.tag('script', '', options);
    }
    /**
     * Generates a link tag that refers to an external CSS file.
     * @param  the URL of the external CSS file.
     * @param options the tag options in terms of name-value pairs. The following options are specially handled:
     *
     * - condition: specifies the conditional comments for IE, e.g., `lt IE 9`. When this is specified,
     *   the generated `link` tag will be enclosed within the conditional comments. This is mainly useful
     *   for supporting old versions of IE browsers.
     * - noscript: if set to true, `link` tag will be wrapped into `<noscript>` tags.
     *
     * The rest of the options will be rendered as the attributes of the resulting link tag. The values will
     * be HTML-encoded using [[encode]]. If a value is null, the corresponding attribute will not be rendered.
     * See [[renderTagAttributes]] for details on how attributes are being rendered.
     * @return the generated link tag
     */
    public static cssFile(url, options) {
        if (options.rel === undefined) options.rel = 'stylesheet';
        options.href = url;
        return this.tag('link', '', options);
    }
    /**
     * Generates a text input tag for the given model attribute.
     * This method will generate the "name" and "value" tag attributes automatically for the model attribute
     * unless they are explicitly specified in `options`.
     * @param model the model object
     * @param attribute the attribute name or expression. See [[getAttributeName]] for the format
     * about attribute expression.
     * @param options the tag options in terms of name-value pairs. These will be rendered as
     * the attributes of the resulting tag. The values will be HTML-encoded using [[encode]].
     * See [[renderTagAttributes]] for details on how attributes are being rendered.
     * The following special options are recognized:
     *
     * - maxlength: integer|boolean, when `maxlength` is set true and the model attribute is validated
     *   by a string validator, the `maxlength` option will take the max value of [[StringValidator.max]]
     *   and [[StringValidator.length].
     *   Improved taking `length` into account.
     * - placeholder: string|boolean, when `placeholder` equals `true`, the attribute label from the model will be used
     *   as a placeholder.
     *
     * @return the generated input tag
     */
    public static activeTextInput(model, attribute, options = {}) {
        return this.activeInput('text', model, attribute, options);
    }
    /**
     * Generates an input tag for the given model attribute.
     * This method will generate the "name" and "value" tag attributes automatically for the model attribute
     * unless they are explicitly specified in `options`.
     * @param type the input type (e.g. 'text', 'password')
     * @param model the model object
     * @param attribute the attribute name or expression. See [[getAttributeName]] for the format
     * about attribute expression.
     * @param options the tag options in terms of name-value pairs. These will be rendered as
     * the attributes of the resulting tag. The values will be HTML-encoded using [[encode]].
     * See [[renderTagAttributes]] for details on how attributes are being rendered.
     * @return the generated input tag
     */
    public static activeInput(type, model, attribute, options: any = {}) {
        const name = options.name !== undefined ? options.name : this.getInputName(model, attribute);
        const value = options.value !== undefined ? options.value : this.getAttributeValue(model, attribute);
        if (options.id === undefined) options.id = this.getInputId(model, attribute);
        this.setActivePlaceholder(model, attribute, options);
        return this.input(type, name, value, options);
    }
    /**
     * Generates an input type of the given type.
     * @param type the type attribute.
     * @param name the name attribute. If it is null, the name attribute will not be generated.
     * @param value the value attribute. If it is null, the value attribute will not be generated.
     * @param options the tag options in terms of name-value pairs. These will be rendered as
     * the attributes of the resulting tag. The values will be HTML-encoded using [[encode]].
     * If a value is null, the corresponding attribute will not be rendered.
     * See [[renderTagAttributes]] for details on how attributes are being rendered.
     * @return the generated input tag
     */
    public static input(type, name = null, value = '', options: any = {}) {
        if (options.type === undefined) options.type = type;
        options.name = name;
        options.value = value === undefined ? null : (value as string).toString();
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
    /**
     * Generates an appropriate input ID for the specified attribute name or expression.
     *
     * @param model the model object
     * @param attribute the attribute name or expression. See [[getAttributeName]] for explanation of attribute expression.
     * @return the generated input ID.
     * @throws InvalidArgumentException if the attribute name contains non-word characters.
     */
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
    /**
     * Returns the value of the specified attribute name or expression.
     *
     * For an attribute expression like `[0]dates[0]`, this method will return the value of model.dates[0].
     * See [[getAttributeName]] for more details about attribute expression.
     *
     * If an attribute value is an instance of [[ActiveRecordInterface]] or an array of such instances,
     * the primary value(s) of the AR instance(s) will be returned instead.
     *
     * @param model the model object
     * @param attribute the attribute name or expression
     * @return the corresponding attribute value
     * @throws InvalidArgumentException if the attribute name contains non-word characters.
     */
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
    /**
     * Generate placeholder from model attribute label.
     *
     * @param model the model object
     * @param attribute the attribute name or expression. See [[getAttributeName]] for the format
     * about attribute expression.
     * @param options the tag options in terms of name-value pairs. These will be rendered as
     * the attributes of the resulting tag. The values will be HTML-encoded using [[encode]].
     */
    public static setActivePlaceholder(model, attribute, options: any = {}) {
        if (options.placeholder !== undefined && options.placeholder === true)
            options.placeholder = model.getAttributeLabel(attribute);
    }
    /**
     * Generates a summary of the validation errors.
     * If there is no validation error, an empty error summary markup will still be generated, but it will be hidden.
     * @param models the model(s) whose validation errors are to be displayed.
     * @param options the tag options in terms of name-value pairs. The following options are specially handled:
     *
     * - header: string, the header HTML for the error summary. If not set, a default prompt string will be used.
     * - footer: string, the footer HTML for the error summary. Defaults to empty string.
     * - encode: boolean, if set to false then the error messages won't be encoded. Defaults to `true`.
     * - showAllErrors: boolean, if set to true every error message for each attribute will be shown otherwise
     *   only the first error message for each attribute will be shown. Defaults to `false`.
     *
     * The rest of the options will be rendered as the attributes of the container tag.
     *
     * @return the generated error summary
     */
    public static errorSummary(model, options) {
        const header = options.header !== undefined ? options.header : `<p>Please fix the following errors:</p>`;
        const footer = DataHelper.remove(options, 'footer', '');
        const encode = DataHelper.remove(options, 'encode', '');
        const showAllErrors = DataHelper.remove(options, 'showAllErrors', '');
        delete options.header;
    }
    /**
     * Generates a script tag.
     * @param content the script content
     * @param options the tag options in terms of name-value pairs. These will be rendered as
     * the attributes of the resulting tag. The values will be HTML-encoded using [[encode]].
     * If a value is null, the corresponding attribute will not be rendered.
     * See [[renderTagAttributes]] for details on how attributes are being rendered.
     * @return the generated script tag
     */
    public static script(content, options: any = {}) {
        return this.tag('script', content, options);
    }
    /**
     * Generates a radio button input.
     * @param name the name attribute.
     * @param checked whether the radio button should be checked.
     * @param options the tag options in terms of name-value pairs.
     * See [[booleanInput]] for details about accepted attributes.
     *
     * @return the generated radio button tag
     */
    public static radio(name, checked = false, options: any = {}) {
        return this.booleanInput('radio', name, checked, options);
    }
    /**
     * Generates a checkbox input.
     * @param name the name attribute.
     * @param checked whether the checkbox should be checked.
     * @param options the tag options in terms of name-value pairs.
     * See [[booleanInput]] for details about accepted attributes.
     *
     * @return the generated checkbox tag
     */

    public static checkbox(name, checked = false, options: any = {}) {
        return this.booleanInput('checkbox', name, checked, options);
    }
    /**
     * Generates a hidden input field.
     * @param name the name attribute.
     * @param value the value attribute. If it is null, the value attribute will not be generated.
     * @param options the tag options in terms of name-value pairs. These will be rendered as
     * the attributes of the resulting tag. The values will be HTML-encoded using [[encode]].
     * If a value is null, the corresponding attribute will not be rendered.
     * See [[renderTagAttributes]] for details on how attributes are being rendered.
     * @return the generated hidden input tag
     */
    public static hiddenInput(name, value = null, options: any = {}) {
        return this.input('hidden', name, value, options);
    }
    /**
     * Generates a label tag.
     * @param content label text. It will NOT be HTML-encoded. Therefore you can pass in HTML code
     * such as an image tag. If this is is coming from end users, you should [[encode]]
     * it to prevent XSS attacks.
     * @param for the ID of the HTML element that this label is associated with.
     * If this is null, the "for" attribute will not be generated.
     * @param options the tag options in terms of name-value pairs. These will be rendered as
     * the attributes of the resulting tag. The values will be HTML-encoded using [[encode]].
     * If a value is null, the corresponding attribute will not be rendered.
     * See [[renderTagAttributes]] for details on how attributes are being rendered.
     * @return the generated label tag
     */
    public static label(content, forValue = null, options: any = {}) {
        options.for = forValue;
        return this.tag('label', content, options);
    }
    /**
     * Generates a boolean input.
     * @param type the input type. This can be either `radio` or `checkbox`.
     * @param name the name attribute.
     * @param checked whether the checkbox should be checked.
     * @param options the tag options in terms of name-value pairs. The following options are specially handled:
     *
     * - uncheck: string, the value associated with the uncheck state of the checkbox. When this attribute
     *   is present, a hidden input will be generated so that if the checkbox is not checked and is submitted,
     *   the value of this attribute will still be submitted to the server via the hidden input.
     * - label: string, a label displayed next to the checkbox.  It will NOT be HTML-encoded. Therefore you can pass
     *   in HTML code such as an image tag. If this is is coming from end users, you should [[encode]] it to prevent XSS attacks.
     *   When this option is specified, the checkbox will be enclosed by a label tag.
     * - labelOptions: array, the HTML attributes for the label tag. Do not set this option unless you set the "label" option.
     *
     * The rest of the options will be rendered as the attributes of the resulting checkbox tag. The values will
     * be HTML-encoded using [[encode]]. If a value is null, the corresponding attribute will not be rendered.
     * See [[renderTagAttributes]] for details on how attributes are being rendered.
     *
     * @return the generated checkbox tag
     */
    public static booleanInput(type, name, checked = false, options: any = {}) {
        if (options.checked === undefined) options.checked = checked;
        const value = options.value !== undefined ? options.value : '1';
        let hidden;
        if (options.uncheck !== undefined) {
            const hiddenOptions: any = {};
            if (options.form !== undefined) hiddenOptions.form = options.form;
            if (options.disabled !== undefined) hiddenOptions.disabled = options.disabled;
            hidden = this.hiddenInput(name, options.uncheck, hiddenOptions);
            delete options.uncheck;
        } else hidden = '';
        if (options.label !== undefined) {
            const label = options.label;
            const labelOptions = options.labelOptions !== undefined ? options.labelOptions : {};
            delete options.label, options.labelOptions;
            const content = this.label(`${this.input(type, name, value, options)} ${label}`, null, labelOptions);
            return hidden + content;
        }
        if (options.checked === false) delete options.checked;
        return hidden + this.input(type, name, value, options);
    }
    /**
     * Generates a form start tag.
     * @param action the form action URL.
     * @param method the form submission method, such as "post", "get", "put", "delete" (case-insensitive).
     * Since most browsers only support "post" and "get", if other methods are given, they will
     * be simulated using "post", and a hidden input will be added which contains the actual method type.
     * See [[Request.methodParam]] for more details.
     * @param options the tag options in terms of name-value pairs. These will be rendered as
     * the attributes of the resulting tag. The values will be HTML-encoded using [[encode]].
     * If a value is null, the corresponding attribute will not be rendered.
     * See [[renderTagAttributes]] for details on how attributes are being rendered.
     *
     * Special options:
     *
     *  - `csrf`: whether to generate the CSRF hidden input. Defaults to true.
     *
     * @return the generated form start tag.
     * @see [[endForm]]
     */
    public static beginForm(action = '', method = 'post', options: any = {}) {
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
        if (hiddenInputs.length > 0) form += '\n' + hiddenInputs.join('\n');
        return form;
    }
    /**
     * Generates a form end tag.
     * @return the generated tag
     * @see [[beginForm]]
     */
    public static endForm() {
        return '</form>';
    }
    /**
     * Generates a start tag.
     * @param name the tag name. If name is `null` or `false`, the corresponding content will be rendered without any tag.
     * @param options the tag options in terms of name-value pairs. These will be rendered as
     * the attributes of the resulting tag. The values will be HTML-encoded using [[encode]].
     * If a value is null, the corresponding attribute will not be rendered.
     * See [[renderTagAttributes]] for details on how attributes are being rendered.
     * @return the generated start tag
     * @see [[endTag]]
     * @see [[tag]]
     */
    public static beginTag(name, options: any = {}) {
        if (name === null || name === false) return '';
        return `<${name}${this.renderTagAttributes(options)}>`;
    }
    /**
     * Generates an end tag.
     * @param name the tag name. If name is `null` or `false`, the corresponding content will be rendered without any tag.
     * @return the generated end tag
     * @see [[beginTag]]
     * @see [[tag]]
     */
    public static endTag(name) {
        if (name === null || name === false) {
            return '';
        }
        return `</${name}>`;
    }
    /**
     * Returns the real attribute name from the given attribute expression.
     *
     * An attribute expression is an attribute name prefixed and/or suffixed with array indexes.
     * It is mainly used in tabular data input and/or input of array type. Below are some examples:
     *
     * - `[0]content` is used in tabular data input to represent the "content" attribute
     *   for the first model in tabular input;
     * - `dates[0]` represents the first array element of the "dates" attribute;
     * - `[0]dates[0]` represents the first array element of the "dates" attribute
     *   for the first model in tabular input.
     *
     * If `attribute` has neither prefix nor suffix, it will be returned back without change.
     * @param attribute the attribute name or expression
     * @return the attribute name without prefix and suffix.
     * @throws InvalidArgumentException if the attribute name contains non-word characters.
     */
    public static getAttributeName(attribute) {
        const matches = attribute.match(this.attributeRegex);
        if (matches.length === 0) throw new Error('Attribute name must contain word characters only.');
        return matches[2];
    }
    /**
     * Renders the HTML tag attributes.
     *
     * Attributes whose values are of boolean type will be treated as
     * [boolean attributes](http://www.w3.org/TR/html5/infrastructure.html#boolean-attributes).
     *
     * Attributes whose values are null will not be rendered.
     *
     * The values of attributes will be HTML-encoded using [[encode]].
     *
     * `aria` and `data` attributes get special handling when they are set to an array value. In these cases,
     * the array will be "expanded" and a list of ARIA/data attributes will be rendered. For example,
     * {aria: {role: 'checkbox', value: 'true'}} would be rendered as
     * aria-role="checkbox" aria-value="true".
     *
     * If a nested `data` value is set to an array, it will be JSON-encoded. For example,
     * {data: {params: {id: 1, name: 'yii'}}} would be rendered as
     * data-params={id: 1, name: 'yii'}.
     *
     * @param attributes attributes to be rendered. The attribute values will be HTML-encoded using [[encode]].
     * @return the rendering result. If the attributes are not empty, they will be rendered
     * into a string with a leading white space (so that it can be directly appended to the tag name
     * in a tag). If there is no attribute, an empty string will be returned.
     * @see [[addCssClass]]
     */
    public static renderTagAttributes(attributes) {
        if (attributes.length > 1) {
            let sorted = {};
            for (let name of this.attributeOrder) {
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
        for (let name in style) {
            result += `name: ${style[name]}; `;
        }
        // return null if empty to avoid rendering the "style" attribute
        return result === '' ? null : result.trimRight();
    }
    /**
     * Generates a label tag for the given model attribute.
     * The label text is the label associated with the attribute, obtained via [[Model.getAttributeLabel]].
     * @param model the model object
     * @param attribute the attribute name or expression. See [[getAttributeName]] for the format
     * about attribute expression.
     * @param options the tag options in terms of name-value pairs. These will be rendered as
     * the attributes of the resulting tag. The values will be HTML-encoded using [[encode]].
     * If a value is null, the corresponding attribute will not be rendered.
     * The following options are specially handled:
     *
     * - label: this specifies the label to be displayed. Note that this will NOT be [[encode()|encoded]].
     *   If this is not set, [[Model.getAttributeLabel]] will be called to get the label for display
     *   (after encoding).
     *
     * See [[renderTagAttributes]] for details on how attributes are being rendered.
     *
     * @return the generated label tag
     */
    public static activeLabel(model, attribute, options: any = {}) {
        let forValue = DataHelper.remove(options, 'for', this.getInputId(model, attribute));
        attribute = this.getAttributeName(attribute);
        let label = DataHelper.remove(options, 'label', this.encode(model.getAttributeLabel(attribute)));
        return this.label(label, forValue, options);
    }
    /**
     * Generates a tag that contains the first validation error of the specified model attribute.
     * Note that even if there is no validation error, this method will still return an empty error tag.
     * @param model the model object
     * @param attribute the attribute name or expression. See [[getAttributeName]] for the format
     * about attribute expression.
     * @param options the tag options in terms of name-value pairs. The values will be HTML-encoded
     * using [[encode]]. If a value is null, the corresponding attribute will not be rendered.
     *
     * The following options are specially handled:
     *
     * - tag: this specifies the tag name. If not set, "div" will be used.
     *   See also [[tag]].
     * - encode: boolean, if set to false then the error message won't be encoded.
     * - errorSource: \Closure|callable, callback that will be called to obtain an error message.
     *   The signature of the callback must be: `function (model, attribute)` and return a string.
     *   When not set, the model.getFirstError method will be called.
     *
     * See [[renderTagAttributes]] for details on how attributes are being rendered.
     *
     * @return the generated label tag
     */
    public static error(model: Model, attribute, options: any = {}) {
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
    /**
     * Generates a text area input.
     * @param name the input name
     * @param value the input value. Note that it will be encoded using [[encode]].
     * @param options the tag options in terms of name-value pairs. These will be rendered as
     * the attributes of the resulting tag. The values will be HTML-encoded using [[encode]].
     * If a value is null, the corresponding attribute will not be rendered.
     * See [[renderTagAttributes]] for details on how attributes are being rendered.
     * The following special options are recognized:
     *
     * - `doubleEncode`: whether to double encode HTML entities in `value`. If `false`, HTML entities in `value` will not
     *   be further encoded.
     *
     * @return the generated text area tag
     */
    public static textarea(name, value = '', options: any = {}) {
        options.name = name;
        return this.tag('textarea', Html.encode(value), options);
    }
    /**
     * Generates a hint tag for the given model attribute.
     * The hint text is the hint associated with the attribute, obtained via [[Model.getAttributeHint]].
     * If no hint content can be obtained, method will return an empty string.
     * @param model the model object
     * @param attribute the attribute name or expression. See [[getAttributeName]] for the format
     * about attribute expression.
     * @param options the tag options in terms of name-value pairs. These will be rendered as
     * the attributes of the resulting tag. The values will be HTML-encoded using [[encode]].
     * If a value is null, the corresponding attribute will not be rendered.
     * The following options are specially handled:
     *
     * - hint: this specifies the hint to be displayed. Note that this will NOT be [[encode()|encoded]].
     *   If this is not set, [[Model.getAttributeHint]] will be called to get the hint for display
     *   (without encoding).
     *
     * See [[renderTagAttributes]] for details on how attributes are being rendered.
     *
     * @return the generated hint tag
     */
    public static activeHint(model, attribute, options: any = {}) {
        attribute = this.getAttributeName(attribute);
        let hint = options['hint'] !== undefined ? options['hint'] : model.getAttributeHint(attribute);
        if (hint.length === 0) {
            return '';
        }
        let tag = DataHelper.remove(options, 'tag', 'div');
        delete options['hint'];
        return this.tag(tag, hint, options);
    }
    /**
     * Generates a hidden input tag for the given model attribute.
     * This method will generate the "name" and "value" tag attributes automatically for the model attribute
     * unless they are explicitly specified in `options`.
     * @param model the model object
     * @param attribute the attribute name or expression. See [[getAttributeName]] for the format
     * about attribute expression.
     * @param options the tag options in terms of name-value pairs. These will be rendered as
     * the attributes of the resulting tag. The values will be HTML-encoded using [[encode]].
     * See [[renderTagAttributes]] for details on how attributes are being rendered.
     * @return the generated input tag
     */
    public static activeHiddenInput(model, attribute, options: any = {}) {
        return this.activeInput('hidden', model, attribute, options);
    }
    /**
     * Generates a password input tag for the given model attribute.
     * This method will generate the "name" and "value" tag attributes automatically for the model attribute
     * unless they are explicitly specified in `options`.
     * @param model the model object
     * @param attribute the attribute name or expression. See [[getAttributeName]] for the format
     * about attribute expression.
     * @param options the tag options in terms of name-value pairs. These will be rendered as
     * the attributes of the resulting tag. The values will be HTML-encoded using [[encode]].
     * See [[renderTagAttributes]] for details on how attributes are being rendered.
     * The following special options are recognized:
     *
     * - maxlength: integer|boolean, when `maxlength` is set true and the model attribute is validated
     *   by a string validator, the `maxlength` option will take the max value of [[StringValidator.max]]
     *   and [[StringValidator.length].
     *   Improved taking `length` into account.
     * - placeholder: string|boolean, when `placeholder` equals `true`, the attribute label from the model will be used
     *   as a placeholder.
     *
     * @return the generated input tag
     */
    public static activePasswordInput(model, attribute, options: any = {}) {
        return this.activeInput('password', model, attribute, options);
    }
    /**
     * Generates a file input tag for the given model attribute.
     * This method will generate the "name" and "value" tag attributes automatically for the model attribute
     * unless they are explicitly specified in `options`.
     * Additionally, if a separate set of HTML options array is defined inside `options` with a key named `hiddenOptions`,
     * it will be passed to the `activeHiddenInput` field as its own `options` parameter.
     * @param model the model object
     * @param attribute the attribute name or expression. See [[getAttributeName]] for the format
     * about attribute expression.
     * @param options the tag options in terms of name-value pairs. These will be rendered as
     * the attributes of the resulting tag. The values will be HTML-encoded using [[encode]].
     * See [[renderTagAttributes]] for details on how attributes are being rendered.
     * If `hiddenOptions` parameter which is another set of HTML options array is defined, it will be extracted
     * from `options` to be used for the hidden input.
     * @return the generated input tag
     */
    public static activeFileInput(model, attribute, options: any = {}) {
        let hiddenOptions: any = { id: null, value: '' };
        if (options.name !== undefined) {
            hiddenOptions.name = options.name;
        }
        // make sure disabled input is not sending any value
        if (options['disabled'].length > 0) {
            hiddenOptions['disabled'] = options['disabled'];
        }
        hiddenOptions = { ...hiddenOptions, ...DataHelper.remove(options, 'hiddenOptions', {}) };
        // Add a hidden field so that if a model only has a file field, we can
        // still use isset(_POST[modelClass]) to detect if the input is submitted.
        // The hidden input will be assigned its own set of html options via `hiddenOptions`.
        // This provides the possibility to interact with the hidden field via client script.
        // Note: For file-field-only model with `disabled` option set to `true` input submitting detection won't work.

        return (
            this.activeHiddenInput(model, attribute, hiddenOptions) +
            this.activeInput('file', model, attribute, options)
        );
    }
    /**
     * Generates a textarea tag for the given model attribute.
     * The model attribute value will be used as the content in the textarea.
     * @param model the model object
     * @param attribute the attribute name or expression. See [[getAttributeName]] for the format
     * about attribute expression.
     * @param options the tag options in terms of name-value pairs. These will be rendered as
     * the attributes of the resulting tag. The values will be HTML-encoded using [[encode]].
     * See [[renderTagAttributes]] for details on how attributes are being rendered.
     * The following special options are recognized:
     *
     * - maxlength: integer|boolean, when `maxlength` is set true and the model attribute is validated
     *   by a string validator, the `maxlength` option will take the max value of [[StringValidator.max]]
     *   and [[StringValidator.length].
     *   Improved taking `length` into account.
     * - placeholder: string|boolean, when `placeholder` equals `true`, the attribute label from the model will be used
     *   as a placeholder.
     *
     * @return the generated textarea tag
     */
    public static activeTextarea(model, attribute, options: any = {}) {
        let name = options['name'] !== undefined ? options['name'] : this.getInputName(model, attribute);
        let value;
        if (options['value']) {
            value = options['value'];
            delete options['value'];
        } else {
            value = this.getAttributeValue(model, attribute);
        }
        if (options.id === undefined) options.id = this.getInputId(model, attribute);
        this.setActivePlaceholder(model, attribute, options);
        return this.textarea(name, value, options);
    }
    /**
     * Generates a radio button tag together with a label for the given model attribute.
     * This method will generate the "checked" tag attribute according to the model attribute value.
     * @param model the model object
     * @param attribute the attribute name or expression. See [[getAttributeName]] for the format
     * about attribute expression.
     * @param options the tag options in terms of name-value pairs.
     * See [[booleanInput]] for details about accepted attributes.
     *
     * @return the generated radio button tag
     */
    public static activeRadio(model, attribute, options: any = {}) {
        return this.activeBooleanInput('radio', model, attribute, options);
    }
    /**
     * Generates a checkbox tag together with a label for the given model attribute.
     * This method will generate the "checked" tag attribute according to the model attribute value.
     * @param model the model object
     * @param attribute the attribute name or expression. See [[getAttributeName]] for the format
     * about attribute expression.
     * @param options the tag options in terms of name-value pairs.
     * See [[booleanInput]] for details about accepted attributes.
     *
     * @return the generated checkbox tag
     */
    public static activeCheckbox(model, attribute, options: any = {}) {
        return this.activeBooleanInput('checkbox', model, attribute, options);
    }
    /**
     * Generates a boolean input
     * This method is mainly called by [[activeCheckbox]] and [[activeRadio]].
     * @param type the input type. This can be either `radio` or `checkbox`.
     * @param model the model object
     * @param attribute the attribute name or expression. See [[getAttributeName]] for the format
     * about attribute expression.
     * @param options the tag options in terms of name-value pairs.
     * See [[booleanInput]] for details about accepted attributes.
     * @return the generated input element
     */
    protected static activeBooleanInput(type, model, attribute, options: any = {}) {
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
    /**
     * Generates a drop-down list for the given model attribute.
     * The selection of the drop-down list is taken from the value of the model attribute.
     * @param model the model object
     * @param attribute the attribute name or expression. See [[getAttributeName]] for the format
     * about attribute expression.
     * @param items the option data items. The array keys are option values, and the array values
     * are the corresponding option labels. The array can also be nested (i.e. some array values are arrays too).
     * For each sub-array, an option group will be generated whose label is the key associated with the sub-array.
     * If you have a list of data models, you may convert them into the format described above using
     * [[ArrayHelper.map]].
     *
     * Note, the values and labels will be automatically HTML-encoded by this method, and the blank spaces in
     * the labels will also be HTML-encoded.
     * @param options the tag options in terms of name-value pairs. The following options are specially handled:
     *
     * - prompt: string, a prompt text to be displayed as the first option.
     *   to override the value and to set other tag attributes:
     *
     *   ```js
     *    { text: 'Please select', options: { value: 'none', class: 'prompt', label: 'Select' }}
     *   ```
     *
     * - options: array, the attributes for the select option tags. The array keys must be valid option values,
     *   and the array values are the extra attributes for the corresponding option tags. For example,
     *
     *   ```js
     *   {
     *       value1: {disabled: true},
     *       value2: {label: 'value 2'},
     *   }
     *   ```
     *
     * - groups: array, the attributes for the optgroup tags. The structure of this is similar to that of 'options',
     *   except that the array keys represent the optgroup labels specified in $items.
     * - encodeSpaces: bool, whether to encode spaces in option prompt and option value with `&nbsp;` character.
     *   Defaults to false.
     * - encode: bool, whether to encode option prompt and option value characters.
     *   Defaults to `true`.
     *
     * The rest of the options will be rendered as the attributes of the resulting tag. The values will
     * be HTML-encoded using [[encode]]. If a value is null, the corresponding attribute will not be rendered.
     * See [[renderTagAttributes]] for details on how attributes are being rendered.
     *
     * @return the generated drop-down list tag
     */
    public static activeDropDownList(model, attribute, items, options: any = {}) {
        if (options.multiple.length === 0) {
            return this.activeListInput('dropDownList', model, attribute, items, options);
        }

        return this.activeListBox(model, attribute, items, options);
    }
    /**
     * Generates a list box.
     * The selection of the list box is taken from the value of the model attribute.
     * @param model the model object
     * @param attribute the attribute name or expression. See [[getAttributeName]] for the format
     * about attribute expression.
     * @param items the option data items. The array keys are option values, and the array values
     * are the corresponding option labels. The array can also be nested (i.e. some array values are arrays too).
     * For each sub-array, an option group will be generated whose label is the key associated with the sub-array.
     * If you have a list of data models, you may convert them into the format described above using
     * [[ArrayHelper.map]].
     *
     * Note, the values and labels will be automatically HTML-encoded by this method, and the blank spaces in
     * the labels will also be HTML-encoded.
     * @param options the tag options in terms of name-value pairs. The following options are specially handled:
     *
     * - prompt: string, a prompt text to be displayed as the first option.
     *   to override the value and to set other tag attributes:
     *
     *   ```js
     *   { text: 'Please select', options: { value: 'none', class: 'prompt', label: 'Select' }}
     *   ```
     *
     * - options: array, the attributes for the select option tags. The array keys must be valid option values,
     *   and the array values are the extra attributes for the corresponding option tags. For example,
     *
     *   ```js
     *   {
     *       value1: {disabled: true},
     *       value2: {label: 'value 2'},
     *   }
     *   ```
     *
     * - groups: array, the attributes for the optgroup tags. The structure of this is similar to that of 'options',
     *   except that the array keys represent the optgroup labels specified in $items.
     * - unselect: string, the value that will be submitted when no option is selected.
     *   When this attribute is set, a hidden field will be generated so that if no option is selected in multiple
     *   mode, we can still obtain the posted unselect value.
     * - encodeSpaces: bool, whether to encode spaces in option prompt and option value with `&nbsp;` character.
     *   Defaults to false.
     * - encode: bool, whether to encode option prompt and option value characters.
     *   Defaults to `true`.
     *
     * The rest of the options will be rendered as the attributes of the resulting tag. The values will
     * be HTML-encoded using [[encode]]. If a value is null, the corresponding attribute will not be rendered.
     * See [[renderTagAttributes]] for details on how attributes are being rendered.
     *
     * @return the generated list box tag
     */
    public static activeListBox(model, attribute, items, options: any = {}) {
        return this.activeListInput('listBox', model, attribute, items, options);
    }
    /**
     * Generates a list of checkboxes.
     * A checkbox list allows multiple selection, like [[listBox]].
     * As a result, the corresponding submitted value is an array.
     * The selection of the checkbox list is taken from the value of the model attribute.
     * @param model the model object
     * @param attribute the attribute name or expression. See [[getAttributeName]] for the format
     * about attribute expression.
     * @param items the data item used to generate the checkboxes.
     * The array keys are the checkbox values, and the array values are the corresponding labels.
     * Note that the labels will NOT be HTML-encoded, while the values will.
     * @param options options {name: 'config'} for the checkbox list container tag.
     * The following options are specially handled:
     *
     * - tag: string|false, the tag name of the container element. False to render checkbox without container.
     *   See also [[tag]].
     * - unselect: string, the value that should be submitted when none of the checkboxes is selected.
     *   You may set this option to be null to prevent default value submission.
     *   If this option is not set, an empty string will be submitted.
     * - encode: boolean, whether to HTML-encode the checkbox labels. Defaults to true.
     *   This option is ignored if `item` option is set.
     * - separator: string, the HTML code that separates items.
     * - itemOptions: array, the options for generating the checkbox tag using [[checkbox]].
     * - item: callable, a callback that can be used to customize the generation of the HTML code
     *   corresponding to a single item in $items. The signature of this callback must be:
     *
     *   ```js
     *   function (index, label, name, checked, value)
     *   ```
     *
     *   where index is the zero-based index of the checkbox in the whole list; label
     *   is the label for the checkbox; and name, value and checked represent the name,
     *   value and the checked status of the checkbox input.
     *
     * See [[renderTagAttributes]] for details on how attributes are being rendered.
     *
     * @return the generated checkbox list
     */
    public static activeCheckboxList(model, attribute, items, options: any = {}) {
        return this.activeListInput('checkboxList', model, attribute, items, options);
    }
    /**
     * Generates a list of radio buttons.
     * A radio button list is like a checkbox list, except that it only allows single selection.
     * The selection of the radio buttons is taken from the value of the model attribute.
     * @param model the model object
     * @param attribute the attribute name or expression. See [[getAttributeName]] for the format
     * about attribute expression.
     * @param items the data item used to generate the radio buttons.
     * The array keys are the radio values, and the array values are the corresponding labels.
     * Note that the labels will NOT be HTML-encoded, while the values will.
     * @param options options {name: 'config'} for the radio button list container tag.
     * The following options are specially handled:
     *
     * - tag: string|false, the tag name of the container element. False to render radio button without container.
     *   See also [[tag]].
     * - unselect: string, the value that should be submitted when none of the radio buttons is selected.
     *   You may set this option to be null to prevent default value submission.
     *   If this option is not set, an empty string will be submitted.
     * - encode: boolean, whether to HTML-encode the checkbox labels. Defaults to true.
     *   This option is ignored if `item` option is set.
     * - separator: string, the HTML code that separates items.
     * - itemOptions: array, the options for generating the radio button tag using [[radio]].
     * - item: callable, a callback that can be used to customize the generation of the HTML code
     *   corresponding to a single item in $items. The signature of this callback must be:
     *
     *   ```js
     *   function (index, label, name, checked, value)
     *   ```
     *
     *   where index is the zero-based index of the radio button in the whole list; label
     *   is the label for the radio button; and name, value and checked represent the name,
     *   value and the checked status of the radio button input.
     *
     * See [[renderTagAttributes]] for details on how attributes are being rendered.
     *
     * @return the generated radio button list
     */
    public static activeRadioList(model, attribute, items, options: any = {}) {
        return this.activeListInput('radioList', model, attribute, items, options);
    }
    /**
     * Generates a list of input fields.
     * This method is mainly called by [[activeListBox]], [[activeRadioList]] and [[activeCheckboxList]].
     * @param type the input type. This can be 'listBox', 'radioList', or 'checkBoxList'.
     * @param model the model object
     * @param attribute the attribute name or expression. See [[getAttributeName]] for the format
     * about attribute expression.
     * @param items the data item used to generate the input fields.
     * The array keys are the input values, and the array values are the corresponding labels.
     * Note that the labels will NOT be HTML-encoded, while the values will.
     * @param options options {name: 'config'} for the input list. The supported special options
     * depend on the input type specified by `type`.
     * @return the generated input list
     */
    protected static activeListInput(type, model, attribute, items, options: any = {}) {
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
