import { ActiveDataProvider, Pagination, Sort } from '..';
import Component from '../base/Component';
import Model from '../base/Model';

export default interface IORMAdapter extends Component {
  modelClass: Model;
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
