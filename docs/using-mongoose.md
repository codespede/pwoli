## Using Mongoose as the ORM

Please [see here](/pwoli/using-another-orm) if you haven't setup the `orm-model-config` file.

### Setting up Models

After configuring your Collection's Schema(as you do normally for Mongoose) like below:
```js
import mongoose from 'mongoose';
import { Model } from 'pwoli';
...
const eventSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        contactPerson: {
            name: { type: String, required: true },
            email: { type: String, required: true, validate: [function(email) {
                var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                return re.test(email)
            }, 'Please fill a valid email address'] },
            phone: { type: Number, required: true },
        },
        companies: [{
            title: { type: String, required: true },
        }],
        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization'
        }
    },
    { collection: 'Event', timestamps: true }
);
```
Create a Model class for the Schema and override/add required methods(if any) to it as below:
```js
class Event extends (Model) {
    getAttributeLabels() { // used for setting labels for different attributes/paths
        return {
            title: 'Title',
            'contactPerson.name': 'Contact Person\'s Name',
            'contactPerson.phone': 'Contact Person\'s Phone Number',
            'contactPerson.email': 'Contact Person\'s Email',
            organization: 'Organization'
        }
    }
    get sampleGetter() {
        return (async () => {
            return this.title.toUpperCase();
        })();
    }
    get companiesCommaSeparated() {
        let companies = [];
        for(let company of companies)
            companies.push(company.title);
        return companies.join(", ");
    }
    ...
}
```
Finally, load the class to the created Schema, modelize it, and export it as below:
```js
eventSchema.loadClass(Event);
// since MongoDB doesn't have 'id' by default, we explicitely copy _id to id
eventSchema.set('toJSON', {
  virtuals: true,
  transform: function (_doc, ret, _options) {
      ret.id = ret._id;
  }
});
const EventModel = mongoose.model('Event', eventSchema)
export { EventModel as Event };
```
Now you can use these Models just as how you use it in the normal way for Pwoli.

Fully working examples of using Mongoose with Pwoli are available [here](https://github.com/codespede/pwoli-node-sample) and [here](https://github.com/codespede/pwoli-express-typescript-sample).

### Operations with Embedded Documents

In Widgets like [GridView](/pwoli/api-docs/classes/GridView.html), [ListView](/pwoli/api-docs/classes/ListView.html), [ActiveForm](/pwoli/api-docs/classes/ActiveForm.html) etc., embedded attributes can be used like below:
-    GridView/ListView ([click here](/pwoli/output-data-widgets) for learning how to use GridView/ListView):
        ```js
            ...
            columns: [
                ...
                'contactPerson.name',
                'organization.title',
                'organization.owner.cars.1.brand'
                ...
            ],
            ...
        ```
    
        -    Sorting, filtering, pagination etc. will be enabled automatically for the embedded attributes by default.


-   ActiveForm ([click here](/pwoli/input-forms) for learning how to use ActiveForm):
    ```js
    <p><%= (event.isNewRecord? 'Create' : 'Update') %> Item</p>
    <%- await form1.begin() %>

    <%- await form1.field(event, 'title').input('text').__toString() %>
    <%- await form1.field(event, 'contactPerson.name' ).input('text').__toString() %>
    <%- await form1.field(event, 'contactPerson.email' ).input('text').__toString() %>
    <%- await form1.field(event, 'organization.title' ).input('text').__toString() %>
    <%- await form1.field(event, 'organization.owner.cars.1.brand' ).input('text').__toString() %>
    <input type="submit"/>

    <%- await form1.end() %>

    ```
    -    Validations work based on the Mongoose Schemas and will work for embedded attributes just as how they work for normal attributes.

### RESTful APIs:

APIs will work as normal as demonstrated [here](/pwoli/rest-api).

-    Embedded attributes will be rendered as below:
        ```json
        [
            {
                "id": 1,
                "title": "Event 1",
                "contactPerson.name": "Person 1",
                "organization.owner.cars": [
                    {
                        ...
                        "brand": "BMW",
                        ...
                    }
                ]
                ...
            },
            {
                "id": 1,
                "title": "Event 2",
                "contactPerson.name": "Person 2",
                "organization.owner.cars": [],
                ...
            },
            {
                "id": 1,
                "title": "Event 3",
                "contactPerson.name": "Person 3",
                "organization.owner.cars": [],
                ...
            }
            ... //total 10 items since default value of DataProvider.perPage is 10
        ]
        ```
-    For sorting the data with an embedded attribute, [just as how you do for normal attributes](https://codespede.github.io/pwoli/rest-api#sorting), pass it in the sort param like `?sort=contactPerson.name`
-    Similarly, for filtering the data with an embedded attribute, [just as how you do for normal attributes](https://codespede.github.io/pwoli/rest-api#filtering), pass it in the filter param like `?Event[contactPerson.name]=Mahesh`
-   Pagination will work as normal as how it's specified [here](https://codespede.github.io/pwoli/rest-api#pagination).

Fully working examples of using Mongoose with Pwoli are available [here](https://github.com/codespede/pwoli-node-sample) and [here](https://github.com/codespede/pwoli-express-typescript-sample).