# Creating Forms

## ActiveRecord based forms: ActiveForm

<p align="center"><img src="https://github.com/internetmango/pwoli/blob/master/docs/images/ActiveForm.gif?raw=true" style="margin-left: auto; margin-right: auto;"/></p>

The primary way of using forms in Pwoli is through
[ActiveForm](/pwoli/api-docs/classes/ActiveForm.html). This approach should be preferred when
the form is based upon a model. Additionally, there are some useful methods in [Html](/pwoli/api-docs/classes/Html.html) that are typically
used for adding buttons and help text to any form.

A form, that is displayed on the client-side, will in most cases have a corresponding [model](structure-models.md) which is used
to validate its input on the server-side (Check the [Validating Input](input-validation.md) section for more details on validation).
When creating model-based forms, the first step is to define the model itself. The model can be either based upon
an [Active Record](/pwoli/api-docs/classes/Model.html) class, representing some data from the database, or a generic Model class
(extending from [Model](/pwoli/api-docs/classes/Model.html)) to capture arbitrary input, for example a login form.

> Tip: If the form fields are different from database columns or there are formatting and logic that is specific to that
> form only, prefer creating a separate model extended from [Model](/pwoli/api-docs/classes/Model.html).

In the following example, we show how a generic model can be used for a login form:

```js
import { Model } from 'pwoli';
class LoginForm extends Model
{
    public username;
    public password;
}
```

In the controller, we will pass an instance of that model to the view, wherein the [ActiveForm](/pwoli/api-docs/classes/ActiveForm.html)
widget is used to display the form:

```js
import Html;
import ActiveForm;
...
let form = new ActiveForm({
    id: 'login-form',
    options: {class: 'form-horizontal'},
});
//Recommended way to render a view with layout if the view has async function calls:
return pwoli.Application.respond(res, await pwoli.Application.view.render('/view.ejs', { form }));

//In the view file:
    <%- await form.begin() %>
    <%- await form.field(model, 'username').input('text').__toString() %>
    <%- await form.field(model, 'password').passwordInput().__toString() %>

    <div class="form-group">
        <div class="col-lg-offset-1 col-lg-11">
            <%- Html.submitButton('Login', {class: 'btn btn-primary'}) %>
        </div>
    </div>
<%- await form.end() %>
```

### Wrapping with `begin()` and `end()` <span id="wrapping-with-begin-and-end"></span>

In the above code, [begin](/pwoli/api-docs/classes/ActiveForm.html#begin) not only creates a form instance, but also marks the beginning of the form.
All of the content placed between [begin](/pwoli/api-docs/classes/ActiveForm.html#begin) and
[end](/pwoli/api-docs/classes/ActiveForm.html#end) will be wrapped within the HTML `<form>` tag.
As with any widget, you can specify some options as to how the widget should be configured by passing an array to
the `begin` method. In this case, an extra CSS class and identifying ID are passed to be used in the opening `<form>` tag.
For all available options, please refer to the API documentation of [ActiveForm](/pwoli/api-docs/classes/ActiveForm.html).

### ActiveField <span id="activefield"></span>

In order to create a form element in the form, along with the element's label, and any applicable JavaScript validation,
the [field](/pwoli/api-docs/classes/ActiveForm.html#field) method is called, which returns an instance of [ActiveField](/pwoli/api-docs/classes/ActiveField.html).
When the result of this method is echoed directly, the result is a regular (text) input.
To customize the output, you can chain additional methods of [ActiveField](/pwoli/api-docs/classes/ActiveField.html) to this call:

```js
// a password input
<%- await form.field(model, 'password').passwordInput().__toString() %>
// adding a hint and a customized label
<%- await form.field(model, 'username').textInput().hint('Please enter your name').label('Name').__toString() %>
// creating a HTML5 email input element
<%- await form.field(model, 'email').input('email').__toString() %>
```

This will create all the `<label>`, `<input>` and other tags according to the [template](/pwoli/api-docs/classes/ActiveField.html#template) defined by the form field.
The name of the input field is determined automatically from the model's [[Model.formName|form name]] and the attribute name.
For example, the name for the input field for the `username` attribute in the above example will be `LoginForm[username]`. This naming rule will result in an array
of all attributes for the login form to be available in `_POST['LoginForm']` on the server-side.

> Tip: If you have only one model in a form and want to simplify the input names you may skip the array part by
> overriding the [formName](/pwoli/api-docs/classes/Model.html#formName) method of the model to return an empty string.
> This can be useful for filter models used in the [GridView](/pwoli/output-data-widgets.md#grid-view) to create nicer URLs.

Specifying the attribute of the model can be done in more sophisticated ways. For example when an attribute may
take an array value when uploading multiple files or selecting multiple items you may specify it by appending `[]`
to the attribute name:

```js
// allow multiple files to be uploaded:
<%- await form.field(model, 'uploadFile[]').fileInput({ multiple: 'multiple' })).__toString() %>

// allow multiple items to be checked:
<%- await form.field(model, 'items[]').checkboxList({ a: 'Item A', b: 'Item B', c: 'Item C' })).__toString() %>
```

Be careful when naming form elements such as submit buttons. According to the [jQuery documentation](https://api.jquery.com/submit/) there
are some reserved names that can cause conflicts:

> Forms and their child elements should not use input names or ids that conflict with properties of a form,
> such as `submit`, `length`, or `method`. Name conflicts can cause confusing failures.
> For a complete list of rules and to check your markup for these problems, see [DOMLint](https://kangax.github.io/domlint/).

Additional HTML tags can be added to the form using plain HTML or using the methods from the [Html](/pwoli/api-docs/classes/Html.html)-helper
class like it is done in the above example with [submitButton](/pwoli/api-docs/classes/Html.html#submitButton).

> Tip: In order to style required fields with asterisks, you can use the following CSS:
>
> ```css
> div.required label.control-label:after {
>     content: ' *';
>     color: red;
> }
> ```

## Creating Lists <span id="creating-activeform-lists"></span>

There are 3 types of lists:

-   Dropdown lists
-   Radio lists
-   Checkbox lists

To create a list, you have to prepare the items. This can be done manually:

```js
let items = {
    1: 'item 1',
    2: 'item 2',
};
```

or by retrieval from the DB:

```js
let items = {};
(await Category.findAll({ select: 'label' })).forEach((category) => {
    items[category.id] = category.label;
});
```

These `items` have to be processed by the different list widgets.
The value of the form field (and the current active item) will be automatically set
by the current value of the `model`'s attribute.

#### Creating a drop-down list <span id="creating-activeform-dropdownlist"></span>

We can use ActiveField [dropDownList](/pwoli/api-docs/classes/ActiveField.html#dropDownList) method to create a drop-down list:

```js
/* @var form ActiveForm */

<%- await form.field(model, 'category').dropdownList({
        1: 'item 1',
        2: 'item 2'
    },
    {prompt: 'Select Category'}
).__toString() %>
```

#### Creating a radio list <span id="creating-activeform-radioList"></span>

We can use ActiveField [radioList](/pwoli/api-docs/classes/ActiveField.html#radioList) method to create a radio list:

```js
/* @var form ActiveForm */

<%- await form.field(model, 'category').radioList({
    1: 'radio 1',
    2: 'radio 2'
}).__toString() %>
```

#### Creating a checkbox List <span id="creating-activeform-checkboxList"></span>

We can use ActiveField [checkboxList](/pwoli/api-docs/classes/ActiveField.html#checkboxList) method to create a checkbox list:

```js
/* @var form ActiveForm */

<%- await form.field(model, 'category').checkboxList({
    1: 'checkbox 1',
    2: 'checkbox 2'
}).__toString() %>
```

## Further Reading <span id="further-reading"></span>

The next section [Validating Input](input-validation.md) handles the validation of the submitted form data on the server-side as well as ajax and client-side validation.
