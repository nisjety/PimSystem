import { PartialType } from '@nestjs/swagger';
import { CreateMetafieldDto } from './create-metafield.dto';

export class UpdateMetafieldDto extends PartialType(CreateMetafieldDto) {} 