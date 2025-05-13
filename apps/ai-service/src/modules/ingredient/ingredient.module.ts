import { Module } from "@nestjs/common";
import { IngredientService } from "./ingredient.service";
import { EmbeddingsModule } from "../../embeddings/embeddings.module";
import { ProvidersModule } from "../../providers/providers.module";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
  imports: [EmbeddingsModule, ProvidersModule, PrismaModule],
  providers: [IngredientService],
  exports: [IngredientService],
})
export class IngredientModule {}
