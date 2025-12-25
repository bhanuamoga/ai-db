export interface FieldSchema {
  name: string
  type: "text" | "email" | "number" | "date" | "boolean" | "select"
  label: string
  required: boolean
  placeholder?: string
  options?: { label: string; value: string }[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

export interface TableSchema {
  name: string
  label: string
  icon: string
  description: string
  fields: FieldSchema[]
}

export const TABLE_SCHEMAS: Record<string, TableSchema> = {
  users: {
    name: "users",
    label: "User",
    icon: "👤",
    description: "Create a new user account",
    fields: [
      {
        name: "name",
        type: "text",
        label: "Full Name",
        required: true,
        placeholder: "John Doe",
      },
      {
        name: "email",
        type: "email",
        label: "Email Address",
        required: true,
        placeholder: "john@example.com",
        validation: {
          pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
          message: "Please enter a valid email address",
        },
      },
      {
        name: "status",
        type: "select",
        label: "Status",
        required: true,
        options: [
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
          { label: "Pending", value: "pending" },
        ],
      },
      {
        name: "city",
        type: "text",
        label: "City",
        required: false,
        placeholder: "New York",
      },
    ],
  },
  orders: {
    name: "orders",
    label: "Order",
    icon: "🛒",
    description: "Create a new order",
    fields: [
      {
        name: "customer",
        type: "text",
        label: "Customer Name",
        required: true,
        placeholder: "John Doe",
      },
      {
        name: "total",
        type: "number",
        label: "Total Amount",
        required: true,
        placeholder: "99.99",
        validation: {
          min: 0,
          message: "Amount must be greater than 0",
        },
      },
      {
        name: "status",
        type: "select",
        label: "Order Status",
        required: true,
        options: [
          { label: "Pending", value: "pending" },
          { label: "Completed", value: "completed" },
          { label: "Shipped", value: "shipped" },
          { label: "Cancelled", value: "cancelled" },
        ],
      },
      {
        name: "city",
        type: "text",
        label: "Shipping City",
        required: false,
        placeholder: "Los Angeles",
      },
    ],
  },
  products: {
    name: "products",
    label: "Product",
    icon: "📦",
    description: "Add a new product to inventory",
    fields: [
      {
        name: "name",
        type: "text",
        label: "Product Name",
        required: true,
        placeholder: "Wireless Headphones",
      },
      {
        name: "price",
        type: "number",
        label: "Price",
        required: true,
        placeholder: "49.99",
        validation: {
          min: 0,
          message: "Price must be greater than 0",
        },
      },
      {
        name: "category",
        type: "select",
        label: "Category",
        required: true,
        options: [
          { label: "Electronics", value: "electronics" },
          { label: "Clothing", value: "clothing" },
          { label: "Home & Garden", value: "home" },
          { label: "Sports", value: "sports" },
        ],
      },
      {
        name: "stock",
        type: "number",
        label: "Stock Quantity",
        required: true,
        placeholder: "100",
        validation: {
          min: 0,
          message: "Stock must be 0 or greater",
        },
      },
    ],
  },
}

export function getTableSchema(tableName: string): TableSchema | null {
  return TABLE_SCHEMAS[tableName] || null
}

export function getAllTableNames(): string[] {
  return Object.keys(TABLE_SCHEMAS)
}
