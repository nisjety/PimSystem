import { Module } from '@nestjs/common';
import { EmbeddingsController } from './embeddings.controller';
import { FastEmbedService } from './fastembed.service';

@Module({
  controllers: [EmbeddingsController],
  providers: [FastEmbedService],
  exports: [FastEmbedService],
})
export class EmbeddingsModule {}
