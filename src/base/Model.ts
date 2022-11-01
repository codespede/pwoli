import Inflector = require('inflected');
import { emptyDir } from 'fs-extra';
import { Application } from '..';
import { ActiveDataProvider } from '..';
const ormAdapter = Application.getORMAdapter();
const ORMModel = ormAdapter.extendableModelClass();
/**
 * Model is the base class for classes representing relational data in terms of objects.
 *
 * Model extends from your ORM's Model native model class(eg:- for Sequelize, `sequelize.Model`) and hence
 * have all the features and behaviors included in the ORM's model class.
 *
 * As an example, say that the `Customer` Model class is associated with the `customer` table.
 * This would mean that the class's `name` attribute is automatically mapped to the `name` column in `customer` table.
 * Thanks to Model, assuming the variable `customer` is an object of type `Customer`, to get the value of
 * the `name` column for the table row, you can use the expression `customer.name`.
 * In this example, Model is providing an object-oriented interface for accessing data stored in the database.
 * But Model provides much more functionality than this.
 *
 * All the models used for Pwoli components should be extended from [[Model]]
 *
 * To declare a Model class you need to extend [[Model]]
 *
 * ```js
 * class Customer extends Model
 * {
 *      static associate() { // your model relations
 *          Customer.hasMany(Order, { as: 'orders', foreignKey: 'customerId' });
 *          ...
 *      }
 *      ...
 *      // your additional implementations here..
 *      ...
 * }
 * ```
 *
 * Important Note: If your ORM is Sequelize, you should perform additional steps like defining the model attributes and options
 * for initializing each model like below:
 * ```js
 * const attributes = {
 *    id: {
 *        type: DataTypes.INTEGER,
 *        allowNull: false,
 *        defaultValue: null,
 *        primaryKey: true,
 *        autoIncrement: true,
 *    email: {
 *        type: DataTypes.STRING(255),
 *        allowNull: false,
 *        defaultValue: null,
 *        primaryKey: false,
 *        autoIncrement: false,
 *        comment: null,
 *        field: 'email',
 *        validate: {
 *            isEmail: { msg: "Please enter a valid Email" },
 *        },
 *    ...
 *    },
 *   };
 *   const options = {
 *        tableName: 'Customer',
 *        comment: '',
 *        sequelize,
 *        hooks: {},
 *   };
 *   Customer.init(eventAttributes, eventOptions);
 *   Customer.associate(); //for associating relations like `hasOne`, `hasMany` etc.
 *```
 *
 * Class instances are obtained in one of two ways:
 *
 * * Using the `new` operator to create a new, empty object
 * * Using a method to fetch an existing record (or records) from the database
 *
 * Below is an example showing some typical usage of Model:
 *
 * ```js
 * let user = new User();
 * user.name = 'Mahesh';
 * await user.save();  // a new row is inserted into user table
 *
 * // the following will retrieve the user 'Mahesh' from the database
 * let user = await User.findOne({where: {name: 'Mahesh'});
 *
 * // this will get related records from orders table when relation is defined. Please note that you need to `include` the required relations like below:
 * let user = await User.findOne({where: {name: 'Mahesh'}, include: [{ model: Order, as: 'orders' }]);
 * let orders = user.orders;
 * ```
 * If your ORM is Sequelize, please refer <https://sequelize.org/master/manual/model-basics.html>
 *
 * @author Mahesh S Warrier <https://github.com/codespede>
 */
export default class Model extends ORMModel {
    static init;
    /**
     * Validation errors (attribute name => array of errors)
     */
    public _errors: { [key: string]: any } = {};
    /**
     * Attribute labels are mainly used for display purpose. For example, given an attribute
     * `firstName`, we can declare a label `First Name` which is more user-friendly and can
     * be displayed to end users.
     * Eg:-
     * ```js
     * export class Event extends Model {
     *   getAttributeLabels() {
     *      return {
     *          firstName: 'First Name',
     *          ...
     *      }
     *   };
     * ```
     */
    public getAttributeLabels: () => { [key: string]: string } = () => ({});
    /**
     * Attribute hints are mainly used for display purpose. For example, given an attribute
     * `isPublic`, we can declare a hint `Whether the post should be visible for not logged in users`,
     * which provides user-friendly description of the attribute meaning and can be displayed to end users.
     * Eg:-
     * ```js
     * export class Event extends Model {
     *   getAttributeHints() {
     *      return {
     *          firstName: 'First Name',
     *          ...
     *      }
     *   };
     * ```
     */
    protected getAttributeHints: () => { [key: string]: string } = () => ({});
    
    public constructor(config: { [key: string]: any } = {}) {
        super(config);
        Object.assign(this, config);
    }

    /**
     * Returns the text label for the specified attribute.
     * If the attribute looks like `relatedModel.attribute`, then the attribute will be received from the related model.
     * @param attribute the attribute name
     * @return the attribute label
     * @see [[attributeLabels]]
     */
    public getAttributeLabel(attribute: string): string {
        return this.getAttributeLabels?.()?.[attribute] !== undefined
            ? this.getAttributeLabels()[attribute]
            : Inflector.humanize(attribute);
    }
    /**
     * Returns the primary key for this Model class.
     * By default, this returns `id`
     */
    public static primaryKey(): string {
        return 'id';
    }
    /**
     * Returns the form name that this model class should use.
     *
     * The form name is mainly used by [[ActiveForm]] to determine how to name
     * the input fields for the attributes in a model. If the form name is "A" and an attribute
     * name is "b", then the corresponding input name would be "A[b]". If the form name is
     * an empty string, then the input name would be "b".
     *
     * The purpose of the above naming schema is that for forms which contain multiple different models,
     * the attributes of each model are grouped in sub-arrays of the POST-data and it is easier to
     * differentiate between them.
     *
     * By default, this method returns the model class name as the form name.
     * You may override it when the model is used in different forms.
     *
     * @return the form name of this model class.
     * @see [[load]]
     */
    public getFormName(): string {
        return (this.constructor as any).modelName || this.constructor.name;
    }
    /**
     * Populates the model with input data.
     *
     * This method provides a convenient shortcut for:
     *
     * ```js
     * if (request.body['FormName]) {
     *     model.setAttributeValues(request.body['FormName]);
     *     if (model.save()) {
     *         // handle success
     *     }
     * }
     * ```
     *
     * which, with `load()` can be written as:
     *
     * ```js
     * if (model.load(request.body) && model.save()) {
     *     // handle success
     * }
     * ```
     *
     * `load()` gets the `'FormName'` from the model's [[getFormName]] method (which you may override), unless the
     * `$formName` parameter is given. If the form name is empty, `load()` populates the model with the whole of `data`,
     * instead of `data['FormName']`.
     *
     * Note, that the data being populated is subject to the safety check by [[setAttributeValues]].
     *
     * @param array $data the data array to load, typically `$_POST` or `$_GET`.
     * @param string|null $formName the form name to use to load the data into the model, empty string when form not use.
     * If not set, [[getFormName]] is used.
     * @return whether `load()` found the expected form in `data`.
     */
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
    /**
     * Searches the DB with the params provided.
     * @param params The search params in a key-value format like: `{ status:1, title: 'My Titile', ...}`
     * @returns the [[ActiveDataProvider]] which can provide the relevant results.
     */
    public search(params: { [key: string]: string }): ActiveDataProvider {
        this.load(params);
        ormAdapter.modelClass = this.constructor;
        return ormAdapter.search(this, params, new ActiveDataProvider({ modelClass: this.constructor }));
    }
    /**
     * Sets the attribute values in a massive way.
     * @param values attribute values (name => value) to be assigned to the model.
     */
    public setAttributeValues(values: { [key: string]: any }): Model {
        return ormAdapter.setAttributes(this, values);
    }
    /**
     * Returns the first error of the specified attribute.
     * @param string attribute name.
     * @return the error message. Null is returned if no error.
     */
    public getFirstError(attribute: string): string | null {
        return this._errors?.[attribute] !== undefined ? this._errors?.[attribute] : null;
    }
    /**
     * Returns the text hint for the specified attribute.
     * @param $attribute the attribute name
     * @return string the attribute hint
     * @see [[attributeHints]]
     * @since 2.0.4
     */
    public getAttributeHint(attribute): string {
        let hints = this.getAttributeHints?.();
        return hints?.[attribute] !== undefined ? hints?.[attribute] : '';
    }
    /**
     * Returns a value indicating whether the attribute is required.
     *
     * @param string attribute name
     * @return whether the attribute is required
     */
    public isAttributeRequired(attribute: string): boolean {
        return ormAdapter.isAttributeRequired(this, attribute);
    }
    /**
     * Returns a value indicating whether there is any validation error.
     * @param attribute name. Use null to check all attributes.
     * @return whether there is any error.
     */
    public hasErrors(attribute: string | null = null): boolean {
        return attribute === null ? Object.keys(this._errors).length > 0 : this._errors?.[attribute] !== undefined;
    }
    /**
     * Returns the attribute names that are subject to validation in the current scenario.
     * @return active attribute names
     */
    public activeAttributes(): string[] {
        return ormAdapter.activeAttributes(this);
    }
    /**
     * Returns the validators applicable.
     * @param the name of the attribute whose applicable validators should be returned.
     * If this is null, the validators for ALL attributes in the model will be returned.
     * @return the validators applicable.
     */
    public getActiveValidators(attribute: string | null = null): { [key: string]: any } {
        const ormValidators = ormAdapter.getActiveValidators(this, attribute);
        const validators = {};
        for (let validator in ormValidators) {
            if (ormAdapter.validatorMap[validator] !== undefined)
                validators[ormAdapter.validatorMap[validator]] = ormValidators[validator];
        }
        return validators;
    }
    /**
     * Performs the data validation.
     *
     * This method executes the validation rules.
     * Errors found during the validation can be retrieved via [[Model._errors]]
     * and [[getFirstError()]].
     *
     * @param attributeNames attribute name or list of attribute names
     * that should be validated. If this parameter is empty, it means any attribute listed in
     * the applicable validation rules should be validated.
     * @param clearErrors whether to call [[clearErrors]] before performing validation
     * @return whether the validation is successful without any error.
     */
    public async verify(attributeNames: string[] | null = null, clearErrors = true): Promise<boolean> {
        if (clearErrors) this.clearErrors();
        if (attributeNames === null) attributeNames = this.activeAttributes();
        await ormAdapter.validate(this);
        //
        return !this.hasErrors();
    }
    /**
     * Removes errors for all attributes or a single attribute.
     * @param attribute attribute name. Use null to remove errors for all attributes.
     */
    public clearErrors(attribute: string | null = null) {
        if (attribute === null) this._errors = {};
        else delete this._errors?.[attribute];
    }
}
