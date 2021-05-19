import MixPanelClient from '../components/MixPanelClient'
export class Controller {
    mixpanel;
    constructor() {
        this.mixpanel = MixPanelClient;
    }
    async validate(model) {
        try {
            await model.validate();
        } catch (error) {
            let errors = {};
            error.errors.forEach(error => {
                errors[error.path] = error.message;
            });
            errors = errors;
            model.errors = errors;
            return model;
        }
        return model;
    }
}
