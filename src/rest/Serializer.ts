import Component from '../base/Component';
import DataHelper from '../helpers/DataHelper';
import DataProvider from '../data/DataProvider';
import Pwoli from '../base/Application';
import Model from '../base/Model';
import Pagination from '../data/Pagination';
import url = require('url');
/**
 * Serializer converts resource objects and collections into array representation.
 *
 * Serializer is mainly used by REST controllers to convert different objects into array representation
 * so that they can be further turned into different formats, such as JSON, XML, by response formatters.
 *
 * The default implementation handles resources as [[Model]] objects and collections as objects
 * implementing [[DataProviderInterface]]. You may override [[serialize()]] to handle more types.
 *
 * @author Mahesh S Warrier <https://github.com/codespede>
 */
export default class Serializer extends Component {
    /**
     * @var string the name of the query parameter containing the information about which fields should be returned
     * for a [[Model]] object. If the parameter is not provided or empty, the default set of fields as defined
     * by [[Model.fields()]] will be returned.
     */
    public fieldsParam = 'fields';
    /**
     * @var string the name of the query parameter containing the information about which fields should be returned
     * in addition to those listed in [[fieldsParam]] for a resource object.
     */
    public expandParam = 'expand';
    /**
     * @var string the name of the HTTP header containing the information about total number of data items.
     * This is used when serving a resource collection with pagination.
     */
    public totalCountHeader = 'X-Pagination-Total-Count';
    /**
     * @var string the name of the HTTP header containing the information about total number of pages of data.
     * This is used when serving a resource collection with pagination.
     */
    public pageCountHeader = 'X-Pagination-Page-Count';
    /**
     * @var string the name of the HTTP header containing the information about the current page number (1-based).
     * This is used when serving a resource collection with pagination.
     */
    public currentPageHeader = 'X-Pagination-Current-Page';
    /**
     * @var string the name of the HTTP header containing the information about the number of data items in each page.
     * This is used when serving a resource collection with pagination.
     */
    public perPageHeader = 'X-Pagination-Per-Page';
    /**
     * @var string the name of the envelope (e.g. `items`) for returning the resource objects in a collection.
     * This is used when serving a resource collection. When this is set and pagination is enabled, the serializer
     * will return a collection in the following format:
     *
     * ```php
     * [
     *     'items' => [...],  // assuming collectionEnvelope is "items"
     *     '_links' => {  // pagination links as returned by Pagination::getLinks()
     *         'self' => '...',
     *         'next' => '...',
     *         'last' => '...',
     *     },
     *     '_meta' => {  // meta information as returned by Pagination::toArray()
     *         'totalCount' => 100,
     *         'pageCount' => 5,
     *         'currentPage' => 1,
     *         'perPage' => 20,
     *     },
     * ]
     * ```
     *
     * If this property is not set, the resource arrays will be directly returned without using envelope.
     * The pagination information as shown in `_links` and `_meta` can be accessed from the response HTTP headers.
     */
    public collectionEnvelope;
    /**
     * @var string the name of the envelope (e.g. `_links`) for returning the links objects.
     * It takes effect only, if `collectionEnvelope` is set.
     * @since 2.0.4
     */
    public linksEnvelope = '_links';
    /**
     * @var string the name of the envelope (e.g. `_meta`) for returning the pagination object.
     * It takes effect only, if `collectionEnvelope` is set.
     * @since 2.0.4
     */
    public metaEnvelope = '_meta';
    /**
     * The current request. If not set, [[Application.request]] will be used.
     */
    public request: { [key: string]: any };
    /**
     * The current response. If not set, [[Application.response]] will be used.
     */
    public response: { [key: string]: any };
    /**
     * Whether to preserve array keys when serializing collection data.
     * Set this to `true` to allow serialization of a collection as a JSON object where array keys are
     * used to index the model objects. The default is to serialize all collections as array, regardless
     * of how the array is indexed.
     * @see [[serializeDataProvider]]
     */
    public preserveKeys = false;

    public constructor(config: { [key: string]: any }) {
        super(config);
        Object.assign(this, config);
    }
    /**
     * {@inheritdoc}
     */
    public async init() {
        if (this.request === undefined) {
            this.request = Pwoli.request;
        }
        if (this.response === undefined) {
            this.response = Pwoli.response;
        }
    }
    /**
     * Serializes the given data into a format that can be easily turned into other formats.
     * This method mainly converts the objects of recognized types into array representation.
     * It will not do conversion for unknown object types or non-object data.
     * The default implementation will handle [[Model]], [[DataProvider]] and Arrays.
     * You may override this method to support more object types.
     * @param data the data to be serialized.
     * @return the converted data.
     */
    public async serialize(data: Model | DataProvider | Array<any>): Promise<{ [key: string]: any }> {
        if (data.constructor.name === 'Model' && (data as Model).hasErrors()) {
            return this.serializeModelErrors(data as Model);
        } else if (data instanceof DataProvider) {
            return await this.serializeDataProvider(data);
        } else if (typeof data === 'object') {
            return this.serializeModel(data as Model);
        } else if (Array.isArray(data)) {
            let serializedObject = [];
            for (let key in data as Array<any>) serializedObject[key] = this.serialize(data[key]);
            return serializedObject;
        }
        this.response.data = data;
        return this.response;
    }
    /**
     * @return array the names of the requested fields. The first element is an array
     * representing the list of default fields requested, while the second element is
     * an array of the extra fields requested in addition to the default fields.
     * @see [[Model.fields]]
     * @see [[Model.extraFields]]
     */
    protected getRequestedFields(): { fields: string[]; expand: string[] } {
        const params = url.parse(this.request.url, true).query;
        const fields = params[this.fieldsParam];
        const expand = params[this.expandParam];

        return {
            fields: typeof fields === 'string' ? fields.split(/\s*,\s*/) : [],
            expand: typeof expand === 'string' ? expand.split(/\s*,\s*/) : [],
        };
    }
    /**
     * Serializes a data provider.
     * @param dataProvider the DataProvider to be serialized.
     * @return the array representation of the DataProvider.
     */
    protected async serializeDataProvider(dataProvider: DataProvider): Promise<{ [key: string]: any }> {
        let models;
        //console.log('sdpbb------------', await dataProvider.getModels())
        if (this.preserveKeys) models = await dataProvider.getModels();
        else models = Object.values(await dataProvider.getModels());

        models = this.serializeModels(models);
        let pagination = dataProvider.getPagination();
        if (pagination !== false) {
            this.addPaginationHeaders(pagination);
        }

        if (this.request.method === 'HEAD') {
            return null;
        } else if (this.collectionEnvelope === undefined) {
            //console.log('sdp------------', models)
            return models;
        }

        let result = {
            [this.collectionEnvelope]: models,
        };

        if (pagination !== false) {
            return { ...result, ...this.serializePagination(pagination) };
        }
        return result;
    }
    /**
     * Serializes a pagination into an array.
     * @param pagination
     * @return the array representation of the pagination
     * @see [[addPaginationHeaders]]
     */
    protected serializePagination(pagination: Pagination): { [key: string]: any } {
        return {
            [this.linksEnvelope]: DataHelper.serializeLinks(pagination.getLinks(true)),
            [this.metaEnvelope]: {
                totalCount: pagination.totalCount,
                pageCount: pagination.getPageCount(),
                currentPage: pagination.getPage() + 1,
                perPage: pagination.getPageSize(),
            },
        };
    }
    /**
     * Adds HTTP headers about the pagination to the response.
     * @param pagination
     */
    protected addPaginationHeaders(pagination: Pagination) {
        let links = [];
        let paginationLinks = pagination.getLinks(true);
        for (let rel in paginationLinks) {
            links.push(`<${paginationLinks[rel]}>; rel=${rel}`);
        }
        this.response.headers[this.totalCountHeader] = pagination.totalCount;
        this.response.headers[this.pageCountHeader] = pagination.getPageCount();
        this.response.headers[this.currentPageHeader] = pagination.getPage() + 1;
        this.response.headers[this.perPageHeader] = pagination.getPageSize();
        this.response.headers.link = links.join(', ');
    }
    /**
     * Serializes a model object.
     * @param model
     * @return the array representation of the model
     */
    protected serializeModel(model: Model): Model {
        if (this.request.method === 'HEAD') {
            return null;
        }

        const { fields, expand } = this.getRequestedFields();
        return model; //.toArray(fields, expand);
    }
    /**
     * Serializes the validation errors in a model.
     * @param model
     * @return the array representation of the errors
     */
    protected serializeModelErrors(model: Model): { [key: string]: any } {
        this.response.setStatusCode(422, 'Data Validation Failed.');
        let result = [];
        const errors = model.getFirstErrors();
        for (let name in errors) {
            result.push({
                field: name,
                message: errors[name],
            });
        }
        return result;
    }
    /**
     * Serializes a set of models.
     * @param models
     * @return the array representation of the models
     */
    protected serializeModels(models: Model[]): Model[] {
        const { fields, expand } = this.getRequestedFields();
        let i = 0;
        for (let model of models) {
            if (model.constructor.name === 'Model') {
                models[i] = model; //.toArray(fields, expand);
            }
            i++;
        }
        return models;
    }
}
