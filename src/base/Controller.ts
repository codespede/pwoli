import Model from './Model';
import Component from './Component';
export default class Controller extends Component {
    public constructor(config: { [key: string]: any }) {
        super(config);
        Object.assign(this, config);
    }
    public async validate(model: Model): Promise<Model> {
        try {
            await model.validate();
        } catch (error) {
            let errors = {};
            error.errors.forEach((error) => {
                errors[error.path] = error.message;
            });
            errors = errors;
            model.errors = errors;
            return model;
        }
        return model;
    }
}
