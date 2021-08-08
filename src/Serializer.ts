import Component from './Component';
import DataHelper from './DataHelper';
import DataProvider from './DataProvider';
import Pwoli from './Application';
import url = require('url');
export default class Serializer extends Component {
    public fieldsParam = 'fields';
    public expandParam = 'expand';
    public totalCountHeader = 'X-Pagination-Total-Count';
    public pageCountHeader = 'X-Pagination-Page-Count';
    public currentPageHeader = 'X-Pagination-Current-Page';
    public perPageHeader = 'X-Pagination-Per-Page';
    public collectionEnvelope;
    public linksEnvelope = '_links';
    public metaEnvelope = '_meta';
    public request;
    public response;
    public preserveKeys = false;
    
    public constructor(config) {
        super(config);
        Object.assign(this, config);
    }

    public async init()
    {
        if (this.request === null) {
            this.request = Pwoli.request;
        }
    }

    public serialize(data)
    {
        this.serializeDataProvider(data);
        if (data.constructor.name === 'Model' && data.hasErrors()) {
            return this.serializeModelErrors(data);
        } else if (typeof data === 'object') {
            return this.serializeModel(data);
        } else if (data instanceof DataProvider) {
            return this.serializeDataProvider(data);
        } else if (Array.isArray(data)) {
            let serializedObject = [];
            for(let key in data)
                serializedObject[key] = this.serialize(data[key]);
            return serializedObject;
        }
        this.response.data = data;
        return this.response;
    }

    protected getRequestedFields()
    {
        const params = url.parse(this.request.url, true).query;
        const fields = params[this.fieldsParam];
        const expand = params[this.expandParam];

        return {
            fields: typeof fields === 'string' ? fields.split(/\s*,\s*/) : [],
            expand: typeof expand === 'string' ? expand.split(/\s*,\s*/) : [],
        };
    }

    protected serializeDataProvider(dataProvider) {
        let models;
        if (this.preserveKeys)
            models = dataProvider.getModels();
        else
            models = Object.values(dataProvider.getModels());
        models = this.serializeModels(models);
        let pagination = dataProvider.getPagination()
        if (pagination !== false) {
            this.addPaginationHeaders(pagination);
        }

        if (this.request.getIsHead()) {
            return null;
        } else if (this.collectionEnvelope === undefined) {
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

    protected serializePagination(pagination)
    {
        return {
            [this.linksEnvelope]: DataHelper.serializeLinks(pagination.getLinks(true)),
            [this.metaEnvelope]: {
                'totalCount': pagination.totalCount,
                'pageCount': pagination.getPageCount(),
                'currentPage': pagination.getPage() + 1,
                'perPage': pagination.getPageSize(),
            },
        };
    }

    protected addPaginationHeaders(pagination)
    {
        let links = [];
        for(let rel in pagination.getLinks(true)) {
            links.push(`<${url}>; rel=${rel}`);
        }
        this.response.headers[this.totalCountHeader] = pagination.totalCount;
        this.response.headers[this.pageCountHeader] = pagination.getPageCount();
        this.response.headers[this.currentPageHeader] = pagination.getPage() + 1;
        this.response.headers[this.perPageHeader] = pagination.pageSize;
        this.response.headers.link = links.join(', ');
    }

    protected serializeModel(model)
    {
        if (this.request.getIsHead()) {
            return null;
        }

        const { fields, expand } = this.getRequestedFields();
        return model.toArray(fields, expand);
    }

    protected serializeModelErrors(model)
    {
        this.response.setStatusCode(422, 'Data Validation Failed.');
        let result = [];
        const errors = model.getFirstErrors();
        for(let name in errors) {
            result.push({
                field: name,
                message: errors[name]
            });
        }
        return result;
    }

    protected serializeModels(models)
    {
        const { fields, expand } = this.getRequestedFields();
        let i = 0;
        for(let model of models) {
            if (model.constructor.name === 'Model') {
                models[i] = model.toArray(fields, expand);
            }
            i++;
        }
        return models;
    }
}
