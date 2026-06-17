// ToolCanvas Type Definitions

export interface App {
  id: string;
  name: string;
  description: string;
  type: AppType;
  recordCount: number;
  columns: Column[];
  records: Record<string, string | number>[];
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  shareId?: string;
}

export type AppType = 
  | "generic"
  | "inventory"
  | "crm"
  | "directory"
  | "catalog"
  | "real-estate";

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  visible: boolean;
}

export type ColumnType = "text" | "number" | "email" | "phone" | "url" | "date" | "status";

export interface Template {
  id: string;
  name: string;
  description: string;
  type: AppType;
  icon: string;
  columns: Column[];
  sampleRecords: Record<string, string | number>[];
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: "month" | "year" | "free";
  features: string[];
  appLimit: number | null;
  recordLimit: number | null;
  highlighted?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: string;
}

export interface UseCase {
  title: string;
  description: string;
  icon: string;
}

export interface Step {
  number: number;
  title: string;
  description: string;
  icon: string;
}
