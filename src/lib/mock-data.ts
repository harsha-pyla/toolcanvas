import { App, Template, PricingPlan, User } from "./types";

// ─── Mock User ───────────────────────────────────────────────
export const mockUser: User = {
  id: "usr_1",
  name: "Harsh",
  email: "harsh@toolcanvas.online",
  plan: "Pro",
};

// ─── Mock Apps ───────────────────────────────────────────────
export const mockApps: App[] = [
  {
    id: "app_1",
    name: "Product Inventory",
    description: "Track all warehouse products and stock levels",
    type: "inventory",
    recordCount: 248,
    createdAt: "2026-06-10T10:00:00Z",
    updatedAt: "2026-06-17T08:30:00Z",
    isPublic: true,
    shareId: "abc123",
    columns: [
      { id: "col_1", name: "Name", type: "text", visible: true },
      { id: "col_2", name: "SKU", type: "text", visible: true },
      { id: "col_3", name: "Price", type: "number", visible: true },
      { id: "col_4", name: "Stock", type: "number", visible: true },
      { id: "col_5", name: "Category", type: "text", visible: true },
    ],
    records: [
      { Name: "Wireless Mouse", SKU: "WM-001", Price: 29.99, Stock: 145, Category: "Electronics" },
      { Name: "USB-C Cable", SKU: "UC-002", Price: 12.99, Stock: 320, Category: "Electronics" },
      { Name: "Desk Lamp", SKU: "DL-003", Price: 45.00, Stock: 67, Category: "Office" },
      { Name: "Notebook A5", SKU: "NB-004", Price: 8.50, Stock: 500, Category: "Stationery" },
      { Name: "Monitor Stand", SKU: "MS-005", Price: 89.99, Stock: 34, Category: "Office" },
      { Name: "Mechanical Keyboard", SKU: "MK-006", Price: 149.99, Stock: 78, Category: "Electronics" },
      { Name: "Webcam HD", SKU: "WC-007", Price: 59.99, Stock: 92, Category: "Electronics" },
      { Name: "Desk Organizer", SKU: "DO-008", Price: 24.99, Stock: 156, Category: "Office" },
      { Name: "Sticky Notes Pack", SKU: "SN-009", Price: 5.99, Stock: 800, Category: "Stationery" },
      { Name: "Ergonomic Chair", SKU: "EC-010", Price: 399.99, Stock: 12, Category: "Furniture" },
      { Name: "Whiteboard Markers", SKU: "WM-011", Price: 15.99, Stock: 210, Category: "Stationery" },
      { Name: "Standing Desk", SKU: "SD-012", Price: 549.00, Stock: 8, Category: "Furniture" },
    ],
  },
  {
    id: "app_2",
    name: "Customer Database",
    description: "Manage customer contacts and leads",
    type: "crm",
    recordCount: 156,
    createdAt: "2026-06-08T14:00:00Z",
    updatedAt: "2026-06-16T11:45:00Z",
    isPublic: false,
    columns: [
      { id: "col_1", name: "Customer", type: "text", visible: true },
      { id: "col_2", name: "Email", type: "email", visible: true },
      { id: "col_3", name: "Phone", type: "phone", visible: true },
      { id: "col_4", name: "Status", type: "status", visible: true },
    ],
    records: [
      { Customer: "Acme Corp", Email: "contact@acme.com", Phone: "+1-555-0101", Status: "Active" },
      { Customer: "GlobalTech", Email: "info@globaltech.io", Phone: "+1-555-0102", Status: "Active" },
      { Customer: "StartupXYZ", Email: "hello@startupxyz.com", Phone: "+1-555-0103", Status: "Lead" },
      { Customer: "MegaStore", Email: "sales@megastore.com", Phone: "+1-555-0104", Status: "Active" },
      { Customer: "LocalShop", Email: "owner@localshop.com", Phone: "+1-555-0105", Status: "Inactive" },
      { Customer: "DevHouse", Email: "team@devhouse.dev", Phone: "+1-555-0106", Status: "Lead" },
    ],
  },
  {
    id: "app_3",
    name: "Employee Directory",
    description: "Company employee records and departments",
    type: "directory",
    recordCount: 42,
    createdAt: "2026-06-12T09:00:00Z",
    updatedAt: "2026-06-15T16:20:00Z",
    isPublic: false,
    columns: [
      { id: "col_1", name: "Name", type: "text", visible: true },
      { id: "col_2", name: "Email", type: "email", visible: true },
      { id: "col_3", name: "Department", type: "text", visible: true },
      { id: "col_4", name: "Role", type: "text", visible: true },
    ],
    records: [
      { Name: "Sarah Johnson", Email: "sarah@company.com", Department: "Engineering", Role: "Lead Developer" },
      { Name: "Mike Chen", Email: "mike@company.com", Department: "Design", Role: "UI Designer" },
      { Name: "Lisa Park", Email: "lisa@company.com", Department: "Marketing", Role: "Marketing Manager" },
      { Name: "James Wilson", Email: "james@company.com", Department: "Engineering", Role: "Backend Developer" },
      { Name: "Emily Davis", Email: "emily@company.com", Department: "HR", Role: "HR Director" },
    ],
  },
];

// ─── Templates ───────────────────────────────────────────────
export const templates: Template[] = [
  {
    id: "tpl_1",
    name: "Inventory Tracker",
    description: "Track products, stock levels, and pricing",
    type: "inventory",
    icon: "Package",
    columns: [
      { id: "col_1", name: "Product", type: "text", visible: true },
      { id: "col_2", name: "SKU", type: "text", visible: true },
      { id: "col_3", name: "Stock", type: "number", visible: true },
      { id: "col_4", name: "Price", type: "number", visible: true },
    ],
    sampleRecords: [
      { Product: "Widget A", SKU: "WA-001", Stock: 150, Price: 19.99 },
      { Product: "Widget B", SKU: "WB-002", Stock: 85, Price: 34.99 },
    ],
  },
  {
    id: "tpl_2",
    name: "CRM",
    description: "Manage customer contacts and deal status",
    type: "crm",
    icon: "Users",
    columns: [
      { id: "col_1", name: "Customer", type: "text", visible: true },
      { id: "col_2", name: "Phone", type: "phone", visible: true },
      { id: "col_3", name: "Email", type: "email", visible: true },
      { id: "col_4", name: "Status", type: "status", visible: true },
    ],
    sampleRecords: [
      { Customer: "Jane Doe", Phone: "+1-555-0100", Email: "jane@example.com", Status: "Active" },
      { Customer: "John Smith", Phone: "+1-555-0200", Email: "john@example.com", Status: "Lead" },
    ],
  },
  {
    id: "tpl_3",
    name: "Employee Directory",
    description: "Organize employee records by department",
    type: "directory",
    icon: "Building2",
    columns: [
      { id: "col_1", name: "Name", type: "text", visible: true },
      { id: "col_2", name: "Email", type: "email", visible: true },
      { id: "col_3", name: "Department", type: "text", visible: true },
    ],
    sampleRecords: [
      { Name: "Alice Brown", Email: "alice@company.com", Department: "Engineering" },
      { Name: "Bob Green", Email: "bob@company.com", Department: "Sales" },
    ],
  },
  {
    id: "tpl_4",
    name: "Real Estate Listings",
    description: "Manage property listings with location and pricing",
    type: "real-estate",
    icon: "Home",
    columns: [
      { id: "col_1", name: "Property", type: "text", visible: true },
      { id: "col_2", name: "Location", type: "text", visible: true },
      { id: "col_3", name: "Price", type: "number", visible: true },
      { id: "col_4", name: "Status", type: "status", visible: true },
    ],
    sampleRecords: [
      { Property: "3BR Apartment", Location: "Downtown", Price: 250000, Status: "Available" },
      { Property: "2BR Condo", Location: "Suburbs", Price: 180000, Status: "Sold" },
    ],
  },
];

// ─── Pricing Plans ───────────────────────────────────────────
export const pricingPlans: PricingPlan[] = [
  {
    id: "plan_free",
    name: "Free",
    price: 0,
    interval: "free",
    appLimit: 1,
    recordLimit: 100,
    features: [
      "1 App",
      "100 Records",
      "Basic search",
      "Public sharing",
      "Community support",
    ],
  },
  {
    id: "plan_pro",
    name: "Pro",
    price: 9,
    interval: "month",
    appLimit: 10,
    recordLimit: 10000,
    highlighted: true,
    features: [
      "10 Apps",
      "10,000 Records",
      "Advanced filters",
      "Custom domains",
      "Priority support",
      "CSV & Excel import",
    ],
  },
  {
    id: "plan_business",
    name: "Business",
    price: 29,
    interval: "month",
    appLimit: null,
    recordLimit: null,
    features: [
      "Unlimited Apps",
      "Unlimited Records",
      "Team access",
      "API access",
      "Dashboard analytics",
      "Dedicated support",
      "Custom branding",
    ],
  },
];
