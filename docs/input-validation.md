# Validating Input

<p align="center"><img src="https://github.com/codespede/pwoli/blob/master/docs/images/ActiveForm.gif?raw=true" style="margin-left: auto; margin-right: auto;"/></p>

As a rule of thumb, you should never trust the data received from end users and should always validate it
before putting it to good use.

Given a [model](structure-models.md) populated with user inputs, you can validate the inputs by calling the
[Model.validate()](/pwoli/api-docs/classes/Model.html#validate) method. The method will return a boolean value indicating whether the validation
succeeded or not. If not, you may get the error messages from the [Model.errors](/pwoli/api-docs/classes/Model.html#errors) property. For example,

```js
model = new ContactForm();

// populate model attributes with user inputs
model.load(request.body);
// which is equivalent to the following:
// model.attributes = Pwoli.app.request.post('ContactForm');

if (model.validate()) {
    // all inputs are valid
} else {
    // validation failed: errors is an array containing error messages
    errors = model.errors;
}
```

## Validation Rules <span id="declaring-rules"></span>

Validations work based on the ORM you are using. Please visit your ORM's documentation to know more on how to set different kinds of validations for your Models.
If you are using Sequelize, please refer https://sequelize.org/master/manual/validations-and-constraints.html
You can see how validations are set for a sample Pwoli app which uses Sequelize in this file: https://github.com/codespede/pwoli-express-sample/blob/master/models/Company.js
