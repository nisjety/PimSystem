import { Module } from "@nestjs/common";
import { SearchService } from "./search.service";
import { SearchController } from "./search.controller";
import { EmbeddingsModule } from "../../embeddings/embeddings.module";
import { ProductModule } from "../product/product.module";
import { IngredientModule } from "../ingredient/ingredient.module";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
  imports: [EmbeddingsModule, ProductModule, IngredientModule, PrismaModule],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
