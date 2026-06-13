export const OBJECT_STORAGE_PORT = Symbol('IObjectStoragePort');

/** Storage de objetos (MinIO/S3 no MVP). Assets nunca no filesystem do container. */
export interface IObjectStoragePort {
  put(key: string, body: Buffer, contentType: string): Promise<void>;
  signedUrl(key: string, ttlSeconds?: number): Promise<string>;
}
