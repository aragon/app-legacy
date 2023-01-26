export interface RunContext {
    runId: string;
    testData: Record<string, any>;
}

const runIdArray = new Uint8Array(16);
crypto.getRandomValues(runIdArray);
const runIdParts = [] as string[];
runIdArray.forEach((byte) => runIdParts.push(byte.toString(16)));

export const runContext: RunContext = {
    runId: runIdParts.join(''),
    testData: {}
};