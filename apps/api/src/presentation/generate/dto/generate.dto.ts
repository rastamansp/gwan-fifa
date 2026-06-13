import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';
import type { StickerData } from '@gwan-fifa/core';

/**
 * DTO do multipart de `POST /api/generate`. Espelha `StickerDataSchema`
 * (packages/core). Validado por `ValidationPipe` global (whitelist + transform).
 * O arquivo (`file`) é validado no controller (MIME/tamanho — F01/NFR-SEC-02).
 */
export class GenerateDto implements StickerData {
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  name!: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}-\d{2}-\d{4}$/, { message: 'birthDate deve ser dd-mm-aaaa' })
  birthDate?: string;

  @IsOptional()
  @IsString()
  height?: string;

  @IsOptional()
  @IsString()
  weight?: string;

  @IsOptional()
  @IsString()
  club?: string;

  @IsOptional()
  @IsString()
  @Length(3, 3, { message: 'country deve ser ISO3 (ex.: BRA)' })
  country?: string;
}
