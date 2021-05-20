import Component from './Component';
export default class Controller extends Component {
  mixpanel;
  public constructor(config) {
    super(config);
    Object.assign(this, config);
  }
  async validate(model) {
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
