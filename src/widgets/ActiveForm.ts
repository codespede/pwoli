import Inflector = require('inflected');
import path = require('path');
import Html from '../helpers/Html';
import Widget from '../base/Widget';
import Model from '../base/Model';
import Pwoli from '../base/Application';
import ActiveField from './ActiveField';
export default class ActiveForm extends Widget {
  public action = '';
  public method = 'post';
  public options: { [key: string]: any } = {};
  public fieldClass = ActiveField;
  public fieldConfig: { [key: string]: any } = {};
  public encodeErrorSummary = true;
  public errorSummaryCssClass = 'error-summary';
  public requiredCssClass = 'required';
  public successCssClass = 'has-success';
  public errorCssClass = 'has-error';
  public validatingCssClass = 'validating';
  public validationStateOn = 'container';
  public enableClientValidation = true;
  public enableAjaxValidation = false;
  public enableClientScript = true;
  public validationUrl: string;
  public validateOnSubmit = true;
  public validateOnChange = true;
  public validateOnType = false;
  public validateOnBlur = true;
  public validationDelay = 500;
  public ajaxParam = 'ajax';
  public ajaxDataType = 'json';
  public scrollToError = true;
  public scrollToErrorOffset = 0;
  public attributes = [];
  private _fields = [];

  public constructor(config) {
    super(config);
    Object.assign(this, config);
  }

  public async init() {
    await super.init.call(this);
    if (this.options.id === undefined) this.options.id = this.getId();
  }

  public async run() {
    if (this._fields.length === 0) throw new Error('Each beginField() should have a matching endField() call.');
  }

  public async begin() {
    let html = Html.beginForm(this.action, this.method, this.options);
    return html;
  }

  public async end() {
    const html = Html.endForm();
    if (this.enableClientScript) await this.registerClientScript();
    return html;
  }

  public async registerClientScript() {
    const id = this.options.id;
    const options = JSON.stringify(this.getClientOptions());
    let attributes = JSON.stringify(this.attributes);
    attributes = attributes.replace(/\"(function.*?\})\"/g, `$1`).replace(/(\\":?!)|({?!\\")|(\\")/g, '"');
    //console.log('af-rcs', attributes);
    await Pwoli.view.publishAndRegisterFile(path.join(__dirname, '/../assets/css/bootstrap.css'));
    await Pwoli.view.publishAndRegisterFile(path.join(__dirname, '/../assets/js/activeForm.js'));
    await Pwoli.view.publishAndRegisterFile(path.join(__dirname, '/../assets/js/validation.js'));
    Pwoli.view.registerJs(`jQuery('#${id}').pwoliActiveForm(${attributes}, ${options});`);
  }

  protected getClientOptions() {
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

  public errorSummary(models, options: any = {}) {
    Html.addCssClass(options, this.errorSummaryCssClass);
    options.encode = this.encodeErrorSummary;
    return Html.errorSummary(models, options);
  }

  public field(model, attribute, options: any = {}) {
    let config = this.fieldConfig;
    if (typeof config === 'function') config = config(model, attribute);
    if (config.class === undefined) config.class = this.fieldClass;
    return new config.class({ ...options, model, attribute, form: this });
  }

  public beginField(model, attribute, options: any = {}) {
    const field = this.field(model, attribute, options);
    this._fields.push(field);
    return field.begin();
  }

  public endField() {
    const field = this._fields.pop();
    if (field instanceof ActiveField) return field.end();
    throw new Error('Mismatching endField() call.');
  }

  public static async validate(model, attributes = null) {
    let result = {};
    let models = [model];
    for (let model of models) {
      await model.verify(attributes);
      for (let attribute in model._errors) result[Html.getInputId(model, attribute)] = [model._errors[attribute]];
    }
    return result;
  }

  public static validateMultiple(models, attributes = null) {
    let result = [];
    let i = 0;
    for (let model of models) {
      model.validate(attributes);
      for (let attribute in model.errors)
        result[Html.getInputId(model, `[${i}]${attribute}`)] = model.errors[attribute];
      i++;
    }
    return result;
  }
}