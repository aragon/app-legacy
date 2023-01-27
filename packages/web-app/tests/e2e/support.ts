import '@synthetixio/synpress/support/index';
import type { RunContext } from "./runContext";

before(() => {
    try {
        cy.readFile<RunContext>('tests/e2e/runContext.json', { timeout: 1000 })
          .then(rc => {
            if (Object.keys(rc).length == 0) {
                const runIdArray = new Uint8Array(16);
                crypto.getRandomValues(runIdArray);
                const runIdParts = [] as string[];
                runIdArray.forEach((byte) => runIdParts.push(byte.toString(16)));
                rc = {
                    runId: runIdArray.join(''),
                    testData: {}
                };
            }
            cy.wrap(rc.runId).as('runId');
            cy.wrap(rc.testData).as('testData');
          });
    } catch {
    }
});

after(function () {
    const rc = {
        runId: this.runId,
        testData: this.testData
    };
    cy.writeFile('tests/e2e/runContext.json', rc, { timeout: 2000 });
});