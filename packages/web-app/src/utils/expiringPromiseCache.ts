interface Expiry<K> {
  key: K;
  expiry: number;
}

/**
 * Cache for promises for data retrieval processes: can be used to ensure
 * multiple simultaneous requests are not made for the same resource
 */
export class ExpiringPromiseCache<T, K = string> {
  private cache: Map<K, Promise<T>> = new Map<K, Promise<T>>();

  /**
   * @param {number} expiryMs Minimum time a promise is held in cache after it has resolved
   */
  constructor(public expiryMs: number) {}

  private expiryQueue: Expiry<K>[] = [];

  private expireItems() {
    const now = new Date().getTime();
    while (this.expiryQueue.length > 0 && this.expiryQueue[0].expiry < now) {
      const {key} = this.expiryQueue.shift()!;
      this.cache.delete(key);
    }
  }

  /**
   * Add a promise to the cache, removing any expired promises at the same time
   * @param {K} key The key for the stored item
   * @param {Promise<T> | undefined} promise The promise to store, allowed to be undefined
   * @returns {Promise<T> | undefined} The promise passed in for chaining
   */
  add(key: K, promise: Promise<T> | undefined) {
    if (!promise) return promise;

    this.expireItems();
    this.cache.set(
      key,
      promise.then(res => {
        const expiry = new Date().getTime() + this.expiryMs;
        this.expiryQueue.push({key, expiry});
        return res;
      })
    );
    return promise;
  }

  /**
   * Get the promise with key supplied. Note you can get the resolved value
   * of a promise multiple times.
   * @param key Cache key of promise
   * @returns {Promise<T> | undefined} The promise or undefined if it's not present in cache
   */
  get(key: K): Promise<T> | undefined {
    const foundPromise = this.cache.get(key);
    return foundPromise;
  }
}
