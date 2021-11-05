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

Markdown is a lightweight and easy-to-use syntax for styling your writing. It includes conventions for

### Installation

```markdown
npm install pwoli
```

Enter these lines in your application's entry script(most probably index.ts or index.js)

```markdown
import { Application as Pwoli } from 'pwoli';
import { Model } from 'sequelize'; // If your ORM is Sequelize. Otherwise, the corresponding base model class of your ORM.
Application.setORMModelClass(Model);
Application.setViewPath(path.join(\_\_dirname, 'views')); // The base path in which your view files are stored. Only applicable for SSR apps.

You're ready to go!
```

### Get Started

-   Please note: If you are building an SPA, click here to jump to the tutorial on learning how to use Pwoli for rendering data from backend servers in a paginated, filtered and sorted manner for any model with the matter of a couple of lines of code.

Click on one of our guides below for learning how to use the Widgets and using DataProvider for delivering data for them.

```markdown
Syntax highlighted code block

# Header 1

## Header 2

### Header 3

-   Bulleted
-   List

1. Numbered
2. List

**Bold** and _Italic_ and `Code` text

[Link](url) and ![Image](src)
```

For more details see [GitHub Flavored Markdown](https://guides.github.com/features/mastering-markdown/).

### Jekyll Themes

Your Pages site will use the layout and styles from the Jekyll theme you have selected in your [repository settings](https://github.com/internetmango/pwoli/settings/pages). The name of this theme is saved in the Jekyll `_config.yml` configuration file.

### Support or Contact

Having trouble with Pages? Check out our [documentation](https://docs.github.com/categories/github-pages-basics/) or [contact support](https://support.github.com/contact) and we’ll help you sort it out.
