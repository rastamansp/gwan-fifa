import { Injectable, NotImplementedException } from '@nestjs/common';
import type { IObjectStoragePort } from '../../domain/ports/object-storage.port';

/**
 * STUB (F00). Implementação real em **F04** (cliente MinIO, bucket `stickers`,
 * `onModuleInit` cria bucket, `presignedGetObject`). Credenciais só no backend.
 * Assets nunca no filesystem do container (RN-F04-01).
 *
 * Mantido como no-op no boot para a API subir sem MinIO no F00 (health funciona).
 */
@Injectable()
export class MinioStorageAdapter implements IObjectStoragePort {
  async put(_key: string, _body: Buffer, _contentType: string): Promise<void> {
    throw new NotImplementedException(
      'MinioStorageAdapter.put — implementar em F04',
    );
  }

  async signedUrl(_key: string, _ttlSeconds?: number): Promise<string> {
    throw new NotImplementedException(
      'MinioStorageAdapter.signedUrl — implementar em F04',
    );
  }
}
