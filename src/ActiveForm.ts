import Inflector = require('inflected');
export default class ActiveForm {
  model;
  errorClass = 'error';
  fieldTemplate =
    '<label for="{fieldName}" class="input-label">{fieldLabel}</label><br><[type] [htmlOptions] type="text" placeholder="{placeholder}" name="{fieldName}" value="{fieldValue}" class="{hasError}">{errorHtml}';
  constructor(model) {
    this.model = model;
  }
  public renderField(name, type = 'input', htmlOptions = {}) {
    const html = this.fieldTemplate.replace(/{\w+}/g, (match) => {
      return this.renderSection(match, name);
    });
    const options = [];
    for (const p in htmlOptions) if (htmlOptions.hasOwnProperty(p)) options.push(p + '="' + htmlOptions[p] + '"');
    htmlOptions = options.join(' ');
    const namespaces = { type, htmlOptions };
    return html.replace(/\[\w+\]/g, (match) => {
      return namespaces[match.replace(/\[|\]/g, '')];
    });
  }

  public renderSection(section, name) {
    section = section.replace(/\{|\}/g, '');
    if (this.hasOwnProperty(section)) return this[section];
    return this.sections.hasOwnProperty(section) ? this.sections[section](name) : '';
  }

  public sections = {
    fieldName: (name) => {
      return name;
    },
    fieldLabel: (name) => {
      if (this.model.hasOwnProperty('attributeLabels') && this.model.attributeLabels.hasOwnProperty(name))
        return this.model.attributeLabels[name];
      return Inflector.humanize(name);
    },
    placeholder: (name) => {
      if (this.model.hasOwnProperty('attributePlaceholders') && this.model.attributePlaceholders.hasOwnProperty(name))
        return 'Enter ' + this.model.attributePlaceholders[name];
      return 'Enter ' + Inflector.humanize(name);
    },
    fieldValue: (name) => {
      return this.model[name] === null || typeof this.model[name] === 'undefined' ? '' : this.model[name];
    },
    errorHtml: (name) => {
      return this.model.errors.hasOwnProperty(name)
        ? '<span class="badge"></span><p class="error-message">' + this.model.errors[name] + '</p>'
        : '';
    },
    hasError: (name) => {
      return this.model.errors.hasOwnProperty(name) ? this.errorClass : '';
    },
  };
}
