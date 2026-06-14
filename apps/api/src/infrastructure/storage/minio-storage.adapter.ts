import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client } from 'minio';
import type { IObjectStoragePort } from '../../domain/ports/object-storage.port';

/**
 * F04 — adapter MinIO (S3). Assets nunca no filesystem do container (RN-F04-01).
 * Credenciais só no backend (RN-F04-03). Bucket criado on-init (REQ-F04-03).
 *
 * O cliente é criado de forma preguiçosa para a API conseguir subir mesmo sem
 * MinIO configurado (fase atual); uploads só falham quando realmente usados.
 */
@Injectable()
export class MinioStorageAdapter implements IObjectStoragePort, OnModuleInit {
  private readonly logger = new Logger(MinioStorageAdapter.name);
  private readonly bucket = process.env.MINIO_BUCKET ?? 'stickers';
  private _client?: Client;

  private client(): Client {
    if (!this._client) {
      this._client = new Client({
        endPoint: process.env.MINIO_ENDPOINT ?? 'localhost',
        port: Number(process.env.MINIO_PORT ?? 9000),
        useSSL: process.env.MINIO_USE_SSL === 'true',
        accessKey: process.env.MINIO_ACCESS_KEY ?? '',
        secretKey: process.env.MINIO_SECRET_KEY ?? '',
      });
    }
    return this._client;
  }

  /** Cria o bucket se ausente (REQ-F04-03). Best-effort: não derruba o boot. */
  async onModuleInit(): Promise<void> {
    try {
      const exists = await this.client().bucketExists(this.bucket);
      if (!exists) {
        await this.client().makeBucket(this.bucket);
        this.logger.log(`Bucket '${this.bucket}' criado`);
      }
    } catch (e) {
      this.logger.warn(
        `MinIO indisponível no boot ('${this.bucket}'): ${e}. ` +
          'Uploads falharão até configurar as credenciais.',
      );
    }
  }

  async put(key: string, body: Buffer, contentType: string): Promise<void> {
    await this.client().putObject(this.bucket, key, body, body.length, {
      'Content-Type': contentType,
    });
  }

  async signedUrl(
    key: string,
    ttlSeconds = Number(process.env.SIGNED_URL_TTL ?? 3600),
  ): Promise<string> {
    return this.client().presignedGetObject(this.bucket, key, ttlSeconds);
  }
}
