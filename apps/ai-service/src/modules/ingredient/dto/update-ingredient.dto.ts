import { IsString, IsOptional, IsArray, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export enum IngredientCategory {
  HYDRATOR = "hydrator",
  ANTIOXIDANT = "antioxidant",
  PRESERVATIVE = "preservative",
}

export class UpdateIngredientDto {
  @ApiProperty({
    description: "Ingredient name",
    example: "Hyaluronic Acid",
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: "INCI name",
    example: "Sodium Hyaluronate",
  })
  @IsOptional()
  @IsString()
  inciName?: string;

  @ApiProperty({
    description: "Ingredient description",
    example:
      "A powerful humectant that can hold up to 1000x its weight in water",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: "Ingredient category",
    enum: IngredientCategory,
    example: IngredientCategory.HYDRATOR,
  })
  @IsOptional()
  @IsEnum(IngredientCategory)
  category?: IngredientCategory;

  @ApiProperty({
    description: "Common uses of the ingredient",
    example: ["Hydration", "Anti-aging", "Plumping"],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  commonUses?: string[];
}
