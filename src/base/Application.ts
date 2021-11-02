import Component from './Component';
import SequelizeAdapter from '../orm-adapters/SequelizeAdapter';
import View from './View';
import Serializer from '../rest/Serializer';
import url = require('url');
import IORMAdapter from 'pkgtest-lib/ORMAdapters/IORMAdapter';
export default class Application extends Component {
    public static request: { [key: string]: any };
    public static response: { [key: string]: any } = { data: null, headers: {}, status: null };
    public static charset = 'UTF-8';
    public static view = new View({});
    public static aliases = {};
    public static viewPath: string;
    public static orm: 'sequelize' | 'other' = 'sequelize';
    public static ormAdapterClasses = { sequelize: SequelizeAdapter };
    private static _ormAdapter;
    public static ormModelClass;
    public static serializer = new Serializer({});

    public static getFullUrlOfRequest() {
        const req = this.request;
        return decodeURIComponent(
        url.format({
            protocol: req.protocol || 'http',
            host: req.host || req.headers.host,
            pathname: req.originalUrl || req.url,
        }),
        );
    }

    public static setAlias(alias, path) {
        this.aliases[alias] = path;
    }

    public static getAlias(alias) {
        return this.aliases[alias] !== undefined ? this.aliases[alias] : false;
    }

    public static setViewPath(path) {
        const resolved = this.getAlias(path);
        this.viewPath = resolved !== false ? resolved : path;
    }

    public static getViewPath() {
        return this.viewPath;
    }

    public static getORMAdapter() {
        if(this._ormAdapter === undefined)
        this._ormAdapter = new this.ormAdapterClasses[this.orm]({});
        return this._ormAdapter;
    }

    public static async respond(nativeResponse, data = null) {
        //console.log('ares', data);
        if (typeof data === 'string')
            this.response.data = data;
        else if (typeof data === 'function') {
            console.log('aresf--------------------->', nativeResponse);
            nativeResponse = this.responsify(nativeResponse);
            return data(nativeResponse);
        } else if (data !== null) {
            this.serializer.request = this.request;
            this.serializer.response = this.response;
            this.response.data = JSON.stringify(await this.serializer.serialize(data));
        }
        //console.log('aresa', this.response);
        nativeResponse = this.responsify(nativeResponse);
        nativeResponse.write(this.response.data);
        nativeResponse.end();
    }

    public static responsify(response) {
        for (let header in this.response.headers)
            response.setHeader(header, this.response.headers[header] || "");
        if (this.response.status !== null)
            response.status = this.response.status;
        return response;
    }
}
