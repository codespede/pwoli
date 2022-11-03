## Using a different ORM

### Using Mongoose (for MongoDB)

For using Mongoose as the ORM, please do the following steps:

-   Create a file with name exactly as `orm-model-config.cjs` in the root directory(same level of package.json)
-   In this file, insert the following lines:
    ```js
    class Model{
        static ormKey = 'mongoose';
    }
    module.exports = Model;
    ```
-   Pwoli is now ready for Mongoose!
-   [Click here](/pwoli/using-mongoose) to learn more about using Mongoose with Pwoli.

### Using an ORM other than Sequelize or Mongoose

If you are using a different ORM other than Sequelize or Mongoose (like DynamoDB), you can use it with Pwoli by carrying out the following steps:

-   Implement an ORMAdapter which should implement the interface [IORMAdapter](/pwoli/api-docs/interfaces/IORMAdapter.html) - Just like [SequelizeAdapter](/pwoli/api-docs/classes/SequelizeAdapter.html) or [MongooseAdapter](/pwoli/api-docs/classes/MongooseAdapter.html)
-   Create a file with name exactly as `orm-model-config.cjs` in the root directory(same level of package.json)
-   In this file, insert the following lines:
    ```js
    //like sequelize.Model for Sequelize, mongoose.Model for Mongoose..
    const BaseModel = require('<path-to-base-model-class-of-the-orm>');
    module.exports = BaseModel;
    ```
-   In your application's entry script(index.js or index.ts), just after importing `Pwoli`, place the following lines(Here, assuming that the ORM used is DynamoDB):
    ```js
    import { Application as Pwoli } from 'pwoli';
    import MyDynamoDBAdapter from '<path-to-MyDynamoDBAdapter>';
    Pwoli.ormAdapterClasses['dynamodb'] = MyDynamoDBAdapter; //
    Pwoli.setORMAdapter(new Pwoli.ormAdapterClasses['dynamodb']());
    ```
-   You're done! Pwoli is ready to use DynamoDB as the ORM for all it's Components and Widgets. Likewise, this same procedure can be done for any ORM out there.
