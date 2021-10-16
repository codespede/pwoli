import Model from './Model';
import Component from './Component';
import Pagination from './Pagination';
import Sort from './Sort';

export default class DataProvider extends Component {
    private static counter = 0;
    public id: string;
    private _sort;
    private _pagination;
    private _models: Model[] = [];
    private _keys: string[] | void = [];
    private _totalCount: number;
    public modelClass: Model;
    public totalCountPromise: Promise<number>;

    public constructor(config) {
        super(config);
        Object.assign(this, config);
    }

    public async init() {
        await super.init.call(this);
        if (this.id === null) {
        if (DataProvider.counter > 0) this.id = `dp-${DataProvider.counter}`;
        DataProvider.counter++;
        }
    }

    public async prepare(forcePrepare = false) {
        if (forcePrepare || this._models.length === 0) {
        this._models = await this.prepareModels();
        }
        if (forcePrepare || (this._keys as Array<string>).length === 0) {
        this._keys = this.prepareKeys(this._models);
        }
    }

    public prepareKeys(models: Model[]) {
        
    }

    public async prepareModels(): Promise<Model[]> {
        return new Promise<Model[]>((resolve, reject) => { });
    }

    public async prepareTotalCount(): Promise<number> {
        return 0;
    }

    public async getModels(): Promise<Model[]> {
        await this.prepare();
        return this._models;
    }

    public setModels(models: Model[]) {
        this._models = models;
    }

    public getKeys() {
        return this._keys;
    }

    public getCount() {
        return this._models.length;
    }

    public async getTotalCount() {
        if (this._totalCount === undefined)
        this._totalCount = await this.prepareTotalCount();
        
        return this._totalCount;
    }

    public setTotalCount(value: number) {
        this._totalCount = value;
    }

    public getPagination() {
        if (this._pagination === undefined)
            this.setPagination({});
        return this._pagination;
    }

    public setPagination(value) {
        if (value instanceof Pagination || value === false)
            this._pagination = value;
        else
            this._pagination = new Pagination(value);
    }

    public getSort() {
        if (this._sort === undefined) this.setSort([]);
        return this._sort;
    }

    public setSort(value) {
        if (value instanceof Sort || value === false) this._sort = value;
        else {
        const config: any = {};
        
        if (this.id !== undefined) config.sortParam = `${this.id}-sort`;
        this._sort = new Sort({ ...value, ...config });
        // this._sort.enableMultiSort = true;
        }
    }

    public refresh() {
        this._totalCount = null;
        this._models = null;
        this._keys = null;
    }
}
