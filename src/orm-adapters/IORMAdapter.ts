import { ActiveDataProvider, Pagination, Sort } from '..';
import Component from '../base/Component';
import Model from '../base/Model';
/**
 * An ORM Adapter defines how Pwoli should interact between that ORM for which this ORMAdapter is implemented.
 * 
 * Every ORM Adapter created for Pwoli must implement this interface as these are the set of properties and methods
 * required for Pwoli's DB related operations.
 * 
 * @author Mahesh S Warrier <https://github.com/codespede>
 */
export default interface IORMAdapter extends Component {
    /**
     * The base Model class of the ORM.
     */
    modelClass: Model;
    /**
     * This is the object which is used to map the validators in the ORM with the client side validators in Pwoli.
     * Keys of this object are the validator string for the ORM and the values are the corresponding validators in Pwoli.
     * This is used by assets/js/activeForm.js
     */
    validatorMap: { [key: string]: string };
    /**
     * A record finder which returns all the Models based on the query provided.
     * This is used by [[ActiveDataProvider]].
     * @param query The DB query to match records. See [[ActiveDataProvider.query]]
     * @return A Promise which resolves to the Models found.
     */
    findAll(query: { [key: string]: any }): Promise<Model[]>;
    /**
     * This method applies the current request's sort requirements.
     * This is used by [[ActiveDataProvider]].
     * @param query The DB query used.
     * @param sort The [[Sort]] object being used.
     * @return The query object after sorting is applied.
     */
    applySort(query: { [key: string]: any }, sort: Sort): { [key: string]: any };
    /**
     * This method applies the current request's pagination requirements.
     * This is used by [[ActiveDataProvider]].
     * @param query The DB query used.
     * @param sort The [[Pagination]] object being used.
     * @return The query object after pagination is applied.
     */
    applyPagination(query: { [key: string]: any }, pagination): { [key: string]: any };
    /**
     * The primary key for the model being used.
     */
    primaryKey(): string;
    /**
     * Returns the count of records based on the query provided.
     * @param query The DB query,
     * @return A Promise which resolves to the number of records found.
     */
    count<T extends {}>(query: T): Promise<number>;
    /**
     * The attributes list of the current Model.
     * @return The attributes list as an array.
     */
    attributes(): string[];
    /**
     * Sets attributes to the Model provided
     * @param model The Model to which attributes are to be set.
     * @param values An object containing the attributes and values to be set. Eg:- { name: 'Mahesh', gender: 'Male' }
     * @return The Model itself after the attributes are set.
     */
    setAttributes(model: Model, values: { [key: string]: any }): Model;
    /**
     * Returns the [[ActiveDataProvider]] in which the required search conditions are set for the given params.
     * @param model The Model in which search is to be performed.
     * @param params The search params.
     * @param dataProvider The [[ActiveDataProvider]] to which the required search conditions are to be set.
     * @return The [[ActiveDataProvider]] with the search conditions set.
     */
    search(model: Model, params: { [key: string]: any }, dataProvider: ActiveDataProvider): ActiveDataProvider;
    /**
     * Checks whether a given attribute is required for a Model
     * @param model The Model in which the check is to be performed.
     * @param attribute The attribute to be checked.
     */
    isAttributeRequired(model: Model, attribute: string): boolean;
    /**
     * The list of active attributes in a Model.
     * @see [[isAttributeActive]]
     * @param model 
     */
    activeAttributes(model: Model): string[];
    /**
     * Checks whether the given attribute is an active attribute in the given Model.
     * Active attributes are attributes for which at-least a single validation rule is applied.
     * @param model The Model in which the check is to be performed.
     * @param attribute The attribute to be checked.
     */
    isAttributeActive(model: Model, attribute: string): boolean;
    /**
     * Returns the active validators for the given attribute in the given Model.
     * @param model The Model to be checked.
     * @param attribute The attribute to be checked.
     */
    getActiveValidators(model: Model, attribute: string): Array<{ [key: string]: any }>;
    /**
     * Returns the params required for Client Validation
     * @param criteria Either false(meaning no validation to be performed) or an object which contains the `message'
     * and `args` for client validation done by assets/js/activeForm.js
     * Eg:- { msg: 'Invalid value', args: {...}}
     * For more information on this, please refer [[ActiveField.clientValidators]]
     */
    getClientValidationParams(criteria: boolean | { [key: string]: any }): { [key: string]: any };
    /**
     * This method validates the given Model with the validation rules set inside it.
     * The results of the validation will be stored in [Model._errors].
     * If this is an empty array, it can be considered that the validation has passed.
     * @param model The Model in which validation is to be performed.
     */
    validate(model: Model): Promise<Model>;
}
