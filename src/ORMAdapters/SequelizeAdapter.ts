import IORMAdapter from "./IORMAdapter";
import ORMAdapter from "./ORMAdapter";
export default class SequelizeAdapter extends ORMAdapter implements IORMAdapter{
    
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
}
