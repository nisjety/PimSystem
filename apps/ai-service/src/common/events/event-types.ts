// Common event types for Kafka and Redis messaging

export enum EventType {
  // Product-related events
  PRODUCT_CREATED = 'product.created',
  PRODUCT_UPDATED = 'product.updated',
  PRODUCT_DELETED = 'product.deleted',
  
  // Ingredient-related events
  INGREDIENT_CREATED = 'ingredient.created',
  INGREDIENT_UPDATED = 'ingredient.updated',
  INGREDIENT_DELETED = 'ingredient.deleted',
  
  // Analysis events
  PRODUCT_ANALYSIS_REQUESTED = 'product.analysis.requested',
  PRODUCT_ANALYSIS_COMPLETED = 'product.analysis.completed',
  INGREDIENT_ANALYSIS_REQUESTED = 'ingredient.analysis.requested',
  INGREDIENT_ANALYSIS_COMPLETED = 'ingredient.analysis.completed',
  
  // Search events
  VECTOR_INDEX_UPDATED = 'vector.index.updated',
  SEARCH_OPTIMIZATION_REQUESTED = 'search.optimization.requested',
  
  // System events
  CACHE_INVALIDATION = 'cache.invalidation',
  SYSTEM_NOTIFICATION = 'system.notification'
}

export interface BaseEvent {
  id: string;
  type: EventType;
  timestamp: string;
  version: string;
  producer: string;
}

export interface ProductEvent extends BaseEvent {
  payload: {
    productId: string;
    [key: string]: any;
  };
}

export interface IngredientEvent extends BaseEvent {
  payload: {
    ingredientId: string;
    [key: string]: any;
  };
}

export interface AnalysisRequestEvent extends BaseEvent {
  payload: {
    entityId: string;
    entityType: 'product' | 'ingredient';
    analysisType: 'similarity' | 'tagging' | 'categorization' | 'full';
    priority: 'low' | 'medium' | 'high';
    [key: string]: any;
  };
}

export interface AnalysisResultEvent extends BaseEvent {
  payload: {
    entityId: string;
    entityType: 'product' | 'ingredient';
    analysisType: string;
    result: any;
    processingTimeMs: number;
  };
}

export interface CacheInvalidationEvent extends BaseEvent {
  payload: {
    keys: string[];
    pattern?: string;
    service?: string;
  };
}

export interface SystemNotificationEvent extends BaseEvent {
  payload: {
    level: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    details?: any;
  };
}