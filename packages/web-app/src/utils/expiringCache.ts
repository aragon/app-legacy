export class ExpiringCache<T, K = string> {
  private cache: Map<K, T & {_timestamp: number}> = new Map<
    K,
    T & {_timestamp: number}
  >();

  constructor(public expiryMs: number) {}

  private expiryQueue: K[] = [];

  private expireItems() {
    let key: K | undefined = this.expiryQueue[0];
    const now = new Date().getTime();
    while (key && this.cache.get(key)!._timestamp < now - this.expiryMs) {
      this.cache.delete(key);
      this.expiryQueue.shift();
      key = this.expiryQueue[0];
    }
  }

  private delete(key: K) {
    this.cache.delete(key);
    const expiryPos = this.expiryQueue.findIndex(k => k === key);
    if (expiryPos >= 0) this.expiryQueue.splice(expiryPos, 1);
  }

  add(key: K, value: T) {
    const timestamp = new Date().getTime();
    const item = {...value, _timestamp: timestamp};
    this.delete(key); // need to update timestamp
    this.expireItems();
    this.cache.set(key, item);
    this.expiryQueue.push(key);
    console.log(
      `CACHE ADD ${key} items: ${this.cache.size} expiryQ: ${this.expiryQueue.length}`
    );
  }

  get(key: K): T {
    const foundItem = this.cache.get(key);
    if (foundItem) {
      foundItem._timestamp = new Date().getTime(); // update timestamp
      this.cache.set(key, foundItem);
      console.log(`CACHE HIT ${key}`);
    } else {
      console.log(`CACHE MISS ${key}`);
    }
    return foundItem as T;
  }
}
