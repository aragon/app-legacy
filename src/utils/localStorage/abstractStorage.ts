import {customJSONReplacer, customJSONReviver} from 'utils/library';

/**
 * Abstract class providing utility methods for working with localStorage.
 * This class should serve as a base for specific storage-related classes.
 */
export abstract class StorageUtils {
  // Prefix for the local storage keys.
  protected readonly prefix: string;

  /**
   * Initializes the utility with an optional prefix.
   * @param prefix - Optional key prefix for localStorage. Defaults to 'app_'.
   */
  protected constructor(prefix: string) {
    this.prefix = prefix;
  }

  /**
   * Adds the prefix to the provided key.
   * @param key - The original key.
   * @returns - Prefixed key.
   */
  private prefixedKey(key: string): string {
    return this.prefix + key;
  }

  /**
   * Sets an item in localStorage.
   * @param key - The key under which the data will be stored.
   * @param value - The data to be stored.
   */
  protected setItem<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value, customJSONReplacer);
      localStorage.setItem(this.prefixedKey(key), serializedValue);
    } catch (error) {
      console.error('Error setting item to localStorage:', error);
    }
  }

  /**
   * Retrieves an item from localStorage.
   * @param key - The key of the data to be retrieved.
   * @returns - The retrieved data, or null if not found.
   */
  protected getItem<T>(key: string): T | null {
    try {
      const serializedValue = localStorage.getItem(this.prefixedKey(key));
      if (serializedValue === null) {
        return null;
      }
      return JSON.parse(serializedValue, customJSONReviver) as T;
    } catch (error) {
      console.error('Error getting item from localStorage:', error);
      return null;
    }
  }

  /**
   * Removes an item from localStorage.
   * @param key - The key of the data to be removed.
   */
  protected removeItem(key: string): void {
    try {
      localStorage.removeItem(this.prefixedKey(key));
    } catch (error) {
      console.error('Error removing item from localStorage:', error);
    }
  }

  /**
   * Clears all items from localStorage.
   */
  protected purge(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
}
