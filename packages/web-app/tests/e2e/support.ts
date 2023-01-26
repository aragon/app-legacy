import '@synthetixio/synpress/support/index';
import { RunContext, runContext } from "./runContext";

before(() => {
    try {
        cy.readFile<RunContext>('tests/e2e/runContext.json', { timeout: 1000 }).then(rc => { runContext.testData = rc.testData; });
    } catch { }
});
after(() => cy.writeFile('runContext.json', runContext, { timeout: 2000 }));