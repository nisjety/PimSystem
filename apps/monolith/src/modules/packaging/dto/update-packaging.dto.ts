import { PartialType } from '@nestjs/mapped-types';
import { CreatePackagingDto } from './create-packaging.dto';

export type UpdatePackagingDto = Partial<CreatePackagingDto>;