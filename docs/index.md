## Pwoli

Pwoli is a Node JS framework written in TypeScript which can work independantly on a raw NodeJS/TypeScript environement OR, in co-ordination with other frameworks like Express.js.

Pwoli can connect to any kind of ORMs by implementing thier corresponding [ORM Adapters](/pwoli/api-docs/classes/ORMAdapter.html) and works with [Sequelize](https://sequelize.org) out of the box at present by [SequelizeAdapter](/pwoli/api-docs/classes/SequelizeAdapter.html).

### Main Features

-   Fully flexible and extensible - thanks to the OOP based architecture.
-   Frontend widgets like ActiveForm, GridView, ListView for SSR applications.
-   [DataProviders](/pwoli/api-docs/classes/DataProvider.html) and [Serializers](/pwoli/api-docs/classes/Serializer.html) for the backends of SPA applications.
-   Works on both NodeJS and TypeScript applications.
-   Has reasonable defaults.
-   Well documented and [type](https://www.typescriptlang.org)d code for [IDE Intellisense](https://en.wikipedia.org/wiki/Intelligent_code_completion).
-   Can be used in an ongoing project. Pwoli doesn't require that for using it, the project should be started from scratch.

Markdown is a lightweight and easy-to-use syntax for styling your writing. It includes conventions for

### Installation

```markdown
npm install pwoli@latest
```

If you are using an ORM other than Sequelize or even a customized version of Sequelize, [click here](/pwoli/using-another-orm)
Enter these lines in your application's entry script(most probably index.ts or index.js)

```markdown
import { Application as Pwoli } from 'pwoli'; //if using ES6 modules or "type": "module" is set in your package.json
//if the above doesn't work, try the below two lines as you might be using CommonJS:
const pkg = require('pwoli'); //if using CommonJS
const Pwoli = pkg.Application;
// Pwoli is loaded!
//Now set the viewPath for finding the views:
Pwoli.setViewPath(path.join(\_\_dirname, 'views')); // The base path in which your view files are stored. Only applicable for SSR apps.

You're ready to go!
```

### Get Started

-   Please note: If you are building an SPA or REST APIs, [click here](/pwoli/rest-api) to jump to the tutorial on learning how to use Pwoli for rendering data from backend servers in a paginated, filtered and sorted manner for any model with the matter of a couple of lines of code.

Click on one of our guides below for learning how to use Pwoli's features:

-   Data Widgets - GridViews, ListViews
-   Data Providers - ActiveDataProvider, ArrayDataProvider
-   Creating Forms - via ActiveForms
-   Validating Input - via Model validations and ActiveForms
-   Html helper - to help you do anything in the HTML side
-   REST APIs - Data Rendering made easy with a few lines
-   Using a different ORM - If you are using an ORM other than Sequelize

### Try it out

We have made four sample apps for you to get started quickly by trying them out in your local:

-   Sample App - Pwoli with NodeJS
-   Sample App - Pwoli with TypeScript
-   Sample App - Pwoli with Express.js and NodeJS
-   Sample App - Pwoli with Express.js and TypeScript

### Support or Contact

Having trouble with using Pwoli? Join our Slack channel and feel free to ask your doubts there.
