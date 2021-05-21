import Application from "../Application";
import Component from "../Component";
import IORMAdapter from "./IORMAdapter";
export default class ORMAdapter extends Component implements IORMAdapter {
    public modelClass;

    public async findAll(query) {
        return [];
    }

    public applySort(query, sort) {
        return query;
    }

    public applyPagination(query, pagination) {
        return query;
    }

    public primaryKey() {
        return 'id';
    }

    public async count(query) {
        return 0;
    }

    public attributes() {
        return [];
    }

    public extendableModelClass() {
        console.log('app obj', Application);
        if (Application.ormModelClass === undefined)
            throw new Error("'Application.ormModelClass' should be set.");
        return Application.ormModelClass;
    }

}
