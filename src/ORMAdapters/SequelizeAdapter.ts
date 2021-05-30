//import { ActiveDataProvider } from "..";
import IORMAdapter from "./IORMAdapter";
import ORMAdapter from "./ORMAdapter";
export default class SequelizeAdapter extends ORMAdapter implements IORMAdapter{
    
    private validatorMap = {
        'is': 'regex',
        'not': 'regexInverse',
        'notEmpty': 'required',
        'isEmail': 'email'
    };

    public constructor(config) {
        super(config);
        Object.assign(this, config);
    }

    public async findAll(query) {
        return await this.modelClass.findAll(query);
    }

    public applySort(query, sort) {
        if (query.order === undefined)
            query.order = sort.getOrders();
        else
            query.order.push(sort.getOrders());
        return query;
    }

    public applyPagination(query, pagination) {
        query.limit = pagination.getLimit();
        query.offset = pagination.getOffset();
        return query;
    }

    public primaryKey() {
        return this.modelClass.primaryKey();
    }

    public async count(query) {
        return await this.modelClass.count(query);
    }

    public attributes() {
        return Object.keys(this.modelClass.rawAttributes);
    }

    public setAttributes(model, values) {
        for (let attribute in values) {
            if (values[attribute] !== undefined)
                model.dataValues[attribute] = values[attribute];
        }
        return model;
    }

    public search(model, params = {}, dataProvider) {
        const { Op } = require("sequelize");
        dataProvider.query.where = dataProvider.query.where !== undefined? dataProvider.query.where : {};
        if (params[this.modelClass.name] !== undefined) {
            for (const param in params[this.modelClass.name]) {
                if (this.attributes().includes(param))
                    dataProvider.query.where[param] = { [Op.like]: `%${params[this.modelClass.name][param]}%`};
            }
        }
        return dataProvider;
    }

    public isAttributeRequired(model, attribute) {
        return !model.rawAttributes[attribute].allowNull;
    }

    public activeAttributes(model) {
        const attributes = [];
        for (let attribute in model.rawAttributes) {
            if (this.isAttributeActive(model, attribute))
                attributes.push(attribute);
        }
        return attributes;
    }

    public isAttributeActive(model, attribute) {
        return model.rawAttributes[attribute].allowNull === false || model.rawAttributes[attribute].validate !== undefined;
    }

    public getActiveValidators(model, attribute) {
        const validators = { ...model.rawAttributes[attribute].validate };
        if (model.rawAttributes[attribute].allowNull === false)
            validators.notEmpty = true;
        return validators;
    }

    public getClientValidationParams(criteria) {
        const options: any = {};
        if (criteria.msg !== undefined) {
            options.message = criteria.msg;
            criteria = criteria.args;
        } else if (criteria === false)
            return {};
        return { criteria, options };
    }

    public async validate(model) {
        try {
            await model.validate();
        } catch (error) {
            let errors = {};
            console.log('validate-errors', error.errors);
            error.errors.forEach(error => {
                errors[error.path] = error.message;
            });
            for (let attribute in model.dataValues) {
                if (model.rawAttributes[attribute].allowNull !== undefined && model.rawAttributes[attribute].allowNull === false
                    && (model.dataValues[attribute] === null || model.dataValues[attribute] === ''))
                    errors[attribute] = `This value is required.`
            }
            model._errors = errors;
        }
        return model;
    }

}
