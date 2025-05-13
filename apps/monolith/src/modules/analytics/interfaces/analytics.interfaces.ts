export interface AnalyticsPeriod {
  startDate: Date;
  endDate: Date;
}

export interface CategoryDistribution {
  categoryId: string;
  categoryName: string;
  productCount: number;
  percentage: number;
}

export interface IngredientFrequency {
  ingredientId: string;
  ingredientName: string;
  inciName: string;
  occurrenceCount: number;
  productPercentage: number;
}

export enum ActivityType {
  VIEW = 'view',
  EDIT = 'edit',
  EXPORT = 'export',
}

export interface ProductActivity {
  id: string;
  name: string;
  sku: string;
  activityCount: number;
  lastActivity: Date;
  type: ActivityType;
}

export interface ProductMetrics {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  draftProducts: number;
  newProductsThisPeriod: number;
  updatedProductsThisPeriod: number;
  averagePricePerCategory: {
    categoryId: string;
    categoryName: string;
    averagePrice: number;
  }[];
}

export interface CategoryMetrics {
  totalCategories: number;
  activeCategories: number;
  emptyCategoriesCount: number;
  emptyCategories: {
    id: string;
    name: string;
  }[];
  categoriesWithMostProducts: {
    id: string;
    name: string;
    productCount: number;
  }[];
  categoriesWithFewestProducts: {
    id: string;
    name: string;
    productCount: number;
  }[];
}

export interface IngredientMetrics {
  totalIngredients: number;
  mostUsedIngredients: IngredientFrequency[];
  rarelyUsedIngredients: IngredientFrequency[];
  ingredientsWithHighEwgScore: {
    id: string;
    name: string;
    ewgScore: number;
    productCount: number;
  }[];
}

export interface UserActivity {
  userId: string;
  userName: string;
  totalActions: number;
  lastAction: Date;
  createdProducts: number;
  updatedProducts: number;
  deletedProducts: number;
}

export interface DashboardMetrics {
  productMetrics: ProductMetrics;
  categoryMetrics: CategoryMetrics;
  ingredientMetrics: IngredientMetrics;
  recentActivity: ProductActivity[];
  topUsers: UserActivity[];
  period: AnalyticsPeriod;
}

export interface ProductEventMetadata {
  productName: string;
  productSku: string;
  [key: string]: any;
}