# Data widgets

Pwoli provides a set of widgets that can be used to display data.

[ListView](#list-view) and [GridView](#grid-view) can be used to display a list or table of data records
providing features like pagination, sorting and filtering.

## ListView <span id="list-view"></span>

The [ListView](#list-view) widget is used to display data from a [data provider](output-data-providers.md).
Each data model is rendered using the specified [itemView](/pwoli/api-docs/classes/ListView.html#itemView).
Since it provides features such as pagination, sorting and filtering out of the box, it is handy both to display
information to end user and to create data managing UI.

A typical usage is as follows:

```js
import { ListView,ActiveDataProvider } from 'pwoli';

let dataProvider = new ActiveDataProvider({
    query: {},
    pagination: {
        pageSize: 20,
    },
});
let list = new ListView({
    dataProvider: dataProvider,
    itemView: '_post',
});

//In the view file:
<%- list.render() %>

```

The `_post` view file could contain the following:

```js
// The class `Html` should be passed to the view while rendering it
<div class="post">
    <h2><%- Html.encode(model.title) %></h2>

    <%- model.text %>
</div>
```

In the view file above, the current data model is available as `model`. Additionally the following variables are available:

-   `key`: mixed, the key value associated with the data item.
-   `index`: integer, the zero-based index of the data item in the items array returned by the data provider.
-   `widget`: ListView, this widget instance.

If you need to pass additional data to each view, you can use the [viewParams](/pwoli/api-docs/classes/ListView.html#viewParams) property
to pass key value pairs like the following:

```js
new ListView({
    dataProvider: dataProvider,
    itemView: '_post',
    viewParams: [
        fullView: true,
        context: 'main-page',
        // ...
    ],
});
```

These are then also available as variables in the view.

## GridView <span id="grid-view"></span>

Data grid or [GridView](/pwoli/api-docs/classes/GridView.html) is one of the most powerful Pwoli widgets. It is extremely useful if you need to quickly build the admin
section of the system. It takes data from a [data provider](output-data-providers.md) and renders each row using a set of [GridView.columns()](/pwoli/api-docs/classes/GridView.html#columns)
presenting data in the form of a table.

Each row of the table represents the data of a single data item, and a column usually represents an attribute of
the item (some columns may correspond to complex expressions of attributes or static text).

The minimal code needed to use GridView is as follows:

```js
import { GridView, ActiveDataProvider } from 'pwoli';

let dataProvider = new ActiveDataProvider({
    query: { where: { status: 1 } },
    pagination: {
        pageSize: 20,
    },
});
let grid = GridView.{
    dataProvider: dataProvider,
});

//In the view file:
<%- grid.render() %>
```

The above code first creates a data provider and then uses GridView to display every attribute in every row taken from
the data provider. The displayed table is equipped with sorting and pagination functionality out of the box.

### Grid columns <span id="grid-columns"></span>

The columns of the grid table are configured in terms of [Column](/pwoli/api-docs/classes/Column.html) classes, which are
configured in the [GridView.columns()](/pwoli/api-docs/classes/GridView.html#columns) property of GridView configuration.
Depending on column type and settings these are able to present data differently.
The default class is [DataColumn](/pwoli/api-docs/classes/DataColumn.html), which represents a model attribute and can be sorted and filtered by.

```js
let grid = GridView({
    dataProvider: dataProvider,
    columns: [
        { class: 'SerialColumn' },
        // Simple columns defined by the data contained in dataProvider.
        // Data from the model's column will be used.
        'id',
        'username',
        // More complex one.
        {
            class: 'DataColumn', // can be omitted, as it is the default
            value: function (data) {
                return data.name; // data['name'] for array data, e.g. using ArrayDataProvider.
            },
        },
    ],
});
```

Note that if the [GridView.columns()](/pwoli/api-docs/classes/GridView.html#columns) part of the configuration isn't specified,
Pwoli tries to show all possible columns of the data provider's model.

### Column classes <span id="column-classes"></span>

Grid columns could be customized by using different column classes:

```js
let grid = new GridView({
    dataProvider: dataProvider,
    columns:
        {
            class: 'SerialColumn', // <-- here
            // you may configure additional properties here
        }}),
```

In addition to column classes provided by Pwoli that we'll review below, you can create your own column classes.

Each column class extends from [Column](/pwoli/api-docs/classes/Column.html) so that there are some common options you can set while configuring
grid columns.

-   [header](/pwoli/api-docs/classes/Column.html#header) allows to set content for header row.
-   [footer](/pwoli/api-docs/classes/Column.html#footer) allows to set content for footer row.
-   [visible](/pwoli/api-docs/classes/Column.html#visible) defines if the column should be visible.
-   [content](/pwoli/api-docs/classes/Column.html#content) allows you to pass a valid JS callback that will return data for a row. The format is the following:

    ```js
    function (model, key, index, column) {
        return 'a string';
    }
    ```

You may specify various container HTML options by passing arrays to:

-   [headerOptions](/pwoli/api-docs/classes/Column.html#headerOptions)
-   [footerOptions](/pwoli/api-docs/classes/Column.html#footerOptions)
-   [filterOptions](/pwoli/api-docs/classes/Column.html#filterOptions)
-   [contentOptions](/pwoli/api-docs/classes/Column.html#contentOptions)

#### Data column <span id="data-column"></span>

[DataColumn](/pwoli/api-docs/classes/DataColumn.html) is used for displaying and sorting data. It is the default column type so the specifying class could be omitted when
using it:

```js
let grid = new GridView({
    columns: {
        {
            attribute: 'name',
        },
        {
            attribute: 'birthday',
        },
        created_at:datetime, // shortcut format
        {
            label: 'Education',
            attribute: 'education',
            filter: [0: 'Elementary', 1: 'Secondary', 2: 'Higher'},
            filterInputOptions: {prompt: 'All educations', class: 'form-control', id: null}
        },
    });
```

For configuring data columns there is also a shortcut format which is described in the
API documentation for [GridView.columns()](/pwoli/api-docs/classes/GridView.html#columns).

Use [filter](/pwoli/api-docs/classes/DataColumn.html#filter) and [filterInputOptions](/pwoli/api-docs/classes/DataColumn.html#filterInputOptions)to control HTML for the filter input.

By default, column headers are rendered by [Sort.link()](/pwoli/api-docs/classes/Sort.html#link). It could be adjusted using [header](/pwoli/api-docs/classes/Column.html#header).
To change header text you should set [label](/pwoli/api-docs/classes/DataColumn.html#label) like in the example above.
By default the label will be populated from data model. For more details see [getHeaderCellLabel](/pwoli/api-docs/classes/DataColumn.html#getHeaderCellLabel).

#### Action column <span id="action-column"></span>

[ActionColumn](/pwoli/api-docs/classes/ActionColumn.html) displays action buttons such as update or delete for each row.

```js
let grid = new GridView({
    dataProvider: dataProvider,
    columns: {
        class: 'ActionColumn',
        // you may configure additional properties here
    },
});
```

Available properties you can configure are:

-   [controller](/pwoli/api-docs/classes/ActionColumn.html#controller) is the ID of the controller that should handle the actions. If not set, it will use the currently active
    controller.
-   [template](/pwoli/api-docs/classes/ActionColumn.html#template) defines the template used for composing each cell in the action column. Tokens enclosed within curly brackets are
    treated as controller action IDs (also called _button names_ in the context of action column). They will be replaced
    by the corresponding button rendering callbacks specified in [buttons](/pwoli/api-docs/classes/ActionColumn.html#buttons). For example, the token `{view}` will be
    replaced by the result of the callback `buttons['view']`. If a callback cannot be found, the token will be replaced
    with an empty string. The default tokens are `{view} {update} {delete}`.
-   [buttons](/pwoli/api-docs/classes/ActionColumn.html#buttons) is an array of button rendering callbacks. The array keys are the button names (without curly brackets),
    and the values are the corresponding button rendering callbacks. The callbacks should use the following signature:

    ```js
    function (url, model, key) {
        // return the button HTML code
    }
    ```

    In the code above, `url` is the URL that the column creates for the button, `model` is the model object being
    rendered for the current row, and `key` is the key of the model in the data provider array.

-   [urlCreator](/pwoli/api-docs/classes/ActionColumn.html#urlCreator) is a callback that creates a button URL using the specified model information. The signature of
    the callback should be the same as that of [createUrl](/pwoli/api-docs/classes/ActionColumn.html#createUrl). If this property is not set,
    button URLs will be created using [createUrl](/pwoli/api-docs/classes/ActionColumn.html#createUrl).
-   [visibleButtons](/pwoli/api-docs/classes/ActionColumn.html#visibleButtons) is an array of visibility conditions for each button.
    The array keys are the button names (without curly brackets), and the values are the boolean `true`/`false` or the
    anonymous function. When the button name is not specified in this array it will be shown by default.
    The callbacks must use the following signature:

    ```js
    function (model, key, index) {
        return model.status === 'editable';
    }
    ```

    Or you can pass a boolean value:

    ```js
    {
        update: \Pwoli.app.user.can('update')
    }
    ```

#### Checkbox column <span id="checkbox-column"></span>

[CheckboxColumn](/pwoli/api-docs/classes/CheckboxColumn.html) displays a column of checkboxes.

To add a CheckboxColumn to the GridView, add it to the [GridView.columns()](/pwoli/api-docs/classes/GridView.html#columns) configuration as follows:

```js
let grid = new GridView([
    id: 'grid',
    dataProvider: dataProvider,
    columns:
        {
            class: 'CheckboxColumn',
            // you may configure additional properties here
        },
    }))
```

Users may click on the checkboxes to select rows of the grid. The selected rows may be obtained by calling the following
JavaScript code:

```javascript
var keys = $('#grid').yiiGridView('getSelectedRows');
// keys is an array consisting of the keys associated with the selected rows
```

#### Serial column <span id="serial-column"></span>

[SerialColumn](/pwoli/api-docs/classes/SerialColumn.html) renders row numbers starting with `1` and going forward.

Usage is as simple as the following:

```js
let grid = new GridView({
    dataProvider: dataProvider,
    columns:
        {class: 'SerialColumn'}, // <-- here
        // ...
```

### Filtering data <span id="filtering-data"></span>

For filtering data, the GridView needs a [filterModel](/pwoli/api-docs/classes/GridView.html#filterModel) that represents the search criteria which is
usually taken from the filter fields in the GridView table.
Pwoli declares a `search()` method in the [IORMAdapter](/pwoli/api-docs/interfaces/IORMAdapter.html#search) that will return the data
provider with an adjusted query that processes the search criteria.

So each Model you extend from Pwoli's base [Model](/pwoli/api-docs/classes/Model.html) has this default search method built-in.

You can use this function in the controller to get the dataProvider for the GridView:

```js
let filterModel = new Post();
let dataProvider = filterModel.search(DataHelper.parseUrl(request.url));

return this.render('myview', {
    dataProvider: dataProvider,
    filterModel: filterModel,
});
```

And in the view you then assign the `dataProvider` and `filterModel` to the GridView:

```js
let grid = new GridView({
    dataProvider: dataProvider,
    filterModel: filterModel,
    columns: [
        // ...
    ],
});
```

### Separate filter form <span id="separate-filter-form"></span>

Most of the time using GridView header filters is enough, but in case you need a separate filter form,
you can easily add it as well. You can create partial view `_search.ejs` with the following contents:

```js
let form = new ActiveForm({
    action: 'index',
    method: 'get',
});

//In the view:
//pass ActiveForm, Html classes too when rendering this view..
<div class="post-search">
    <%- await form.begin(); %>

    <%- await form.field(model, 'title') %>

    <%- await form.field(model, 'creation_date') %>

    <div class="form-group">
        <%- Html.submitButton('Search', {class: 'btn btn-primary'}) %>
        <%- Html.submitButton('Reset', {class: 'btn btn-default'}) %>
    </div>

    <%- await form.end(); %>
</div>
```

and include it in the main view like so:

```js
let searchView = await Pwoli.view.render('/_search.ejs', { form, model, Html }, false); //the last argument `false` indicates that this view should be rendered partially without layouts.
```

Separate filter form is useful when you need to filter by fields, that are not displayed in GridView
or for special filtering conditions, like date range. For filtering by date range we can add non DB attributes
`createdFrom` and `createdTo` to the search model:

```js
class Post extends Model
{
    /**
     * @var string
     */
    public createdFrom;

    /**
     * @var string
     */
    public createdTo;
}
```

Extend query conditions in the `search()` method like so:

```js
query.where = {
    ...query.where,
    creation_date: { [Op.gte]: this.createdFrom },
    creation_date: { [Op.lte]: this.createdTo },
};
```

And add the representative fields to the filter form:

```js
<%- await form.field(model, 'creationFrom') %>

<%- await form.field(model, 'creationTo') %>
```

### Working with model relations <span id="working-with-model-relations"></span>

When displaying active records in a GridView you might encounter the case where you display values of related
columns such as the post author's name instead of just his `id`.
You do this by defining the attribute name in [GridView.columns()](/pwoli/api-docs/classes/GridView.html#columns) as `author.name` when the `Post` model
has a relation named `author` and the author model has an attribute `name`.
The GridView will then display the name of the author but sorting and filtering are not enabled by default.
You have to adjust the `filterModel` that has been introduced in the last section to add this functionality.

To enable sorting on a related column you have to include(in the case of Sequelize) the related table and add the sorting rule
to the Sort component of the data provider:

```js
let query = { where: { status: 1 }};
let dataProvider = new ActiveDataProvider({
    query: query,
});

// join with relation `author` that is a relation to the table `users`
// and set the table alias to be `author`
query = { ...query, include: [{ model: Author, as: 'author' }]};

// enable sorting for the related column
let sort = dataProvider.getSort();
sort.attributes['author.name'] = {
    asc: {'author', 'name', 'asc'},
    desc: {'author', 'name', 'desc'},
};
dataProvider.setSort(sort);
// ...
```

You can see this same thing working in this Boilerplate: ()

For filtering with relations, you just need to override the `search()` as it needs to have the additional logic for filtering with foreign columns:

Assume there's a relation `event`(also assume that this relation is included in the `query` of DataProvider) for `Post` model and it has a field `title`. So, in the `Post` model:

```js
class Post extends Model{
    ...
    public search(params) {
        let provider = super.search.call(this, params); // calling the default implementation of search
        console.log('params', params, this.getFormName())
        for (const param in params[this.getFormName()]) {
            if (['event.title'].includes(param)) {
                provider.query.where[`$${param}$`] = { [Op.like]: `%${params[this.getFormName()]['event.title']}%` };
                this[param] = params[this.getFormName()][param]; // for setting this searched value back into the filterModel for showing in the filter field of GridView
            }
        }
        return provider;
    }
    ...
}
```

You can see this same thing working in this Boilerplate: ()

> When specifying the [Sort.defaultOrder()](/pwoli/api-docs/classes/Sort.html#defaultOrder) for sorting, you need to use the relation name
> instead of the alias:
>
> ```js
> dataProvider.sort.defaultOrder = { 'author.name': 'asc' };
> ```

### Multiple GridViews on one page <span id="multiple-gridviews"></span>

You can use more than one GridView on a single page but some additional configuration is needed so that
they do not interfere with each other.

When using multiple instances of GridView you have to configure different parameter names for
the generated sort and pagination links so that each GridView has its own individual sorting and pagination.

You do so by setting the [Sort.sortParam()](/pwoli/api-docs/classes/Sort.html#sortParam) and [Pagination.sortParam()](/pwoli/api-docs/classes/Pagination.html#sortParam)
of the dataProvider's [sort](/pwoli/api-docs/classes/DataProvider.html#sort) and [pagination](/pwoli/api-docs/classes/DataProvider.html#pagination)
instances.

Assume we want to list the `Post` and `User` models for which we have already prepared two data providers
in `userProvider` and `postProvider`:

```js
import { GridView } from 'pwoli';

userProvider.pagination.pageParam = 'user-page';
userProvider.sort.sortParam = 'user-sort';

postProvider.pagination.pageParam = 'post-page';
postProvider.sort.sortParam = 'post-sort';

let userGrid = new GridView.({
    dataProvider: userProvider,
});

let postGrid = new GridView({
    dataProvider: postProvider,
]);
```

## [Pjax](https://github.com/defunkt/jquery-pjax) integration

By default all the Widgets(including GridView and ListView) extended from the base [Widget](/pwoli/api-docs/classes/Widget.html) class are Pjax enabled.

This means that any operations like clicking any link, submitting any form inside the Widget(For eg., in GridView - filtering, sorting and pagination) will trigger an AJAX request and the Widget will get reloaded without getting the whole page reloaded.

You can disable Pjax by setting [Widget.enablePjax](/pwoli/api-docs/classes/Widget.html#enablePjax) to false.
