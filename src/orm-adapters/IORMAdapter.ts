import { ActiveDataProvider, Pagination, Sort } from '..';
import Component from '../base/Component';
import Model from '../base/Model';
/**
 * Every ORM Adapter created for Pwoli must implement this interface as these are the set of properties and methods
 * required for Pwoli's ORM related operations.
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
     */
    validatorMap: { [key: string]: string };
    
    findAll(query: { [key: string]: any }): Promise<Model[]>;
    applySort(query: { [key: string]: any }, sort: Sort): { [key: string]: any };
    applyPagination(query: { [key: string]: any }, pagination): { [key: string]: any };
    primaryKey(): string;
    count<T extends {}>(query: T): Promise<number>;
    attributes(): string[];
    setAttributes(model: Model, values: { [key: string]: any }): Model;
    search(model: Model, params: { [key: string]: any }, dataProvider: ActiveDataProvider): ActiveDataProvider;
    isAttributeRequired(model: Model, attribute: string): boolean;
    activeAttributes(model: Model): string[];
    isAttributeActive(model: Model, attribute: string): boolean;
    getActiveValidators(model: Model, attribute: string): Array<{ [key: string]: any }>;
    getClientValidationParams(criteria: boolean | { [key: string]: any }): { [key: string]: any };
    validate(model: Model): Promise<Model>;
}
