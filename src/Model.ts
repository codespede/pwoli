import Inflector = require('inflected');
import { emptyDir } from 'fs-extra';
import Application from './Application';
import ActiveDataProvider from './ActiveDataProvider';
const ormAdapter = Application.getORMAdapter();
const ORMModel = ormAdapter.extendableModelClass();
export default class Model extends ORMModel {
    public _errors = {};
    protected attributeLabels = {};
    protected attributeHints = {};
    static init;
    public static hooks = {};
    public toJSON() {
        const json = super.toJSON();
        if (Object.keys(this._errors).length === 0) return json;
        const newJson = { ...json, errors: this._errors };
        return newJson;
    }

    public getAttributeLabel(attribute) {
        return this.attributeLabels[attribute] !== undefined
        ? this.attributeLabels[attribute]
        : Inflector.humanize(attribute);
    }

    public static primaryKey() {
        return 'id';
    }

    public getFormName() {
        return this.constructor.name;
    }

    public load(data, formName = null) {
        
        const scope = formName === null ? this.getFormName() : formName;
        console.group('model-load', data, scope, data[scope]);
        if (scope === '' && !emptyDir(data)) {
            this.setAttributeValues(data);
            return true;
        } else if (data[scope] !== undefined) {
            this.setAttributeValues(data[scope]);
            return true;
        }
        return false;
    }

    public search(params: {}): ActiveDataProvider {
        this.load(params);
        ormAdapter.modelClass = this.constructor;
        return ormAdapter.search(this, params, new ActiveDataProvider({modelClass: this.constructor}));
    }
    
    public setAttributeValues(values: {}) {
        return ormAdapter.setAttributes(this, values);
    }

    public getFirstError(attribute) {
        return this._errors[attribute] !== undefined? this._errors[attribute] : null;
    }

    public getAttributeHint(attribute) {
        let hints = this.attributeHints;
        return (hints[attribute] !== undefined) ? hints[attribute] : '';
    }

    public isAttributeRequired(attribute) {
        return ormAdapter.isAttributeRequired(this, attribute);
    }

    public hasErrors(attribute = null) {
        return attribute === null ? Object.keys(this._errors).length > 0 : this._errors[attribute] !== undefined;
    }

    public activeAttributes() {
        return ormAdapter.activeAttributes(this);
    }

    public getActiveValidators(attribute = null) {
        const ormValidators = ormAdapter.getActiveValidators(this, attribute);
        const validators = {};
        for (let validator in ormValidators) {
            if (ormAdapter.validatorMap[validator] !== undefined)
                validators[ormAdapter.validatorMap[validator]] = ormValidators[validator];
        }
        return validators;
    }

    public async verify(attributeNames = null, clearErrors = true) {
        if (clearErrors)
            this.clearErrors();
        if (attributeNames === null)
            attributeNames = this.activeAttributes();
        await ormAdapter.validate(this);
        //console.log('model-verify', this, this.hasErrors());
        return !this.hasErrors();
    }

    public clearErrors(attribute = null) {
        if (attribute === null)
            this._errors = {};
        else
            delete this._errors[attribute]
    }
}
