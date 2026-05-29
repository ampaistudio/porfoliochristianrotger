import { Photo } from "../types";

const DB_NAME = "PhotographerPortfolioDB";
const STORE_NAME = "photos";
const DB_VERSION = 1;

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Saves the full photos list in IndexedDB.
 */
export async function savePhotosToDB(photos: Photo[]): Promise<void> {
  try {
    const db = await getDB();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    // Clear existing objects
    const clearRequest = store.clear();
    
    await new Promise<void>((resolve, reject) => {
      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(clearRequest.error);
    });

    // Add each photo
    for (const photo of photos) {
      store.put(photo);
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error("Failed to save photos to IndexedDB:", error);
  }
}

/**
 * Loads the photos from IndexedDB. Returns null if empty.
 */
export async function loadPhotosFromDB(): Promise<Photo[] | null> {
  try {
    const db = await getDB();
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const result = request.result;
        if (result && result.length > 0) {
          resolve(result);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error("Failed to load photos from IndexedDB:", error);
    return null;
  }
}
