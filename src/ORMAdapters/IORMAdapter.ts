import { Pagination, Sort } from "../";
import Component from "../Component";
import Model from "../Model";

export default interface IORMAdapter extends Component{
    modelClass: Model;
    findAll(query: { [key: string]: any }): Promise<Model[]>;
    applySort(query: { [key: string]: any }, sort: Sort): { [key: string]: any }
    applyPagination(query: { [key: string]: any }, pagination): { [key: string]: any };
    primaryKey(): string;
    count<T extends {}>(query: T): Promise<number>;
    attributes(): string[];
}
