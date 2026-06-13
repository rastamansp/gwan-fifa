import { Module } from '@nestjs/common';
import { GenerateModule } from './presentation/generate/generate.module';

@Module({
  imports: [GenerateModule],
})
export class AppModule {}
