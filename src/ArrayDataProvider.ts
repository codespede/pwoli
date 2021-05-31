import { DataHelper, DataProvider } from '.';

export default class ArrayDataProvider extends DataProvider {

    public key;
    public allModels;
    public modelClass;

    public prepareModels()
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

    public prepareKeys(models)
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

    public async prepareTotalCount() {
        return new Promise<number>((resolve) => { resolve(Array.isArray(this.allModels) ? this.allModels.length : 0); });
    }

    protected sortModels(models, sort)
    {
        const orders = sort.getOrders();
        if (orders.length > 0)
            DataHelper.multisort(models, Object.keys(orders), orders, sort.sortFlags);
        return models;
    }
  
    public constructor(config) {
      super(config);
      Object.assign(this, config);
    }
}
