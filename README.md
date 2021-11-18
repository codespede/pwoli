## Pwoli.js

Pwoli is a NodeJS/TypeScript framework written in TypeScript which can work independantly on a raw NodeJS/TypeScript environement OR, in co-ordination with any other frameworks or libraries like Express.js.

Pwoli can connect to any kind of ORMs by implementing thier corresponding [ORM Adapters](https://internetmango.github.io/pwoli/api-docs/classes/ORMAdapter.html) and works with [Sequelize](https://sequelize.org) out of the box at present by [SequelizeAdapter](https://internetmango.github.io/pwoli/api-docs/classes/SequelizeAdapter.html).

_This means that, all Sequelize supported databases like PostgreSQL, MySQL, MariaDB, SQLite, and Microsoft SQL Server are readily usable with Pwoli at present._

_For any other DB/ORM support, an ORM Adapter implementing [IORMAdapter](https://internetmango.github.io/pwoli/api-docs/interfaces/IORMAdapter.html) has to be implemented. Please see [how to use a different ORM](https://internetmango.github.io/pwoli/using-another-orm)_

_Pwoli means "super awesome" and our intention is to make web app development "super awesome"_

### Main Features

-   Fully flexible and extensible - thanks to the OOP based architecture.
-   Frontend widgets like [ActiveForm](https://internetmango.github.io/pwoli/input-forms), [GridView, ListView](https://internetmango.github.io/pwoli/output-data-widgets) for SSR(Server Side HTML Rendering) applications.
-   [Simple-to-setup REST APIs](https://internetmango.github.io/pwoli/rest-api) for the backends of SPA applications, Mobile apps and other API consumers.
-   Works on both NodeJS and TypeScript applications.
-   Has reasonable defaults.
-   Well documented and [type](https://www.typescriptlang.org)d code for [IDE Intellisense](https://en.wikipedia.org/wiki/Intelligent_code_completion).
-   Can be used in an ongoing project or a new project. Pwoli doesn't require that for using it, the project should be started from scratch.

### Installation

```markdown
npm install pwoli@latest
```

If you are using an ORM other than Sequelize or even a customized version of Sequelize, [click here](https://internetmango.github.io/pwoli/using-another-orm)
Enter these lines in your application's entry script(most probably index.ts or index.js)

```js
import { Application as Pwoli } from 'pwoli'; //if using ES6 modules or "type": "module" is set in your package.json
//if the above doesn't work, try the below two lines as you might be using CommonJS:
const pkg = require('pwoli'); //if using CommonJS
const Pwoli = pkg.Application;
// Pwoli is loaded!
//Now set the viewPath for finding the views:
Pwoli.setViewPath(path.join(\_\_dirname, 'views')); // The base path in which your view files are stored. Only applicable for SSR apps.

//You're ready to go!
```

### Get Started

-   Please note: If you are building an SPA or REST APIs, [click here](https://internetmango.github.io/pwoli/rest-api) to jump to the tutorial on learning how to use Pwoli for rendering data from backend servers in a paginated, filtered and sorted manner for any model with the matter of a couple of lines of code.

Check out on one of our guides below for learning how to use Pwoli's features:

-   [Data Widgets - GridViews, ListViews](https://internetmango.github.io/pwoli/output-data-widgets)
-   [Data Providers - ActiveDataProvider, ArrayDataProvider](https://internetmango.github.io/pwoli/output-data-providers)
-   [Creating Forms - via ActiveForms](https://internetmango.github.io/pwoli/input-forms)
-   [Validating Input - via Model validations and ActiveForms](https://internetmango.github.io/pwoli/input-validation)
-   [Html helper - to help you do anything in the HTML side](https://internetmango.github.io/pwoli/html-helper)
-   [REST APIs - Data Rendering made easy with a few lines](https://internetmango.github.io/pwoli/rest-api)
-   [Using a different ORM - If you are using an ORM other than Sequelize](https://internetmango.github.io/pwoli/using-another-orm)

### Try it out

We have made four sample apps in different environments for you to get started quickly by trying them out in your local:

-   [Sample App - Pwoli with NodeJS](https://github.com/internetmango/pwoli-node-sample)
-   [Sample App - Pwoli with TypeScript](https://github.com/internetmango/pwoli-nodejs-typescript-sample)
-   [Sample App - Pwoli with Express.js and NodeJS](https://github.com/internetmango/pwoli-express-sample)
-   [Sample App - Pwoli with Express.js and TypeScript](https://github.com/internetmango/pwoli-express-typescript-sample)

### Credits

Pwoli is inspired from PHP's [Yii framework](https://www.yiiframework.com).

Kudos to [Mahesh](https://github.com/codespede), who is the brain behind Pwoli, and has high regards to Yii framework & he believes that this framework and its architecture has shaped his thoughts on modularized development methodologies.

Last but not least, thanks to [Yadu Dev](https://github.com/yadavgoku) for his contributions to Pwoli.

### Tests

```
npm run test
```

More tests are invited as contributions!

### Support or Contact

Pwoli is created at InternetMango.

Please feel free to shoot a mail to info@internetmango.com for any queries or concerns.

We'll be starting our Slack channel soon where you can directly chat with us on clearing your queries.
