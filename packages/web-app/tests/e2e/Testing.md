# End to End Testing

[Synpress](https://github.com/Synthetixio/synpress), a package based on Cypress, is used for end to end testing. The relevant files are located at `/packages/web-app/tests/e2e` (this base path is assumed for any other file locations metioned).

## First use

First use requires running `yarn` in the application root to update packages, plus needs an update to `/packages/web-app/.env.development.local` to add the wallet details that Synpress will use.

## Running tests

The package.json command to run any tests in `/specs` is `e2e`. Note this sets up Metamask from scratch every time.

## Pages

Pages are classes which include reusable test functions for different areas of the app.

- LoginComponent: handles functions to login i.e. connect wallet in a test

## Testing with proposal delays

There is an additional bit of infrastructure to assist with dealing with the problem of having to wait for proposals to change status. This works by sharing data between multiple test runs creating a *session*. The last session is ended and the next started by running the command `e2e:reset`.

`support.ts` includes definition of aliases which are read out of the file `runContext.json` at the beginning of each run. Cypress aliases can be read within tests as properties on `this` e.g. `this.sessionId`. These are:
- `sessionId`: an 8 character random string which is generated if runContext.json is empty (contains `{}`). You can set runContext.json to empty by running the command `e2e:reset`.
- `testData`: is a map of string to any value which can be used to store values within a session.

The intent is that `sessionId` is used to append to the names of created entities within a testing session, e.g. a DAO could be named `TestDAO-${this.sessionId}`. These can then be reused across tests run at different times, so a group of tests could set up a DAO and a number of proposals for testing all using the `sessionId` to identify them. The later another group of tests could continue testing with these proposals after they have become active. To start this from the beginning again, use `e2e:reset`.

To update the `testData` property from a test we can write something like:
```
cy.wrap({ ...this.testData, x: 1 }).as('testData');
```

## Synpress config

Config settings are found in `/packages/web-app/synpress.config.js`. This is standard Cypress config and the details can be found [here](https://docs.cypress.io/guides/references/configuration).