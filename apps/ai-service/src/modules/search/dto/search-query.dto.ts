import { IsString, IsOptional, IsInt, Min, Max } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SearchQueryDto {
  @ApiProperty({
    description: "Search query string",
    example: "hydrating toner",
  })
  @IsString()
  query: string;

  @ApiProperty({
    description: "Maximum number of results to return",
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
