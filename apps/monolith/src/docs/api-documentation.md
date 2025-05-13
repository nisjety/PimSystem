# PIM System API Documentation

## Overview

This document provides detailed information about the API endpoints available in the PIM system monolith application. These endpoints allow you to manage products, categories, ingredients, bundles, variants, media, and more.

## Authentication

All endpoints require authentication using JWT tokens provided by Clerk. Include the token in the `Authorization` header as follows:

```
Authorization: Bearer <your_token>
```

## Endpoints

### Products

#### Get all products
```
GET /api/products
```

Query parameters:
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Number of items per page (default: 10)
- `search` (string): Search term for filtering products
- `category` (string): Filter by category ID
- `status` (string): Filter by product status ('active', 'inactive', 'draft')
- `sort` (string): Sort field (name, createdAt, updatedAt, etc.)
- `order` (string): Sort order ('asc' or 'desc')

Response:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Product Name",
      "sku": "SKU123",
      "description": "Product description",
      "price": 99.99,
      "status": "active",
      "isActive": true,
      "createdAt": "2025-04-18T10:00:00Z",
      "updatedAt": "2025-04-18T10:00:00Z",
      "categories": [
        {
          "id": "uuid",
          "name": "Category Name"
        }
      ],
      "ingredients": [
        {
          "id": "uuid",
          "name": "Ingredient Name",
          "inciName": "INCI Name"
        }
      ]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 100,
    "totalPages": 10
  }
}
```

#### Get product by ID
```
GET /api/products/{id}
```

Response:
```json
{
  "id": "uuid",
  "name": "Product Name",
  "sku": "SKU123",
  "description": "Product description",
  "price": 99.99,
  "status": "active",
  "isActive": true,
  "categories": [...],
  "ingredients": [...],
  "variants": [...],
  "media": [...],
  "metafields": [...],
  "tags": [...],
  "createdAt": "2025-04-18T10:00:00Z",
  "updatedAt": "2025-04-18T10:00:00Z"
}
```

#### Create product
```
POST /api/products
```

Request body:
```json
{
  "name": "Product Name",
  "sku": "SKU123",
  "description": "Product description",
  "price": 99.99,
  "status": "active",
  "isActive": true,
  "categoryIds": ["uuid1", "uuid2"],
  "ingredientIds": ["uuid1", "uuid2"]
}
```

#### Update product
```
PUT /api/products/{id}
```

Request body:
```json
{
  "name": "Updated Product Name",
  "description": "Updated product description",
  "price": 199.99,
  "status": "inactive",
  "isActive": false,
  "categoryIds": ["uuid1", "uuid2"],
  "ingredientIds": ["uuid1", "uuid2"]
}
```

#### Delete product
```
DELETE /api/products/{id}
```

#### Get similar products
```
GET /api/products/{id}/similar
```

Query parameters:
- `limit` (number): Number of similar products to return (default: 5)

Response:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Similar Product",
      "sku": "SKU456",
      "description": "Similar product description",
      "price": 89.99,
      "similarityScore": 0.85
    }
  ]
}
```

### Categories

#### Get all categories
```
GET /api/categories
```

Query parameters:
- `parentId` (string): Filter categories by parent ID
- `includeInactive` (boolean): Include inactive categories
- `includeProducts` (boolean): Include product counts
- `includeChildren` (boolean): Include child categories

Response:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Category Name",
      "slug": "category-name",
      "parentId": "parent-uuid",
      "isActive": true,
      "productCount": 5,
      "children": []
    }
  ]
}
```

#### Get category by ID
```
GET /api/categories/{id}
```

#### Create category
```
POST /api/categories
```

Request body:
```json
{
  "name": "Category Name",
  "slug": "category-name",
  "parentId": "parent-uuid",
  "isActive": true
}
```

#### Update category
```
PUT /api/categories/{id}
```

#### Delete category
```
DELETE /api/categories/{id}
```

#### Get category tree
```
GET /api/categories/tree
```

### Ingredients

#### Get all ingredients
```
GET /api/ingredients
```

Query parameters:
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Number of items per page (default: 10)
- `search` (string): Search term for filtering ingredients
- `includeInactive` (boolean): Include inactive ingredients

#### Get ingredient by ID
```
GET /api/ingredients/{id}
```

#### Create ingredient
```
POST /api/ingredients
```

Request body:
```json
{
  "name": "Ingredient Name",
  "inciName": "INCI NAME",
  "description": "Ingredient description",
  "ewgScore": 2,
  "isActive": true
}
```

#### Update ingredient
```
PUT /api/ingredients/{id}
```

#### Delete ingredient
```
DELETE /api/ingredients/{id}
```

### Search

#### Search across entities
```
GET /api/search
```

Query parameters:
- `query` (string): Search term
- `entityTypes` (string[]): Array of entity types to search ('product', 'category', 'ingredient', 'bundle')
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Number of items per page (default: 10)
- `fields` (string[]): Specific fields to search

Response:
```json
{
  "data": {
    "products": [...],
    "categories": [...],
    "ingredients": [...],
    "bundles": [...]
  },
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 100
  }
}
```

#### Advanced product search
```
POST /api/search/products/advanced
```

Request body:
```json
{
  "query": "face cream",
  "filters": {
    "categoryIds": ["uuid1", "uuid2"],
    "ingredientIds": ["uuid1", "uuid2"],
    "priceRange": {
      "min": 10,
      "max": 100
    },
    "tags": ["hydrating", "sensitive-skin"]
  },
  "pagination": {
    "page": 1,
    "limit": 10
  },
  "sort": {
    "field": "price",
    "order": "asc"
  }
}
```

### Import

#### Import data from Google Sheets
```
POST /api/import/google-sheets
```

Request body:
```json
{
  "spreadsheetId": "spreadsheet_id",
  "sheetName": "Sheet1",
  "headerRow": 1,
  "dataRange": "A1:Z500",
  "entityType": "product",
  "options": {
    "validateOnly": false,
    "updateExisting": true,
    "columnMappings": {
      "name": "A",
      "sku": "B",
      "price": "C"
    }
  }
}
```

Response:
```json
{
  "success": true,
  "importId": "import-uuid",
  "processed": 150,
  "created": 120,
  "updated": 30,
  "failed": 0,
  "log": []
}
```

#### Check import status
```
GET /api/import/{importId}/status
```

### Analytics

#### Get dashboard metrics
```
GET /api/analytics/dashboard
```

Query parameters:
- `timeRange` (string): Time range for analytics ('last_24_hours', 'last_7_days', 'last_30_days', 'last_90_days', 'year_to_date', 'custom')
- `startDate` (string): Start date for custom time range
- `endDate` (string): End date for custom time range
- `metricType` (string): Type of metrics to include ('all', 'product', 'category', 'ingredient', 'user')
- `categoryIds` (string[]): Filter by category IDs
- `includeInactive` (boolean): Include inactive items
- `topItemsCount` (number): Number of top items to return (default: 5)

Response:
```json
{
  "productMetrics": {
    "totalProducts": 500,
    "activeProducts": 450,
    "inactiveProducts": 50,
    "draftProducts": 20,
    "newProductsThisPeriod": 15,
    "updatedProductsThisPeriod": 25,
    "averagePricePerCategory": [...]
  },
  "categoryMetrics": {
    "totalCategories": 50,
    "activeCategories": 45,
    "emptyCategoriesCount": 5,
    "emptyCategories": [...],
    "categoriesWithMostProducts": [...],
    "categoriesWithFewestProducts": [...]
  },
  "ingredientMetrics": {
    "totalIngredients": 200,
    "mostUsedIngredients": [...],
    "rarelyUsedIngredients": [...],
    "ingredientsWithHighEwgScore": [...]
  },
  "recentActivity": [...],
  "topUsers": [...],
  "period": {
    "startDate": "2025-03-19T00:00:00Z",
    "endDate": "2025-04-18T23:59:59Z"
  }
}
```

#### Get category distribution
```
GET /api/analytics/categories/distribution
```

#### Get ingredient usage statistics
```
GET /api/analytics/ingredients/usage
```

#### Get product activity history
```
GET /api/analytics/products/activity
```

#### Clear analytics cache
```
POST /api/analytics/cache/clear
```

### Media

#### Upload media for product
```
POST /api/media/upload
```

Multipart form data:
- `file`: The media file to upload
- `entityType`: The entity type (product, category, etc.)
- `entityId`: The ID of the entity
- `tags`: Optional tags for the media

#### Get media for entity
```
GET /api/media/entity/{entityType}/{entityId}
```

#### Delete media
```
DELETE /api/media/{id}
```

#### Update media metadata
```
PATCH /api/media/{id}
```

### Users

#### Get all users
```
GET /api/users
```

#### Get user by ID
```
GET /api/users/{id}
```

#### Create user
```
POST /api/users
```

#### Update user
```
PUT /api/users/{id}
```

#### Delete user
```
DELETE /api/users/{id}
```

## Error Handling

All errors will follow a consistent format:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request",
  "timestamp": "2025-04-18T10:00:00Z",
  "path": "/api/products"
}
```

Common status codes:
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource not found)
- `409` - Conflict (e.g., duplicate SKU)
- `422` - Unprocessable Entity (validation error)
- `500` - Internal Server Error

## Rate Limiting

The API is rate-limited to 60 requests per minute per IP address. When the limit is exceeded, you'll receive a `429 Too Many Requests` response.