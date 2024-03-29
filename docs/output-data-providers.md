# Data Providers

In the [Pagination](/pwoli/api-docs/classes/Pagination.html) and [Sort](/pwoli/api-docs/classes/Sort.html) sections, we have described how to
allow end users to choose a particular page of data to display and sort them by some columns. Because the task
of paginating and sorting data is very common, Pwoli provides a set of _data provider_ classes to encapsulate it.

A data provider is a class extending [DataProvider](/pwoli/api-docs/classes/DataProvider.html). It mainly supports retrieving paginated
and sorted data. It is usually used to work with [data widgets](/pwoli/output-data-widgets.md) so that end users can
interactively paginate and sort data.

The following data provider classes are included in the Pwoli releases:

-   [ActiveDataProvider](/pwoli/api-docs/classes/ActiveDataProvider.html): uses [query](/pwoli/api-docs/classes/ActiveDataProvider.html#query) to query data from databases
    and return them in terms of arrays or [Active Record](/pwoli/api-docs/classes/Model.html) instances.
-   [ArrayDataProvider](/pwoli/api-docs/classes/ArrayDataProvider.html): takes a big array and returns a slice of it based on the paginating and sorting
    specifications.

The usage of all these data providers share the following common pattern:

```js
// create the data provider by configuring its pagination and sort properties
let provider = new XyzDataProvider({
    pagination: [...],
    sort: [...],
});

// retrieves paginated and sorted data
let models = provider.getModels();

// get the number of data items in the current page
let count = provider.getCount();

// get the total number of data items across all pages
let totalCount = provider.getTotalCount();
```

You specify the pagination and sorting behaviors of a data provider by configuring its
[pagination](/pwoli/api-docs/classes/DataProvider.html#pagination) and [sort](/pwoli/api-docs/classes/DataProvider.html#sort) properties
which correspond to the configurations for [Pagination](/pwoli/api-docs/classes/Pagination.html) and [Sort](/pwoli/api-docs/classes/Sort.html), respectively.
You may also configure them to be `false` to disable pagination and/or sorting features.

[Data widgets](/pwoli/output-data-widgets.md), such as [GridView](/pwoli/api-docs/classes/GridView.html), have a property named `dataProvider` which
can take a data provider instance and display the data it provides. For example,

```js
let grid = new GridView({
    dataProvider: Data Providers
}))
==============
```

In the [Pagination](/pwoli/api-docs/classes/Pagination.html) and [Sort](/pwoli/api-docs/classes/Sort.html) sections, we have described how to
allow end users to choose a particular page of data to display and sort them by some columns. Because the task
of paginating and sorting data is very common, Pwoli provides a set of _data provider_ classes to encapsulate it.

A data provider is a class implementing [DataProvider](/pwoli/api-docs/classes/DataProvider.html). It mainly supports retrieving paginated
and sorted data. It is usually used to work with [data widgets](/pwoli/output-data-widgets.md) so that end users can
interactively paginate and sort data.

The following data provider classes are included in the Pwoli releases:

-   [ActiveDataProvider](/pwoli/api-docs/classes/ActiveDataProvider.html): uses [query](/pwoli/api-docs/classes/ActiveDataProvider.html#query) to query data from databases
    and return them in terms of arrays or [Active Record](/pwoli/api-docs/classes/Model.html) instances.
-   [ArrayDataProvider](/pwoli/api-docs/classes/ArrayDataProvider.html): takes a big array and returns a slice of it based on the paginating and sorting
    specifications.

The usage of all these data providers share the following common pattern:

```js
// create the data provider by configuring its pagination and sort properties
let provider = new XyzDataProvider({
    pagination: [...],
    sort: [...],
});

// retrieves paginated and sorted data
let models = provider.getModels();

// get the number of data items in the current page
let count = provider.getCount();

// get the total number of data items across all pages
let totalCount = provider.getTotalCount();
```

You specify the pagination and sorting behaviors of a data provider by configuring its
[pagination](/pwoli/api-docs/classes/DataProvider.html#pagination) and [sort](/pwoli/api-docs/classes/DataProvider.html#sort) properties
which correspond to the configurations for [Pagination](/pwoli/api-docs/classes/Pagination.html) and [Sort](/pwoli/api-docs/classes/Sort.html), respectively.
You may also configure them to be `false` to disable pagination and/or sorting features.

[Data widgets](/pwoli/output-data-widgets.md), such as [GridView](/pwoli/api-docs/classes/GridView.html), have a property named `dataProvider` which
can take a data provider instance and display the data it provides. For example,

```js
let grid = new GridView([
    dataProvider: dataProvider,
));
```

These data providers mainly vary in the way how the data source is specified. In the following subsections,
we will explain the detailed usage of each of these data providers.

## Active Data Provider <span id="active-data-provider"></span>

To use [ActiveDataProvider](/pwoli/api-docs/classes/ActiveDataProvider.html), you should configure its [query](/pwoli/api-docs/classes/ActiveDataProvider.html#query) property.
It can take a [query](/pwoli/api-docs/classes/ActiveDataProvider.html#query) object. If the former, the data returned will be arrays;
if the latter, the data returned can be either arrays or [Active Record](/pwoli/api-docs/classes/Model.html) instances.
For example,

```js
import { ActiveDataProvider } from 'pwoli';

let query = where({ status: 1 });

let provider = new ActiveDataProvider({
    query: {},
    pagination: {
        pageSize: 10,
    },
    sort: {
        defaultOrder: {
            created_at: SORT_DESC,
            title: SORT_ASC,
        },
    },
});

// returns an array of Post objects
let posts = provider.getModels();
```

If `query` in the above example is created using the following code, then the data provider will return raw arrays.

```js
import Query;

let query = ({where: {status: 1}});
```

> Note: If a query already specifies the `orderBy` clause, the new ordering instructions given by end users
> (through the `sort` configuration) will be appended to the existing `orderBy` clause. Any existing `limit`
> and `offset` clauses will be overwritten by the pagination request from end users (through the `pagination` configuration).

By default, [ActiveDataProvider](/pwoli/api-docs/classes/ActiveDataProvider.html) uses the `db` application component as the database connection. You may
use a different database connection by configuring the [db](/pwoli/api-docs/classes/ActiveDataProvider.html#db) property.

## Array Data Provider <span id="array-data-provider"></span>

[ArrayDataProvider](/pwoli/api-docs/classes/ArrayDataProvider.html) is best used when working with a big array. The provider allows you to return
a page of the array data sorted by one or multiple columns. To use [ArrayDataProvider](/pwoli/api-docs/classes/ArrayDataProvider.html) , you should
specify the [allModels](/pwoli/api-docs/classes/ArrayDataProvider.html#allModels) property as the big array.
Elements in the big array can be either associative arrays
objects (e.g. [Active Record](/pwoli/api-docs/classes/Model.html) instances).
For example,

```js
import { ArrayDataProvider } from 'pwoli';

let data = [
    {id: 1, name: 'name 1', ...},
    {id: 2, name: 'name 2', ...},
    ...
    {id: 100, name: 'name 100', ...},
];

let provider = new ArrayDataProvider({
    allModels: data,
    pagination: {
        pageSize: 10,
    },
    sort: {
        attributes: ['id', 'name'],
    },
});

// get the rows in the currently requested page
let rows = provider.getModels();
```

> Note: Compared to [Active Data Provider](#active-data-provider),array data provider is less efficient because it requires loading _all_ data into the memory.

## Working with Data Keys <span id="working-with-keys"></span>

When using the data items returned by a data provider, you often need to identify each data item with a unique key.
For example, if the data items represent customer information, you may want to use the customer ID as the key
for each customer data. Data providers can return a list of such keys corresponding with the data items returned
by [DataProvider.getModels()](/pwoli/api-docs/classes/DataProvider.html#getModels). For example,

```js
import { ActiveDataProvider } from 'pwoli';

let query = { where: { status: 1 } };

let provider = new ActiveDataProvider({
    query: {},
});

// returns an array of Post objects
let posts = provider.getModels();

// returns the primary key values corresponding to posts
let ids = provider.getKeys();
```

In the above example, because you provide to [ActiveDataProvider](/pwoli/api-docs/classes/ActiveDataProvider.html) an [query](/pwoli/api-docs/classes/ActiveDataProvider.html#query) object,
it is intelligent enough to return primary key values as the keys. You may also explicitly specify how the key
values should be calculated by configuring [key](/pwoli/api-docs/classes/ActiveDataProvider.html#key) with a column name or
a callable calculating key values. For example,

```js
// use "slug" column as key values
let provider = new ActiveDataProvider({
    query: {},
    key: 'slug',
});

// use the result of md5(id) as key values
provider = new ActiveDataProvider({
    query: {},
    key: function (model) {
        return md5(model.id);
    },
});
```

## Creating Custom Data Provider <span id="custom-data-provider"></span>

To create your own custom data provider classes, you should implement [DataProvider](/pwoli/api-docs/classes/DataProvider.html).
An easier way is to extend from [DataProvider](/pwoli/api-docs/classes/DataProvider.html) which allows you to focus on the core data provider
logic. In particular, you mainly need to implement the following methods:

-   [prepareModels](/pwoli/api-docs/classes/DataProvider.html#prepareModels): prepares the data models that will be made
    available in the current page and returns them as an array.
-   [prepareKeys](/pwoli/api-docs/classes/DataProvider.html#prepareKeys): accepts an array of currently available data models
    and returns keys associated with them.
-   [PrepareTotalCount](/pwoli/api-docs/classes/DataProvider.html#prepareTotalCount): returns a value indicating the total number
    of data models in the data provider.

Below is an example of a data provider that reads CSV data efficiently:

```js
import { DataProvider } from "pwoli";

class CsvDataProvider extends DataProvider
{
    /**
     * @var string name of the CSV file to read
     */
    public filename;

    /**
     * @var string|callable name of the key column or a callable returning it
     */
    public key;

    /**
     * @var SplFileObject
     */
    protected fileObject; // SplFileObject is very convenient for seeking to particular line in a file


    /**
     * {@inheritdoc}
     */
    public init()
    {
        parent.init();

        // open file
        this.fileObject = new SplFileObject(this.filename);
    }

    /**
     * {@inheritdoc}
     */
    protected prepareModels()
    {
        models = [];
        pagination = this.getPagination();

        if (pagination === false) {
            // in case there's no pagination, read all lines
            while (!this.fileObject.eof()) {
                models[] = this.fileObject.fgetcsv();
                this.fileObject.next();
            }
        } else {
            // in case there's pagination, read only a single page
            pagination.totalCount = this.getTotalCount();
            this.fileObject.seek(pagination.getOffset());
            limit = pagination.getLimit();

            for (count = 0; count < limit; ++count) {
                models[] = this.fileObject.fgetcsv();
                this.fileObject.next();
            }
        }

        return models;
    }

    /**
     * {@inheritdoc}
     */
    protected prepareKeys(models)
    {
        if (this.key !== null) {
            keys = [];

            foreach (models as model) {
                if (is_string(this.key)) {
                    keys[] = model[this.key];
                } else {
                    keys[] = call_user_func(this.key, model);
                }
            }

            return keys;
        }

        return array_keys(models);
    }

    /**
     * {@inheritdoc}
     */
    protected prepareTotalCount()
    {
        count = 0;

        while (!this.fileObject.eof()) {
            this.fileObject.next();
            ++count;
        }

        return count;
    }
}
```

## Filtering Data Providers <span id="filtering-data-providers"></span>

You can easily build conditions for filtering data with active data provider manually as described in
[Filtering Data](/pwoli/output-data-widgets.md#filtering-data) and [Separate Filter Form](/pwoli/output-data-widgets.md#separate-filter-form)
