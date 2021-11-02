import Component from '../base/Component';
import DataHelper from '../helpers/DataHelper';
import DataProvider from '../data/DataProvider';
import Pwoli from '../base/Application';
import Model from '../base/Model';
import Pagination from '../data/Pagination';
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
    public request: { [key: string]: any };
    public response: { [key: string]: any };
    public preserveKeys = false;
    
    public constructor(config: {[key: string]: any}) {
        super(config);
        Object.assign(this, config);
    }

    public async init()
    {
        if (this.request === undefined) {
            this.request = Pwoli.request;
        }
    }

    public async serialize(data: Model | DataProvider | Array<any>): Promise<{ [key: string]: any }>
    {
        if (data.constructor.name === 'Model' && (data as Model).hasErrors()) {
            return this.serializeModelErrors(data as Model);
        } else if (data instanceof DataProvider) {
            return await this.serializeDataProvider(data);
        } else if (typeof data === 'object') {
            return this.serializeModel(data as Model);
        } else if (Array.isArray(data)) {
            let serializedObject = [];
            for(let key in (data as Array<any>))
                serializedObject[key] = this.serialize(data[key]);
            return serializedObject;
        }
        this.response.data = data;
        return this.response;
    }

    protected getRequestedFields(): {fields: string[], expand: string[]}
    {
        const params = url.parse(this.request.url, true).query;
        const fields = params[this.fieldsParam];
        const expand = params[this.expandParam];

        return {
            fields: typeof fields === 'string' ? fields.split(/\s*,\s*/) : [],
            expand: typeof expand === 'string' ? expand.split(/\s*,\s*/) : [],
        };
    }

    protected async serializeDataProvider(dataProvider: DataProvider): Promise<{ [key: string]: any }> {
        let models;
        //console.log('sdpbb------------', await dataProvider.getModels())
        if (this.preserveKeys)
            models = await dataProvider.getModels();
        else
            models = Object.values(await dataProvider.getModels());
        
        models = this.serializeModels(models);
        let pagination = dataProvider.getPagination()
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

    protected serializePagination(pagination: Pagination): { [key: string]: any }
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

    protected addPaginationHeaders(pagination: Pagination)
    {
        let links = [];
        let paginationLinks = pagination.getLinks(true);
        for(let rel in paginationLinks) {
            links.push(`<${paginationLinks[rel]}>; rel=${rel}`);
        }
        this.response.headers[this.totalCountHeader] = pagination.totalCount;
        this.response.headers[this.pageCountHeader] = pagination.getPageCount();
        this.response.headers[this.currentPageHeader] = pagination.getPage() + 1;
        this.response.headers[this.perPageHeader] = pagination.getPageSize();
        this.response.headers.link = links.join(', ');
    }

    protected serializeModel(model: Model): Model
    {
        if (this.request.method === 'HEAD') {
            return null;
        }

        const { fields, expand } = this.getRequestedFields();
        return model; //.toArray(fields, expand);
    }

    protected serializeModelErrors(model: Model): { [key: string]: any }
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

    protected serializeModels(models: Model[]): Model[]
    {
        const { fields, expand } = this.getRequestedFields();
        let i = 0;
        for(let model of models) {
            if (model.constructor.name === 'Model') {
                models[i] = model; //.toArray(fields, expand);
            }
            i++;
        }
        return models;
    }
}
