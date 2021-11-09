import Pwoli from './Pwoli';
import Component from './Component';
import SequelizeAdapter from '../orm-adapters/SequelizeAdapter';
import { Model as SequelizeModel } from 'sequelize';
import View from './View';
import Serializer from '../rest/Serializer';
import url = require('url');
/**
 * Application is the base class for all web application classes.
 *
 * For more details and usage information on Application, see the [guide article on applications](guide:structure-applications).
 *
 * @property-read ErrorHandler $errorHandler The error handler application component. This property is
 * read-only.
 * @property string $homeUrl The homepage URL.
 * @property-read Request $request The request component. This property is read-only.
 * @property-read Response $response The response component. This property is read-only.
 * @property-read Session $session The session component. This property is read-only.
 * @property-read User $user The user component. This property is read-only.
 *
 * @author Mahesh S Warrier <https://github.com/codespede>
 */
export default class Application extends Component {
    public static request: { [key: string]: any };
    public static response: { [key: string]: any } = { data: null, headers: {}, status: null };
    /**
     * The [[View]] object for the application that is used to render various view files..
     */
    public static view = new View({});
    /**
     * @var registered path aliases
     * @see [[getAlias]]
     * @see [[setAlias]]
     */
    public static aliases = {};
    /**
     * The directory that contains the view files for this module.
     */
    public static viewPath: string;
    /**
     * The ORM that should be used by the application. Defaults to 'sequelize'
     * Any other ORM if used should have an [[ORMAdapter]] defined in [[ormAdapterClasses]]
     */
    public static orm: string = 'sequelize';
    /**
     * The adapters for any ORMs used by this application.
     * The key of the adapter to be used should be specified in [[orm]]
     * By default, support for Sequelize ORM is provided.
     */
    public static ormAdapterClasses = { sequelize: SequelizeAdapter };
    private static _ormAdapter;
    /**
     * The model class for the ORM being used. Eg:- [[sequelize.Model]] for Sequelize
     * This should be set in the entry script of the application like:
     * ```js
     * import { DataTypes, Model } from 'sequelize';
     * Application.ormModelClass = Model;
     * ```
     */
    public static ormModelClass = () => {
        try {
            let model = require('../../../../orm-model-config');
            return model.default;
        } catch (e) {
            try {
                let model = require('../../../../orm-model-config.cjs');
                return model;
            } catch (innerE) {}
            return SequelizeModel;
        }
    };
    /**
     * The [[Serializer]] that should be used for RESTful operations.
     */
    public static serializer = new Serializer({});
    /** @inheritdoc */
    public async init() {
        if (Pwoli.config.viewPath) Application.viewPath = Pwoli.config.viewPath;
    }
    /**
     * Returns the full URL of the request.
     */
    public static getFullUrlOfRequest() {
        const req = this.request;
        return decodeURIComponent(
            url.format({
                protocol: req.protocol || 'http',
                host: req.headers.host || req.host,
                pathname: req.originalUrl || req.url,
            }),
        );
    }
    /**
     * Registers a path alias.
     *
     * A path alias is a short name representing a long path (a file path, a URL, etc.)
     */
    public static setAlias(alias, path) {
        this.aliases[alias] = path;
    }
    /**
     * Translates a path alias into an actual path.
     * @param alias The alias to be translated.
     * @return The translated alias.
     * @see [[setAlias]]
     */
    public static getAlias(alias: string) {
        return this.aliases[alias] !== undefined ? this.aliases[alias] : false;
    }
    /**
     * Sets the viewPath.
     * @param path The path to be set.
     */
    public static setViewPath(path: string) {
        const resolved = this.getAlias(path);
        this.viewPath = resolved !== false ? resolved : path;
    }
    /**
     * Returns the viewPath.
     * @return The actual viewPath.
     */
    public static getViewPath() {
        return this.viewPath;
    }
    /**
     * Returns the ORM Adapter.
     * @return The ORM Adapter class.
     */
    public static getORMAdapter() {
        if (this._ormAdapter === undefined) this._ormAdapter = new this.ormAdapterClasses[this.orm]({});
        return this._ormAdapter;
    }
    /**
     * Sets the ORM Adapter.
     * @paramadapter The ORM Adapter class to be set.
     */
    public static setORMAdapter(adapter) {
        this._ormAdapter = adapter;
    }
    /**
     * Responds to the client(eg:- browser) depending on the data.
     */
    public static async respond(nativeResponse, data = null) {
        if (typeof data === 'string') this.response.data = data;
        else if (typeof data === 'function') {
            nativeResponse = this.responsify(nativeResponse);
            return data(nativeResponse);
        } else if (data !== null) {
            this.serializer.request = this.request;
            this.serializer.response = this.response;
            this.response.data = JSON.stringify(await this.serializer.serialize(data));
        }

        nativeResponse = this.responsify(nativeResponse);
        nativeResponse.write(this.response.data);
        nativeResponse.end();
    }
    /**
     * Adds necessary headers and status code to the given response.
     */
    public static responsify(response) {
        for (let header in this.response.headers) response.setHeader(header, this.response.headers[header] || '');
        if (this.response.status !== null) response.status = this.response.status;
        return response;
    }

    public static setORMModelClass(modelClass: any) {
        Application.ormModelClass = modelClass;
    }
}
