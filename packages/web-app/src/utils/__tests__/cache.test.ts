import {ExpiringCache} from 'utils/expiringCache';
import {ExpiringPromiseCache} from 'utils/expiringPromiseCache';

interface TestItem {
  x: string;
}

const wait = (ms: number) =>
  new Promise<void>(res => setTimeout(() => res(), ms));

describe('Expiring Cache', () => {
  test('Add and retrieve', () => {
    const cache = new ExpiringCache<TestItem>(10);
    cache.add('abc', {x: 'hello'} as TestItem);
    const gotItem = cache.get('abc');
    expect(gotItem?.x).toBe('hello');
  });
  test('Add and expire', async () => {
    const cache = new ExpiringCache<TestItem>(10);
    cache.add('abc', {x: 'hello'} as TestItem);
    await wait(20);
    cache.add('def', {x: 'goodbye'} as TestItem);
    const gotItem = cache.get('abc');
    expect(gotItem).toBeUndefined();
  });
  test('Add several and retrieve', async () => {
    const cache = new ExpiringCache<TestItem>(10);
    cache.add('abc', {x: 'hello'} as TestItem);
    await wait(20);
    cache.add('def', {x: 'goodbye'} as TestItem);
    cache.add('ghi', {x: 'chicken'} as TestItem);
    const gotItem = cache.get('def');
    expect(gotItem?.x).toBe('goodbye');
  });
});

const testPromise = async (delayMs: number, val: string) => {
  await wait(delayMs);
  return val;
};

describe('Expiring Promise Cache', () => {
  test('Add unresolved promise', async () => {
    const cache = new ExpiringPromiseCache(10);
    cache.add('xxx', testPromise(20, 'hello'));
    const gotItem = cache.get('xxx');
    expect(gotItem).not.toBeUndefined();
    const val = await gotItem;
    expect(val).toBe('hello');
  });
  test('Expiry starts after promise resolves', async () => {
    const cache = new ExpiringPromiseCache(10);
    cache.add('xxx', testPromise(20, 'hello'));
    const gotItem = cache.get('xxx');
    await gotItem;
    cache.add('yyy', testPromise(20, 'goodbye'));
    const gotItem2 = cache.get('xxx');
    expect(gotItem2).not.toBeUndefined();
  });
  test('Expiry', async () => {
    const cache = new ExpiringPromiseCache(10);
    cache.add('xxx', testPromise(20, 'hello'));
    const gotItem = cache.get('xxx');
    await gotItem;
    await wait(20);
    cache.add('yyy', testPromise(20, 'goodbye'));
    const gotItem2 = cache.get('xxx');
    expect(gotItem2).toBeUndefined();
  });
  test('Multiple', async () => {
    const cache = new ExpiringPromiseCache(10);
    cache.add('xxx', testPromise(20, 'hello'));
    cache.add('aaa', testPromise(10, 'morning'));
    const gotItem = cache.get('aaa');
    await gotItem;
    await wait(15);
    cache.add('qqq', testPromise(20, 'evening'));
    cache.add('yyy', testPromise(20, 'goodbye'));
    const gotItem2 = cache.get('aaa');
    expect(gotItem2).toBeUndefined();
    const gotItem3 = cache.get('qqq');
    expect(gotItem3).not.toBeUndefined();
    const val = await gotItem3;
    expect(val).toBe('evening');
  });
});
