import Model from '../base/Model';
import Component from '../base/Component';
import Pagination from './Pagination';
import Sort from './Sort';

export default class DataProvider extends Component {
    /**
     * Number of data providers on the current page. Used to generate unique IDs.
     */
    private static counter = 0;
    /**
     * An ID that uniquely identifies the data provider among all data providers.
     * Generated automatically the following way in case it is not set:
     *
     * - First data provider ID is empty.
     * - Second and all subsequent data provider IDs are: "dp-1", "dp-2", etc.
     */
    public id: string;
    private _sort;
    private _pagination;
    private _models: Model[] = [];
    private _keys: string[] | void = [];
    private _totalCount: number;
    /**
     * Model Class which can be used for resolving Attribute Labels, Hints etc.
     */
    public modelClass: Model | undefined;
    /**
     * Promise which resolves to the number matching records for the current query.
     */
    public totalCountPromise: Promise<number>;
    public constructor(config) {
        super(config);
        Object.assign(this, config);
    }
    /** @inheritdoc */
    public async init() {
        await super.init.call(this);
        if (this.id === null) {
        if (DataProvider.counter > 0) this.id = `dp-${DataProvider.counter}`;
        DataProvider.counter++;
        }
    }
    /**
     * Prepares the data models and keys.
     *
     * This method will prepare the data models and keys that can be retrieved via
     * [[getModels]] and [[getKeys]].
     *
     * This method will be implicitly called by [[getModels]] and [[getKeys]] if it has not been called before.
     *
     * @param forcePrepare whether to force data preparation even if it has been done before.
     */
    public async prepare(forcePrepare = false) {
        if (forcePrepare || this._models.length === 0) {
        this._models = await this.prepareModels();
        }
        if (forcePrepare || (this._keys as Array<string>).length === 0) {
        this._keys = this.prepareKeys(this._models);
        }
    }
    /**
     * Prepares the keys associated with the currently available data models.
     * @param models the available data models
     * @return the keys
     */
    public prepareKeys(models: Model[]) {}
    /**
     * Prepares the data models that will be made available in the current page.
     * @return the available data models
     */
    public async prepareModels(): Promise<Model[]> {
        return new Promise<Model[]>((resolve, reject) => {});
    }
    /**
     * Returns a value indicating the total number of data models in this data provider.
     * @return total number of data models in this data provider.
     */
    public async prepareTotalCount(): Promise<number> {
        return 0;
    }
    /**
     * Returns the data models in the current page.
     * @return the list of data models in the current page.
     */
    public async getModels(): Promise<Model[]> {
        await this.prepare();
        return this._models;
    }
    /**
     * Sets the data models in the current page.
     * @param models the models in the current page
     */
    public setModels(models: Model[]) {
        this._models = models;
    }
    /**
     * Returns the key values associated with the data models.
     * @return the list of key values corresponding to [[models]]. Each data model in [[models]]
     * is uniquely identified by the corresponding key value in this array.
     */
    public getKeys() {
        return this._keys;
    }
    /**
     * Returns the number of data models in the current page.
     * @return the number of data models in the current page.
     */
    public getCount() {
        return this._models.length;
    }
    /**
     * Returns the total number of data models.
     * When [[pagination]] is false, this returns the same value as [[count]].
     * Otherwise, it will call [[prepareTotalCount]] to get the count.
     * @return total number of possible data models.
     */
    public async getTotalCount() {
        if (this._totalCount === undefined) this._totalCount = await this.prepareTotalCount();
        return this._totalCount;
    }
    /**
     * Sets the total number of data models.
     * @param value the total number of data models.
     */
    public setTotalCount(value: number) {
        this._totalCount = value;
    }
    /**
     * Returns the pagination object used by this data provider.
     * Note that you should call [[prepare]] or [[getModels]] first to get correct values
     * of [[Pagination.totalCount]] and [[Pagination::pageCount]].
     * @return the pagination object. If this is false, it means the pagination is disabled.
     */
    public getPagination() {
        if (this._pagination === undefined) this.setPagination({});
        return this._pagination;
    }
    /**
     * Sets the pagination for this data provider.
     * @param value the pagination to be used by this data provider.
     * This can be one of the following:
     *
     * - a configuration array for creating the pagination object. The "class" element defaults
     *   to [[Pagination]]
     * - an instance of [[Pagination]] or its subclass
     * - false, if pagination needs to be disabled.
     */
    public setPagination(value) {
        if (value instanceof Pagination || value === false) this._pagination = value;
        else this._pagination = new Pagination(value);
    }
    /**
     * Returns the sorting object used by this data provider.
     * @return the sorting object. If this is false, it means the sorting is disabled.
     */
    public getSort() {
        if (this._sort === undefined) this.setSort([]);
        return this._sort;
    }
    /**
     * Sets the sort definition for this data provider.
     * @param value the sort definition to be used by this data provider.
     * This can be one of the following:
     *
     * - a configuration array for creating the sort definition object. The "class" element defaults
     *   to 'yii\data\Sort'
     * - an instance of [[Sort]] or its subclass
     * - false, if sorting needs to be disabled.
     */
    public setSort(value) {
        if (value instanceof Sort || value === false) this._sort = value;
        else {
            const config: any = {};
            if (this.id !== undefined) config.sortParam = `${this.id}-sort`;
            this._sort = new Sort({ ...value, ...config });
        }
    }
    /**
     * Refreshes the data provider.
     * After calling this method, if [[getModels]], [[getKeys]] or [[getTotalCount]] is called again,
     * they will re-execute the query and return the latest data available.
     */
    public refresh() {
        this._totalCount = null;
        this._models = null;
        this._keys = null;
    }
}
