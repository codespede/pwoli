import ActiveDataProvider from '../data/ActiveDataProvider';
import Model from '../base/Model';
import Sort from '../data/Sort';
import IORMAdapter from './IORMAdapter';
import ORMAdapter from './ORMAdapter';
import { Sequelize, QueryInterface } from 'sequelize';
/**
 * SequelizeAdapter is the communication interface between Pwoli and the Sequelize ORM.
 * 
 * An ORM Adapter defines how Pwoli should interact between that ORM(here Sequelize) for which this ORMAdapter is implemented.
 * 
 * @see [Using a different ORM](/pwoli/using-another-orm)
 * @author Mahesh S Warrier <https://github.com/codespede>
 */
export default class SequelizeAdapter extends ORMAdapter implements IORMAdapter {
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
        return await this.modelClass.findAll(query);
    }
    /** @inheritdoc */
    public applySort(query: { [key: string]: any }, sort: Sort): { [key: string]: any } {
        if (query.order === undefined) query.order = sort.getOrders();
        else query.order.push(sort.getOrders());
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
        return await this.modelClass.count(query);
    }
    /** @inheritdoc */
    public attributes(): string[] {
        return Object.keys(this.modelClass.rawAttributes);
    }
    /** @inheritdoc */
    public setAttributes(model: Model, values: { [key: string]: any }): Model {
        for (let attribute in values) {
            if (values[attribute] !== undefined) {
                if (model.rawAttributes[attribute] !== undefined) model[attribute] = values[attribute];
                else model.dataValues[attribute] = values[attribute];
            }
        }
        return model;
    }
    /** @inheritdoc */
    public search(model: Model, params = {}, dataProvider: ActiveDataProvider): ActiveDataProvider {
        const { Op } = require('sequelize');
        dataProvider.query.where = dataProvider.query.where !== undefined ? dataProvider.query.where : {};
        if (params[this.modelClass.name] !== undefined) {
            for (const param in params[this.modelClass.name]) {
                if(this.attributes().includes(param)){
                    if(this.modelClass.tableAttributes[param]?.type?.toString?.() === 'INTEGER' && model.sequelize.options.dialect === 'postgresql')
                        dataProvider.query.where[Op.and] = Sequelize.literal(`${this.modelClass.name}.${param} LIKE '%${params[this.modelClass.name][param]}%'`);
                    else
                        dataProvider.query.where[param] = { [Op.like]: `%${params[this.modelClass.name][param]}%` };
                }
            }
        }
        return dataProvider;
    }
        /** @inheritdoc */
    public isAttributeRequired(model: Model, attribute: string): boolean {
        return !model.rawAttributes[attribute].allowNull;
    }
    /** @inheritdoc */
    public activeAttributes(model: Model): string[] {
        const attributes = [];
        for (let attribute in model.rawAttributes) {
            if (this.isAttributeActive(model, attribute)) attributes.push(attribute);
        }
        return attributes;
    }
    /** @inheritdoc */
    public isAttributeActive(model: Model, attribute: string): boolean {
        return (
            model.rawAttributes[attribute].allowNull === false || model.rawAttributes[attribute].validate !== undefined
        );
    }
    /** @inheritdoc */
    public getActiveValidators(model: Model, attribute: string): Array<{ [key: string]: any }> {
        const validators = { ...model.rawAttributes[attribute].validate };
        if (model.rawAttributes[attribute].allowNull === false) validators.notEmpty = true;
        return validators;
    }
    /** @inheritdoc */
    public getClientValidationParams(criteria: boolean | { [key: string]: any }): { [key: string]: any } {
        const options: { [key: string]: any } = {};
        if ((criteria as { [key: string]: any }).msg !== undefined) {
            options.message = (criteria as { [key: string]: any }).msg;
            criteria = (criteria as { [key: string]: any }).args;
        } else if (criteria === false) return {};
        return { criteria, options };
    }
    /** @inheritdoc */
    public async validate(model: Model): Promise<Model> {
        try {
            await model.validate();
        } catch (error) {
            let errors = {};

            error.errors.forEach((error) => {
                errors[error.path] = error.message;
            });
            for (let attribute in model.dataValues) {
                if (
                    model.rawAttributes[attribute].allowNull !== undefined &&
                    model.rawAttributes[attribute].allowNull === false &&
                    (model.dataValues[attribute] === null || model.dataValues[attribute] === '')
                )
                    errors[attribute] = `This value is required.`;
            }
            model._errors = errors;
        }
        return model;
    }
}
