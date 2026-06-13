import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';
import { GenerateStickerUseCase } from '../../application/use-cases/generate-sticker.use-case';
import { GetStickerResultUseCase } from '../../application/use-cases/get-sticker-result.use-case';
import { GenerateController } from './generate.controller';

@Module({
  imports: [InfrastructureModule],
  controllers: [GenerateController],
  providers: [GenerateStickerUseCase, GetStickerResultUseCase],
})
export class GenerateModule {}
