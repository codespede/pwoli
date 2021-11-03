import DataProvider from './DataProvider';
import DataHelper from '../helpers/DataHelper';
import Model from '../base/Model';
import Sort from './Sort';
/**
 * ArrayDataProvider implements a data provider based on a data array.
 *
 * The [[allModels]] property contains all data models that may be sorted and/or paginated.
 * ArrayDataProvider will provide the data after sorting and/or pagination.
 * You may configure the [[sort]] and [[pagination]] properties to
 * customize the sorting and pagination behaviors.
 *
 * Elements in the [[allModels]] array may be either objects (e.g. model objects)
 * or associative arrays (e.g. query results of DAO).
 * Make sure to set the [[key]] property to the name of the field that uniquely
 * identifies a data record or false if you do not have such a field.
 *
 * Compared to [[ActiveDataProvider]], ArrayDataProvider could be less efficient
 * because it needs to have [[allModels]] ready.
 *
 * ArrayDataProvider may be used in the following way:
 *
 * ```js
 * provider = new ArrayDataProvider({
 *     allModels: Post.findAll({ where: { companyId: 123 } }),
 *     sort: [
 *         attributes: ['id', 'username', 'email'],
 *     ],
 *     pagination: {
 *         pageSize: 10,
 *     },
 * });
 * // get the posts in the current page
 * posts = provider.getModels();
 * ```
 *
 * Note: if you want to use the sorting feature, you must configure the [[sort]] property
 * so that the provider knows which columns can be sorted.
 *
 * For more details and usage information on ArrayDataProvider, see the [guide article on data providers](guide:output-data-providers).
 *
 * @author Mahesh S Warrier <https://github.com/codespede>
 */
export default class ArrayDataProvider extends DataProvider {
    /**
     * The column that is used as the key of the data models.
     * This can be either a column name, or a callback that returns the key value of a given data model.
     * If this is not set, the index of the [[models]] array will be used.
     * @see [[getKeys]]
     */
    public key: string | CallableFunction;
    /**
     * The data that is not paginated or sorted. When pagination is enabled,
     * this property usually contains more elements than [[models]].
     * The array elements must use zero-based integer keys.
     */
    public allModels: Model[];
    /**
     * {@inheritdoc}
     */
    public async prepareModels(): Promise<Model[]> {
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
            if (pagination.getPageSize() > 0) models = models.slice(pagination.getOffset(), pagination.getLimit());
        }
        return models;
    }
    /**
     * {@inheritdoc}
     */
    public prepareKeys(models: Model[]): string[] {
        if (this.key !== null) {
            const keys = [];
            for (let model of models) {
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
    /**
     * {@inheritdoc}
     */
    public async prepareTotalCount(): Promise<number> {
        return new Promise<number>((resolve) => {
        resolve(Array.isArray(this.allModels) ? this.allModels.length : 0);
        });
    }
    /**
     * Sorts the data models according to the given sort definition.
     * @param models the models to be sorted
     * @param sort the sort definition
     * @return the sorted data models
     */
    protected sortModels(models: Model[], sort: Sort): Model[] {
        const orders = sort.getOrders();
        if (orders.length > 0) DataHelper.multiSort(models, Object.keys(orders), orders, sort.sortFlags);
        return models;
    }

    public constructor(config: { [key: string]: any }) {
        super(config);
        Object.assign(this, config);
    }
}
