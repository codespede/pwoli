import { Pagination, Sort } from "../";
import Component from "../Component";
import Model from "../Model";

export default interface IORMAdapter extends Component{
    modelClass: Model;
    findAll<T extends {}>(query: T): Promise<Model[]>;
    applySort<T extends {}>(query: T, sort: Sort): T;
    applyPagination<T extends {}>(query: T, pagination: Pagination): T;
    primaryKey(): string;
    count<T extends {}>(query: T): Promise<number>;
    attributes(): string[];
}
