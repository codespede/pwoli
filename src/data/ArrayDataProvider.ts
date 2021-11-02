import DataProvider from './DataProvider';
import DataHelper from '../helpers/DataHelper';
import Model from '../base/Model';
import Sort from './Sort';
export default class ArrayDataProvider extends DataProvider {

    public key: string | CallableFunction;
    public allModels: Model[];
    public modelClass: Model;

    public async prepareModels(): Promise<Model[]>
    {
        let models = this.allModels;
        if (models === undefined) {
            return [];
        }
        const sort = this.getSort();
        if (sort !== false) {
            models = this.sortModels(models, sort);
        }
        const pagination = this.getPagination();
        if (pagination !== false) {
            pagination.totalCount = this.getTotalCount();

            if (pagination.getPageSize() > 0)
                models = models.slice(pagination.getOffset(), pagination.getLimit());
        }
        return models;
    }

    public prepareKeys(models: Model[]): string[]
    {
        if (this.key !== null) {
            const keys = [];
            for(let model of models) {
                if (typeof this.key === 'string') {
                    keys.push(model[this.key]);
                } else {
                    keys.push(this.key(model));
                }
            }
            return keys;
        }

        return Object.keys(models);
    }

    public async prepareTotalCount(): Promise<number> {
        return new Promise<number>((resolve) => { resolve(Array.isArray(this.allModels) ? this.allModels.length : 0); });
    }

    protected sortModels(models: Model[], sort: Sort): Model[]
    {
        const orders = sort.getOrders();
        if (orders.length > 0)
            DataHelper.multiSort(models, Object.keys(orders), orders, sort.sortFlags);
        return models;
    }
  
    public constructor(config: {[key: string]: any}) {
      super(config);
      Object.assign(this, config);
    }
}
