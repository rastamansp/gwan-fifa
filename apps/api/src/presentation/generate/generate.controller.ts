import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { GenerateResponse, StickerResult } from '@gwan-fifa/core';
import { GenerateStickerUseCase } from '../../application/use-cases/generate-sticker.use-case';
import { GetStickerResultUseCase } from '../../application/use-cases/get-sticker-result.use-case';
import { GenerateDto } from './dto/generate.dto';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB (NFR-SEC-02)
const ALLOWED_MIME = /image\/(png|jpe?g|webp)/;

/**
 * Camada de apresentação: só mapeia DTO ↔ use case (RN-F05-01).
 * Sem prefixo no controller — o prefixo global `/api` é aplicado em main.ts
 * (REQ-F00-06). Rotas finais: `/api/generate`, `/api/result/:id`, `/api/health`.
 */
@Controller()
export class GenerateController {
  constructor(
    private readonly generate: GenerateStickerUseCase,
    private readonly getResult: GetStickerResultUseCase,
  ) {}

  @Post('generate')
  @HttpCode(202)
  @UseInterceptors(FileInterceptor('file'))
  create(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: ALLOWED_MIME })
        .addMaxSizeValidator({ maxSize: MAX_UPLOAD_BYTES })
        .build({ fileIsRequired: true }),
    )
    file: Express.Multer.File,
    @Body() dto: GenerateDto,
  ): Promise<GenerateResponse> {
    if (!file?.buffer) {
      throw new BadRequestException('file is required');
    }
    return this.generate.execute(file.buffer, file.mimetype, dto);
  }

  @Get('result/:id')
  result(@Param('id') id: string): Promise<StickerResult> {
    return this.getResult.execute(id);
  }

  @Get('health')
  health(): { status: 'ok' } {
    return { status: 'ok' };
  }
}
