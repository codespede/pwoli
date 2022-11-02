import IORMAdapter from "./IORMAdapter";
import ORMAdapter from "./ORMAdapter";
import Model from '../base/Model';
import Sort from '../data/Sort';
import ActiveDataProvider from '../data/ActiveDataProvider';
import DataHelper from '../helpers/DataHelper';
/**
 * MongooseAdapter is the communication interface between Pwoli and the Mongoose ORM.
 * 
 * An ORM Adapter defines how Pwoli should interact between that ORM(here Mongoose) for which this ORMAdapter is implemented.
 * 
 * @see [Using a different ORM](/pwoli/using-mongoose)
 * @author Mahesh S Warrier <https://github.com/codespede>
 */
export default class MongooseAdapter extends ORMAdapter implements IORMAdapter {
    /** @inheritdoc */
    public validatorMap: { [key: string]: string } = {
        is: 'regex',
        not: 'regexInverse',
        notEmpty: 'required',
        isEmail: 'email',
    };
    /** @inheritdoc */
    public constructor(config: { [key: string]: any } = {}) {
        super(config);
        Object.assign(this, config);
    }
    /** @inheritdoc */
    public async findAll(query: { [key: string]: any }): Promise<Model[]> {
        let condition = JSON.parse(JSON.stringify(query));
        let skip = query.offset || 0;
        let limit = query.limit || 0;
        let populate = query.populate && !Array.isArray(query.populate)? [query.populate] : (query.populate || []);
        delete condition.order, condition.limit, condition.offset; 
        let sort = {};
        if(query.order !== undefined)
            for(let order of query.order)
                sort[order[0]] = order[1] === 'asc' ? 1 : -1;
        console.log('fa-sort', query.order, sort, populate);
        return await this.modelClass.find(condition).sort(sort).populate(populate).skip(skip).limit(limit);
    }
    /** @inheritdoc */
    public applySort(query: { [key: string]: any }, sort: Sort): { [key: string]: any } {
        if (query.order === undefined) query.order = sort.getOrders();
        else query.order.push(sort.getOrders());
        console.log('as', query.order);
        return query;
    }
    /** @inheritdoc */
    public applyPagination(query: { [key: string]: any }, pagination): { [key: string]: any } {
        query.limit = pagination.getLimit();
        query.offset = pagination.getOffset();
        return query;
    }
    /** @inheritdoc */
    public primaryKey(): string {
        return this.modelClass.primaryKey();
    }
    /** @inheritdoc */
    public async count(query: { [key: string]: any }): Promise<number> {
        return await this.modelClass.countDocuments(query);
    }
    /** @inheritdoc */
    public attributes(): string[] {
        return Object.keys(this.modelClass.schema.tree);
    }
    /** @inheritdoc */
    public setAttributes(model: Model, values: { [key: string]: any }): Model {
        let obj = {};
        for (let attribute in values)
            obj = { ...obj, ...DataHelper.resolveDotStructuredObject(values, attribute)} ;
        for(let prop in obj)
            model[prop] = obj[prop];
        return model;
    }
    /** @inheritdoc */
    public search(model: Model, params = {}, dataProvider: ActiveDataProvider): ActiveDataProvider {
        dataProvider.query = dataProvider.query || {};
        if (params[model.getFormName()] !== undefined) {
            for (const param in params[model.getFormName()]) {
                if(this.allAttributes(model).includes(param)){
                    dataProvider.query[param] = { $regex: `.*${params[model.getFormName()][param]}.*`, $options: 'i' };
                }
            }
        }
        return dataProvider;
    }
    /**
     * Returns all the attributes including the ones in embedded schemas.
     * @param model The model from which the attributes list has to be extracted.
     * @return The attributes list as an array.
     */
    public allAttributes(model: Model): string[] {
        let attributes = [];
        (model.constructor as {[key: string] : any}).schema.eachPath(path => {
            attributes.push(path);
        });
        return attributes;
    }
    /** @inheritdoc */
    public isAttributeRequired(model: Model, attribute: string): boolean {
        const schema = (model.constructor as {[key: string] : any}).schema;
        let resolvedAattribute = DataHelper.getValue(schema.obj, attribute);
        return resolvedAattribute.required || false;
    }
    /** @inheritdoc */
    public activeAttributes(model: Model): string[] {
        const attributes = [];
        const allAttributes = this.allAttributes(model);
        
        for (let attribute of this.allAttributes(model)) {
            if (this.isAttributeActive(model, attribute)) attributes.push(attribute);
        }
        return attributes;
    }
    /** @inheritdoc */
    public isAttributeActive(model: Model, attribute: string): boolean {
        const schema = (model.constructor as {[key: string] : any}).schema;
        let resolvedAattribute = DataHelper.getValue(schema.obj, attribute);
        
        return resolvedAattribute && (
            resolvedAattribute.required === true || resolvedAattribute.match !== undefined || resolvedAattribute.validate !== undefined
        );
    }
    /** @inheritdoc */
    public getActiveValidators(model: Model, attribute: string): Array<{ [key: string]: any }> {
        const schema = (model.constructor as {[key: string] : any}).schema;
        let resolvedAattribute = DataHelper.getValue(schema.obj, attribute);
        let attributeValidators = resolvedAattribute.validate;
        if(!Array.isArray(attributeValidators))
            attributeValidators = [attributeValidators];
        let validators: any = {};
        let i = 0;
        for(let validator of attributeValidators){
            validators[i] = validator;
            i++;
        }
        if (resolvedAattribute.required === true) validators.notEmpty = true;
        return validators;
    }
    
    /** @inheritdoc */
    public getClientValidationParams(criteria: boolean | { [key: string]: any }): { [key: string]: any } {
        const options: { [key: string]: any } = {};
        if (Array.isArray(criteria)) {
            (criteria as {[key: string] : any}).source = criteria[0];
            options.message = criteria[1];
        } else if (criteria === false) return {};
        return { criteria, options };
    }
    /** @inheritdoc */
    public async validate(model: Model): Promise<Model> {
        try {
            await model.validate();
        } catch (error) {
            let errors = {};          
            for(let err in error.errors)
                errors[err] = error.errors[err].properties?.message || 'The value entered is invalid.';
            model._errors = errors;
        }
        return model;
    }
}