import { Module } from "@nestjs/common";
import { ProductService } from "./product.service";
import { EmbeddingsModule } from "../../embeddings/embeddings.module";
import { ProvidersModule } from "../../providers/providers.module";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
  imports: [EmbeddingsModule, ProvidersModule, PrismaModule],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
