import Inflector = require('inflected');
import { emptyDir } from 'fs-extra';
import { Application } from '..';
import { ActiveDataProvider } from '..';
const ormAdapter = Application.getORMAdapter();
const ORMModel = ormAdapter.extendableModelClass();
export default class Model extends ORMModel {
    public _errors: { [key: string]: any } = {};
    protected attributeLabels: { [key: string]: string } = {};
    protected attributeHints: { [key: string]: string } = {};
    static init;
    public static hooks = {};
    public toJSON() {
        const json = super.toJSON();
        if (Object.keys(this._errors).length === 0) return json;
        const newJson = { ...json, errors: this._errors };
        return newJson;
    }

    public getAttributeLabel(attribute: string): string {
        return this.attributeLabels[attribute] !== undefined
            ? this.attributeLabels[attribute]
            : Inflector.humanize(attribute);
    }

    public static primaryKey(): string {
        return 'id';
    }

    public getFormName(): string {
        return this.constructor.name;
    }

    public load(data: { [key: string]: any }, formName: string | null = null): boolean {
        const scope = formName === null ? this.getFormName() : formName;
        if (scope === '' && !emptyDir(data)) {
            this.setAttributeValues(data);
            return true;
        } else if (data[scope] !== undefined) {
            this.setAttributeValues(data[scope]);
            return true;
        }
        return false;
    }

    public search(params: { [key: string]: string }): ActiveDataProvider {
        this.load(params);
        ormAdapter.modelClass = this.constructor;
        return ormAdapter.search(this, params, new ActiveDataProvider({ modelClass: this.constructor }));
    }

    public setAttributeValues(values: { [key: string]: any }): Model {
        return ormAdapter.setAttributes(this, values);
    }

    public getFirstError(attribute: string): string | null {
        return this._errors[attribute] !== undefined ? this._errors[attribute] : null;
    }

    public getAttributeHint(attribute): string {
        let hints = this.attributeHints;
        return hints[attribute] !== undefined ? hints[attribute] : '';
    }

    public isAttributeRequired(attribute: string): boolean {
        return ormAdapter.isAttributeRequired(this, attribute);
    }

    public hasErrors(attribute: string | null = null): boolean {
        return attribute === null ? Object.keys(this._errors).length > 0 : this._errors[attribute] !== undefined;
    }

    public activeAttributes(): string[] {
        return ormAdapter.activeAttributes(this);
    }

    public getActiveValidators(attribute: string | null = null): { [key: string]: any } {
        const ormValidators = ormAdapter.getActiveValidators(this, attribute);
        const validators = {};
        for (let validator in ormValidators) {
            if (ormAdapter.validatorMap[validator] !== undefined)
                validators[ormAdapter.validatorMap[validator]] = ormValidators[validator];
        }
        return validators;
    }

    public async verify(attributeNames: string[] | null = null, clearErrors = true): Promise<boolean> {
        if (clearErrors) this.clearErrors();
        if (attributeNames === null) attributeNames = this.activeAttributes();
        await ormAdapter.validate(this);
        //console.log('model-verify', this, this.hasErrors());
        return !this.hasErrors();
    }

    public clearErrors(attribute: string | null = null) {
        if (attribute === null) this._errors = {};
        else delete this._errors[attribute];
    }
}
