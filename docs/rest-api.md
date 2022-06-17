# Rendering Data via APIs

Pwoli provides an easy and efficient way to render data for RESTful GET requests.


<p align="center"><img src="https://github.com/internetmango/pwoli/blob/master/docs/images/API.gif" height="70%" width="70%" style="margin-left: auto; margin-right: auto;"/></p>

## Rendering a single record

For rendering a single record via the API, you just need to pass the Model of that record to `Pwoli.respond()` like below:

```js
router.get('/posts/:postId', async function (req, res, next) {
    Pwoli.request = req;
    let post = await Post.findOne({ where: {id: req.params.postId } });
    return Pwoli.respond(res, post);
```

That's all!
The API response will look something like this:

```
{
    "id": 1,
    "title": "Post 1",
    "description": "Post 1 description",
    "viewsCount": 100,
    "status": 1,
    "createdAt": "20201-11-10 00:00:00",
    "createdAt": "20201-11-10 00:00:00"
}
```

If you want to add the data of a related model with this model response, you can add that by adding the `include` key to the argument of `findOne` call:

```js
let post = await Post.findOne({ where: {id: req.params.postId }, include: [{ model: Author, as: 'author' }] });
...
return Pwoli.respond(res, post);
```

If you want to add additional custom fields to your model's response, you can do like below:

```js
post.setAttributeValues({
    someField: await post.someFunction(),
    someOtherField: someOtherModel.someOtherValue,
    // post.anotherField = anotherValue;
    ...
});
...
return Pwoli.respond(res, post);

```

## Rendering multiple records(data listing)

For instance, let's look at the following code:

```js
router.get('/posts', async function (req, res, next) {
    Pwoli.request = req;
    const filterModel = new Post();
    const dataProvider = filterModel.search(DataHelper.parseUrl(req.url));
    return Pwoli.respond(res, dataProvider);
});
```

That's all!

Pwoli will handle all the filtering, sorting and pagination of the data records accordingly and render only the corresponding data records matching the current scenario.

Pwoli also adds custom Pagination and Meta Response Headers for the response sent back from the server with which the client/frontend can use them to navigate between different pages of the paginated data and, show information like `totacCount`, `pageCount`, `perPage`, `currentPage` etc.

By default, a sample response body will be like:

```json
[
    {
        "id": 1,
        "title": "Post 1",
        "description": "Post 1 descriptions",
        "viewsCount": 100,
        "status": 1,
        "createdAt": "20201-11-10 00:00:00",
        "createdAt": "20201-11-10 00:00:00"
    },
    {
        "id": 1,
        "title": "Post 2",
        "description": "Post 2 descriptions",
        "viewsCount": 100,
        "status": 1,
        "createdAt": "20201-11-10 00:00:00",
        "createdAt": "20201-11-10 00:00:00"
    },
    {
        "id": 1,
        "title": "Post 3",
        "description": "Post 3 descriptions",
        "viewsCount": 100,
        "status": 1,
        "createdAt": "20201-11-10 00:00:00",
        "createdAt": "20201-11-10 00:00:00"
    }
    ... //total 10 items since default value of DataProvider.perPage is 10
]
```

The Custom Headers for this request's response will be like below:

```
X-Pagination-Current-Page → 1

X-Pagination-Page-Count → 2

X-Pagination-Per-Page → 10

X-Pagination-Total-Count → 157

X-Pagination-Current-Page → 2

X-Pagination-Page-Count → 16

X-Pagination-Per-Page → 30

X-Pagination-Total-Count → 157

Link: <http://localhost/posts?page=1>; rel=self,
      <http://localhost/posts?page=2>; rel=next,
      <http://localhost/posts?page=50>; rel=last

```

You can change this to an envelope structure by setting this line before `Pwoli.respond(...)`:

```js
Pwoli.serializer.collectionEnvelope = 'posts';
```

Once this is set, the response will be like below:

```json
{
    "posts": [
        {
            "id": 1,
            "title": "Post 1",
            "description": "Post 1 descriptions",
            "viewsCount": 100,
            "status": 1,
            "createdAt": "20201-11-10 00:00:00",
            "createdAt": "20201-11-10 00:00:00"
        },
        {
            "id": 1,
            "title": "Post 2",
            "description": "Post 2 descriptions",
            "viewsCount": 100,
            "status": 1,
            "createdAt": "20201-11-10 00:00:00",
            "createdAt": "20201-11-10 00:00:00"
        },
        {
            "id": 1,
            "title": "Post 3",
            "description": "Post 3 descriptions",
            "viewsCount": 100,
            "status": 1,
            "createdAt": "20201-11-10 00:00:00",
            "createdAt": "20201-11-10 00:00:00"
        }
        ... //total 10 items since default value of DataProvider.perPage is 10
    ],  // `collectionEnvelope`'s value will be the key
    "_links": {  // pagination links as returned by Pagination.getLinks()
        "self": "...",
        "next": "...",
        "last": "...",
    },
    "_meta": {  // meta information as returned by Pagination.toArray()
        "totalCount": 157,
        "pageCount": 16,
        "currentPage": 2,
        "perPage": 10,
    },
 }
```

For setting related models to the model's response, just include that association in the `dataProvider`'s query like below:

```js
dataProvider.query.include = [{ model: Author, as: 'author' }];
```

For setting additional custom fields in the model's response, just do the following steps:

```js
const models = await dataProvider.getModels();
for(let model of models){
    model.setAttributeValues({
        someField: await model.someFunction(),
        someOtherField: someOtherModel.someOtherValue,
        // model.anotherField = anotherValue;
        ...
    });
};
await dataProvider.setModels(models);
...
Pwoli.respond(res, dataProvider);
```

## Pagination

By default, the data returned is paginated with [default page size](/pwoli/api-docs/classes/Pagination.html#defaultPageSize) of 20.

You can change this by calling [Pagination.setPageSize](/pwoli/api-docs/classes/Pagination.html#setPageSize) like below:

```js
dataProvider.getPagination().setPageSize(40);
```

You can change the pageSize in the request URL too by passing the [pageSizeParam](/pwoli/api-docs/classes/Pagination.html#pageSizeParam) like this:

```
http://your-api.com/post?per-page=40
```

You can access the data of any page by passing the [pageParam](/pwoli/api-docs/classes/Pagination.html#pageParam):

```
http://your-api.com/post?page=2
```

By default, the page is 1.

## Filtering

You can filter the data by passing filter parameters to the request URL in the following way:

For instance, you want to filter by the `title` field, below should be the request URL:

```
http://your-api.com/post?Post[title]=titleToSearchFor
```

where `Post` is the [formName()](<(/pwoli/api-docs/classes/Model.html#formName)>) of the model `Post`.

By default, formName() will have the same value of the Model's name. So you don't have to set it explicitly anywhere.

You can filter by multiple parameters by adding that param in the URL like below:

```
http://your-api.com/post?Post[title]=titleToSearchFor&Post[status]=1&Post[author.name]=Mahesh
```

In the above URL, we are filtering by a related field `author.name`.

You need to override the `search()` method in your model for filtering with a related field as explained [here](/pwoli/output-data-widgets#working-with-model-relations) for output data widgets:

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

## Sorting

Sorting can be achieved by passing the [sort parameter](/pwoli/api-docs/classes/Sort.html#sortParam) in the URL as shown below:

For instance, if we need to sort by the field `title`:

```
http://your-api.com/post?sort=title //ascending order
http://your-api.com/post?sort=-title //descending order
```

You can also sort by multiple fields at once by separating them with commas:

```
http://your-api.com/post?sort=title,-created_date //title ascending, created_at descending
http://your-api.com/post?sort=-title,created_date //title descending, created_at ascending
```

To enable sorting on a related column you have to include(in the case of Sequelize) the related table and add the sorting rule to the Sort component of the data provider:

```js
// enable sorting for the related column
let sort = dataProvider.getSort();
sort.attributes['author.name'] = {
    asc: {'author', 'name', 'asc'},
    desc: {'author', 'name', 'desc'},
};
dataProvider.setSort(sort);
// ...
```

Once this is set, you can pass the sort param like below:

```
http://your-api.com/post?sort=author.name //ascending order
http://your-api.com/post?sort=-author.name //descending order
```

## Conclusion

By using the different combinations of above params and settings, you can easily filter, paginate and sort the data of any Model by minimal amount of code and thereby getting more time for setting up your frontend app.
