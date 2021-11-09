## Using a different ORM

### Using a customized/extended version of Sequelize itself

If you need to use your own customized or extended version of Sequelize, please do the following steps:

-   Create a file with name exactly as `orm-model-config.cjs` in the root directory(same level of package.json)
-   In this file, insert the following lines:
    ```js
    const BaseSequelizeModel = require("<path-to-your-custom-sequelize-model>");
    //additional customisations to the the base model like extending to a new class etc., if any.. eg:-
    class MySequelizeModel extends BaseSequelizeModel{
        myProp = 'myValue';
        ...
    }
    module.exports = MySequelizeModel;
    ```
-   Once this file is placed, the custom class will be used as the base model which is to be extended by each [Model](/pwoli/api-docs/classes/Model.html) of Pwoli.

### Using an ORM other than Sequelize

If you are using a different ORM other than Sequelize (like DynamoDB or Mongoose for MongoDB), you can use it with Pwoli by carrying out the following steps:

-   Implement an ORMAdapter which should implement the interface [IORMAdapter](/pwoli/api-docs/interfaces/IORMAdapter.html)
-   Create a file with name exactly as `orm-model-config.cjs` in the root directory(same level of package.json)
-   In this file, insert the following lines:
    ```js
    //like sequelize.Model for Sequelize, mongoose.Model for Mongoose..
    const BaseModel = require('<path-to-base-model-class-of-the-orm>');
    module.exports = BaseModel;
    ```
-   In your application's entry script(index.js or index.ts), just after importing `Pwoli`, place the following lines(Here, assuming that the ORM used is Mongoose):
    ```js
    import { Application as Pwoli } from 'pwoli';
    import MyMongooseAdapter from '<path-to-MyMongooseAdapter>';
    Pwoli.ormAdapterClasses['mongoose'] = MyMongooseAdapter; //
    Pwoli.setORMAdapter(new Pwoli.ormAdapterClasses['mongoose']());
    ```
-   You're done! Pwoli is ready to use Mongoose as the ORM for all it's Components and Widgets. Likewise, this same procedure can be done for any ORM out there.
