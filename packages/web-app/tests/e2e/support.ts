import '@synthetixio/synpress/support/index';
import type {RunContext} from './runContext';

before(() => {
  cy.readFile<RunContext>('tests/e2e/runContext.json', {timeout: 1000}).then(
    rc => {
      if (Object.keys(rc).length == 0) {
        const runIdArray = new Uint8Array(4);
        crypto.getRandomValues(runIdArray);
        const runIdParts = [] as string[];
        runIdArray.forEach(byte => runIdParts.push(byte.toString(16)));
        rc = {
          sessionId: runIdArray.join(''),
          testData: {},
        };
      }
      cy.wrap(rc.sessionId).as('sessionId');
      cy.wrap(rc.testData).as('testData');
    }
  );
});

after(function () {
  const rc = {
    sessionId: this.sessionId,
    testData: this.testData,
  };
  cy.writeFile('tests/e2e/runContext.json', rc, {timeout: 2000});
});
