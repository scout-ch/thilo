# Thilo - Frontend of Thilo
Schweizer Pfadibüchlein Thilo, das Original.

The Thilo contains a lot of interesting and useful information about the Scouts and belongs on every Scout's bedside table and in his or her bag. Contents: The scout movement, the world we live in, scout techniques, first aid, nature and the environment, camp life, etc.

Frontend written in React.

## Big Picture
![Architecture](./documentation/architecture.png)

## Components
### Frontend
[React Frontend](https://github.com/scout-ch/thilo/tree/master/src)

### Backend
[Strapi Backend](https://github.com/scout-ch/thilo-api)

## Deployment
Run docker-compose.prod.yml file

```bash
docker-compose -f docker-compose.prod.yml up -d
```

Services
- Frontend: http://localhost:3000
- Backend: http://localhost:1337
- SHLINK: http://localhost:8080
- SHLINK ADMIN: http://localhost:8081
- Postgres: localhost:5432
- PgAdmin: http://localhost:5050

## Development
### Environment Variables
None

### Available Scripts
In the project directory, you can run:

### `npm start`
Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`
Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

## Contribute
Willst du mithelfen oder hast einen Verbesserungsvorschlag?
Schaue dir die Issues an oder erstelle ein Neues.
Wir freuen uns über jeden PR.
Bei Fragen kannst du dich an die Betreuungskommission (inhaltlich) oder die IT Kommission (technisch) wenden.

## Production
The frontend is deployed to GitHub pages.


# React Template: adapted from https://github.com/CreativeTechGuy/ReactTemplate

This repository exists as a starting point for a new React 18 application (with hooks). The build system, testing, linting, formatting, compiling, spellchecking and more are all pre-configured.

This repository should be generic enough that most people can use it out of the box. It comes with an existing "hello world" application which you can build and run right away.

It also includes all of the nice-to-haves to ensure that you code is high quality and follows best practices. This is very helpful for a beginner who needs nudges in the right direction but also helps an expert focus on the higher level problems and not worry about missing smaller errors.

## Setup

-   Be sure you have [Node 16+ installed](https://nodejs.org/en/download/)
-   If you are on Windows, you probably want to be using either [GitBash which comes with Git](https://git-scm.com/download/win) or [WSL](https://docs.microsoft.com/en-us/windows/wsl/install).
-   Run `npm ci` to install dependencies
-   Run `npm run start` to start the dev server and visit the link provided in the terminal to view it in your browser

## Core Dependencies Included

-   [React](https://reactjs.org/docs/getting-started.html) (JavaScript UI framework)
-   [Webpack](https://webpack.js.org/) (Asset bundling)
-   [TypeScript](https://www.typescriptlang.org/docs/handbook/intro.html) (JavaScript with Types)
-   [Babel](https://babeljs.io/docs/en/) (Transpiling JavaScript for older browsers)
-   [ESLint](https://eslint.org/) (Identifying and reporting errors in code)
-   [Prettier](https://prettier.io/docs/en/index.html) (Code formatter)
-   [CSpell](https://github.com/streetsidesoftware/cspell) (Code Spellchecker)
-   [SCSS](https://sass-lang.com/guide) (Enhanced CSS)
-   [Jest](https://jestjs.io/docs/en/getting-started) (Unit test framework)
-   [React Testing Library](https://testing-library.com/docs/react-testing-library/intro) (React unit test utilities)
-   [Husky](https://typicode.github.io/husky) (Git hooks - run commands on commit)

## NPM scripts

This repo assumes you are using Node 16+ and NPM 7+.

-   `npm clean-install` - install all dependencies. _Do this first before anything else_
-   `npm run start` - starts a local server which can be accessed at http://localhost:7579. As long as this server is running it'll auto refresh whenever you save changes.
-   `npm run release` - creates a release build of your application. All output files will be located in the dist folder. This also runs all of the checks to ensure the code works, is formatted, etc.
-   `npm run bundle-analysis` - opens a bundle analysis UI showing the file size of each dependency in your output JavaScript bundle.
-   `npm run lint` - runs ESLint enforcing good coding style and habits and erroring if any are broken.
    -   `npm run lint:fix` - fixes any auto-fixable ESLint errors
-   `npm run format` - runs Prettier to reformat all files
-   `npm run ts-check` - runs the TypeScript compiler to see TypeScript errors
-   `npm run spellcheck` - runs CSpell to see any typos. If the word is misidentified, add it to `cspell.json`.
-   `npm run test` - runs Jest and all unit tests
-   `npm run clean` - removes all auto-generated files and dependencies
-   `npm run list-outdated-dependencies` - lists the dependencies that have newer versions available with links to their repository and changelog
-   `npm run update-dependencies` - update and install all outdated dependencies

## Why use this instead of create-react-app?

Tools like create-react-app bring everything and the kitchen sink when setting up a new project. They are great to start quickly, but as soon as you want to customize or understand how it all works you'll have trouble. My goal is to expose all of the tools and show how easy it can be to configure from scratch. This makes it easier to debug and tweak settings to fit your needs.
