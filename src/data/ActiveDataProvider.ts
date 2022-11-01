import Application from '../base/Application';
import DataProvider from './DataProvider';

/**
 * ActiveDataProvider implements a data provider based on db queries.
 *
 * ActiveDataProvider provides real time data by performing DB queries using [[query]].
 *
 * The following is an example of using ActiveDataProvider to provide ActiveRecord instances:
 *
 * ```js
 * let provider = new ActiveDataProvider({
 *     modelClass: Post,
 *     query: { where: { companyId: 123 } },
 *     pagination: {
 *         pageSize: 20,
 *     },
 * });
 *
 * // get the posts in the current page
 * let posts = provider.getModels();
 * ```
 *
 * For more details and usage information on ActiveDataProvider, see the [guide article on data providers](guide:output-data-providers).
 *
 * @author Mahesh S Warrier <https://github.com/codespede>
 */
export default class ActiveDataProvider extends DataProvider {
    /**
     * the query that is used to fetch data models and [[totalCount]] if it is not explicitly set.
     * This structure of this property depends upon the ORM being used.
     * Example for Sequelize:
     * let provider = new ActiveDataProvider({
     *    modelClass: Post,
     *    query: {
     *        where: {
     *            companyId: 123
     *            createdDate: {[Op.lte]: Date.now() //createdDate less than or equal to now.
     *        }
     *    }
     * });
     * provider.getModels(); // returns the models matching the current query.
     */
    public query: { [key: string]: any } = {};
    /**
     * The column that is used as the key of the data models.
     * This can be a column name that returns the key value of a given data model.
     *
     * If this is not set, the primary keys of [[modelClass]] will be used.
     *
     * @see [[getKeys]]
     */
    public key: string;
    /**
     * Th adapter for the ORM which is being used for the Application.
     * eg:- [[SequelizeAdapter]]
     */
    public ormAdapter;

    public constructor(config) {
        super(config);
        Object.assign(this, config);
    }
    /**
     * Initializes the ORM Adapter.
     * This method will initialize the [[ormAdapter]] property (when set) to make sure it refers to a valid ORM Adapter.
     */
    public async init() {
        if (this.ormAdapter === undefined) {
            this.ormAdapter = Application.getORMAdapter();
            this.ormAdapter.modelClass = this.modelClass;
        }
        await super.init.call(this);
    }
    /** @inheritdoc */
    public async prepareModels() {
        const pagination = this.getPagination();
        if (pagination !== false) {
            this.totalCountPromise = this.getTotalCount();
            pagination.totalCount = await this.totalCountPromise;

            if (pagination.totalCount === 0) return [];
            this.query.limit = pagination.getLimit();
            this.query.offset = pagination.getOffset();
            this.setPagination(pagination);
        }
        const sort = this.getSort();
        if (sort !== false && sort.getOrders().length > 0) this.query = this.ormAdapter.applySort(this.query, sort);
        return await this.ormAdapter.findAll(this.query);
    }
    /** @inheritdoc */
    public prepareKeys(models) {
        const keys = [];
        const modelPK = this.ormAdapter.primaryKey();
        if (this.key !== undefined) {
            for (const model of models) keys.push(model[this.key]);
        } else if (modelPK !== undefined) for (const model of models) keys.push(model[modelPK]);
        return keys;
    }
    /** @inheritdoc */
    public async prepareTotalCount() {
        const totalCount = await this.ormAdapter.count(this.query);

        return totalCount;
    }
    /** @inheritdoc */
    public setSort(value) {
        super.setSort.call(this, value);
        const sort = this.getSort();
        if (sort !== false) {
            const model = new (this.modelClass as any)();

            if (Object.keys(sort.attributes).length === 0) {
                const attributes = this.ormAdapter.allAttributes !== undefined? this.ormAdapter.allAttributes(model) : this.ormAdapter.attributes();
                for (const attribute of attributes) {
                    sort.attributes[attribute] = {
                        asc: [attribute, 'asc'],
                        desc: [attribute, 'desc'],
                        label: model.getAttributeLabel(attribute),
                    };
                }
            } else {
                for (const attribute in sort.attributes) {
                    if (sort.attributes[attribute].label === undefined)
                        sort.attributes[attribute].label = model.getAttributeLabel(attribute);
                }
            }
        }
    }
}
