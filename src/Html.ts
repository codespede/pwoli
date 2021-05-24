import Application from './Application';
import Component from './Component';
import DataHelper from './DataHelper';
import DataProvider from './DataProvider';

export default class Html extends Component {
  public static attributeRegex = /(^|.*\])([\w\.\+]+)(\[.*|$)/u;
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
  public static tag(name, content = '', options = []) {
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
    options.value = value === null ? null : value.toString();
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
    throw new Error(`${model.name}::formName() cannot be empty for tabular inputs.`);
  }

  public static getInputId(model, attribute) {
    const name = this.getInputName(model, attribute).toLowerCase();
    const map = {
      '[]': '',
      '][': '-',
      '[': '-',
      ']': '-',
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

  public static script(content, options = []) {
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
    if (options.uncheck !== 'undefined') {
      const hiddenOptions: any = {};
      if (options.form !== undefined)
        hiddenOptions.form = options.form;
      if (options.disabled.length > 0)
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
    return hidden + this.input(type, name, value, options);
  }
}
