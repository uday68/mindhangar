/**
 * Browser-compatible database using IndexedDB
 * Replaces better-sqlite3 for browser environments
 */

const DB_NAME = 'mindhangar-bharat';
const DB_VERSION = 1;

let db: IDBDatabase | null = null;

// Store names
const STORES = {
  users: 'users',
  content: 'content',
  contentTranslations: 'contentTranslations',
  culturalContexts: 'culturalContexts',
  assessmentQuestions: 'assessmentQuestions',
  assessmentQuestionTranslations: 'assessmentQuestionTranslations',
  userProgress: 'userProgress',
  offlineCache: 'offlineCache'
};

/**
 * Initialize IndexedDB
 */
export async function initializeBrowserDB(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      console.log('✅ Browser database initialized');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Create users store
      if (!database.objectStoreNames.contains(STORES.users)) {
        const userStore = database.createObjectStore(STORES.users, { keyPath: 'id' });
        userStore.createIndex('email', 'email', { unique: true });
      }

      // Create content store
      if (!database.objectStoreNames.contains(STORES.content)) {
        const contentStore = database.createObjectStore(STORES.content, { keyPath: 'id' });
        contentStore.createIndex('subject', 'subject');
        contentStore.createIndex('grade', 'grade');
      }

      // Create content translations store
      if (!database.objectStoreNames.contains(STORES.contentTranslations)) {
        const translationStore = database.createObjectStore(STORES.contentTranslations, { keyPath: 'id' });
        translationStore.createIndex('contentId', 'contentId');
        translationStore.createIndex('language', 'language');
      }

      // Create cultural contexts store
      if (!database.objectStoreNames.contains(STORES.culturalContexts)) {
        database.createObjectStore(STORES.culturalContexts, { keyPath: 'id' });
      }

      // Create assessment questions store
      if (!database.objectStoreNames.contains(STORES.assessmentQuestions)) {
        database.createObjectStore(STORES.assessmentQuestions, { keyPath: 'id' });
      }

      // Create assessment question translations store
      if (!database.objectStoreNames.contains(STORES.assessmentQuestionTranslations)) {
        const aqtStore = database.createObjectStore(STORES.assessmentQuestionTranslations, { keyPath: 'id' });
        aqtStore.createIndex('questionId', 'questionId');
      }

      // Create user progress store
      if (!database.objectStoreNames.contains(STORES.userProgress)) {
        const progressStore = database.createObjectStore(STORES.userProgress, { keyPath: 'id' });
        progressStore.createIndex('userId', 'userId');
        progressStore.createIndex('contentId', 'contentId');
      }

      // Create offline cache store
      if (!database.objectStoreNames.contains(STORES.offlineCache)) {
        const cacheStore = database.createObjectStore(STORES.offlineCache, { keyPath: 'id' });
        cacheStore.createIndex('userId', 'userId');
        cacheStore.createIndex('contentId', 'contentId');
      }
    };
  });
}

/**
 * Get database instance
 */
export async function getBrowserDB(): Promise<IDBDatabase> {
  if (!db) {
    return await initializeBrowserDB();
  }
  return db;
}

/**
 * Generic get operation
 */
export async function get<T>(storeName: string, key: string): Promise<T | undefined> {
  const database = await getBrowserDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Generic put operation
 */
export async function put<T>(storeName: string, value: T): Promise<void> {
  const database = await getBrowserDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(value);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Generic delete operation
 */
export async function remove(storeName: string, key: string): Promise<void> {
  const database = await getBrowserDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Generic getAll operation
 */
export async function getAll<T>(storeName: string): Promise<T[]> {
  const database = await getBrowserDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Query by index
 */
export async function getByIndex<T>(
  storeName: string,
  indexName: string,
  value: any
): Promise<T[]> {
  const database = await getBrowserDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Clear all data from a store
 */
export async function clear(storeName: string): Promise<void> {
  const database = await getBrowserDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export { STORES };
