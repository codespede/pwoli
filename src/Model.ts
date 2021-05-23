import Inflector = require('inflected');
import { emptyDir } from 'fs-extra';
import Application from './Application';
import { ActiveDataProvider } from '.';
const ormAdapter = Application.getORMAdapter();
const ORMModel = ormAdapter.extendableModelClass();
export default class Model extends ORMModel {
    public errors = [];
    protected attributeLabels = {};
    static init;
    public static hooks = {};
    public toJSON() {
        const json = super.toJSON();
        if (this.errors.length === 0) return json;
        const newJson = { ...json, errors: this.errors };
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
        console.group('model-load', data);
        const scope = formName === null ? this.getFormName() : formName;
        console.log('data-scope', scope, data[scope]);
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
}
