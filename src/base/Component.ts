/**
 * Component is the base class for all the other classes in Pwoli
 *
 * @author Mahesh S Warrier <https://github.com/codespede>
 */
export default class Component {
    /**
     * A Promise which resolves when this Component has been successfully initialized.
     */
    public initialization: Promise<void>;
    public constructor(config: { [key: string]: any } = {}) {
        Object.assign(this, config);
        this.initialization = this.init();
    }
    /**
     * Initializes the object.
     * This method is invoked at the end of the constructor after the object is initialized with the
     * given configuration.
     */
    public async init() {}
}
