#!/bin/bash

MODULES=(
  "bundles"
  "variants"
  "media"
  "stock"
  "users"
  "attributes"
  "barcode"
  "channels"
  "catalogs"
  "lifecycle"
  "packaging"
  "user-events"
  "metafields"
  "tags"
  "compliance"
)

for module in "${MODULES[@]}"; do
  mkdir -p "src/modules/$module"
  cat > "src/modules/$module/$module.module.ts" << EOF
import { Module } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Module({
  imports: [],
  providers: [PrismaService],
  exports: [],
})
export class ${module^}Module {}
EOF
done 