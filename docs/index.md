## Pwoli.js

Pwoli is a NodeJS/TypeScript framework written in TypeScript which can work independantly on a raw NodeJS/TypeScript environment OR, in co-ordination with any other frameworks or libraries like Express.js.

Pwoli can connect to any kind of ORMs by implementing thier corresponding [ORM Adapters](/pwoli/api-docs/classes/ORMAdapter.html) and works with [Sequelize](https://sequelize.org) out of the box at present by [SequelizeAdapter](/pwoli/api-docs/classes/SequelizeAdapter.html).

> This means that, all Sequelize supported databases like PostgreSQL, MySQL, MariaDB, SQLite, and Microsoft SQL Server are readily usable with Pwoli at present.
>
> For MongoDB support, a MongooseAdapter implementing is to be implemented. Please see (how to use a different ORM)[https://internetmango.github.io/pwoli/using-another-orm]

_Pwoli means "super awesome" and our intention is to make web app development "super awesome"_

_A basic example of the API features provided by Pwoli:_

<p align="center"><img src="https://github.com/internetmango/pwoli/blob/master/docs/images/API.gif?raw=true"  style="margin-left: auto; margin-right: auto;"/></p>

_A simple GridView:_

<p align="center"><img src="https://github.com/internetmango/pwoli/blob/master/docs/images/GridView_big.gif?raw=true"  style="margin-left: auto; margin-right: auto;"/></p>

_A bit more complex GridView:_

<p align="center"><img src="https://github.com/internetmango/pwoli/blob/master/docs/images/GridView2.gif?raw=true"  style="margin-left: auto; margin-right: auto;"/></p>

_A simple ListView:_

<p align="center"><img src="https://github.com/internetmango/pwoli/blob/master/docs/images/ListView.gif?raw=true"  style="margin-left: auto; margin-right: auto;"/></p>

_An example of ActiveForm's capabilities:_

<p align="center"><img src="https://github.com/internetmango/pwoli/blob/master/docs/images/ActiveForm.gif?raw=true"  style="margin-left: auto; margin-right: auto;"/></p>

### Main Features

-   Fully flexible and extensible - thanks to the OOP based architecture.
-   Frontend widgets like [ActiveForm](/pwoli/input-forms), [GridView, ListView](/pwoli/output-data-widgets) for SSR(Server Side HTML Rendering) applications.
-   [Simple-to-setup REST APIs](/pwoli/rest-api) for the backends of Single Page Applications(like React, Angular, Vue etc.).
-   Works on both NodeJS and TypeScript applications.
-   Has reasonable defaults to get you started with little or zero config.
-   Well documented and [type](https://www.typescriptlang.org)d code for [IDE Intellisense](https://en.wikipedia.org/wiki/Intelligent_code_completion).
-   You can use Pwoli on an ongoing project, and ofcourse you can start new projects with Pwoli.

### Installation

```markdown
npm install pwoli@latest
```

If you are using an ORM other than Sequelize or even a customized version of Sequelize, [click here](/pwoli/using-another-orm)
Enter these lines in your application's entry script(most probably index.ts or index.js)

```js
import { Application as Pwoli } from 'pwoli'; //if using ES6 modules or "type": "module" is set in your package.json
//if the above doesn't work, try the below two lines as you might be using CommonJS:
const pkg = require('pwoli'); //if using CommonJS
const Pwoli = pkg.Application;
// Pwoli is loaded!

// Now set the viewPath for finding the views:
// Please note: You don't need to set this if your application is just a REST API service
Pwoli.setViewPath(path.join(__dirname, 'views')); // The base path in which your view files are stored. Only applicable for SSR apps.

//You're ready to go!
```

### Get Started

-   Please note: If you are building an SPA or REST APIs, [click here](/pwoli/rest-api) to jump to the tutorial on learning how to use Pwoli for rendering data from backend servers in a paginated, filtered and sorted manner for any model with the matter of a couple of lines of code.

Check out on one of our guides below for learning how to use Pwoli's features:

-   [Data Widgets - GridViews, ListViews](/pwoli/output-data-widgets)
-   [Data Providers - ActiveDataProvider, ArrayDataProvider](/pwoli/output-data-providers)
-   [Creating Forms - via ActiveForms](/pwoli/input-forms)
-   [Validating Input - via Model validations and ActiveForms](/pwoli/input-validation)
-   [Html helper - to help you do anything in the HTML side](/pwoli/html-helper)
-   [REST APIs - Data Rendering made easy with a few lines](/pwoli/rest-api)
-   [Using a different ORM - If you are using an ORM other than Sequelize](/pwoli/using-another-orm)

### Try it out <span id="sample-apps"></span>

We have made four sample apps in different environments for you to get started quickly by trying them out in your local:

-   [Sample App - Pwoli with NodeJS](https://github.com/internetmango/pwoli-node-sample)
-   [Sample App - Pwoli with TypeScript](https://github.com/internetmango/pwoli-nodejs-typescript-sample)
-   [Sample App - Pwoli with Express.js and NodeJS](https://github.com/internetmango/pwoli-express-sample)
-   [Sample App - Pwoli with Express.js and TypeScript](https://github.com/internetmango/pwoli-express-typescript-sample)

### Credits

Pwoli is inspired from PHP's [Yii framework](https://www.yiiframework.com).

Kudos to [Mahesh](https://github.com/codespede), who is the brain behind Pwoli, and has high regards to Yii framework & he believes that this framework and its architecture has shaped his thoughts on modularized development methodologies.

Last but not least, thanks to [Yadu Dev](https://github.com/yadavgoku) for his contributions to Pwoli.

### Support or Contact

Pwoli is created at InternetMango.

Please feel free to shoot a mail to info@internetmango.com for any queries or concerns.

We'll be starting our Slack channel soon where you can directly chat with us on clearing your queries.
