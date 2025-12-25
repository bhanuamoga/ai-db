import { type NextRequest, NextResponse } from "next/server"
import { getTableSchema } from "@/lib/table-schemas"

// In-memory storage for demo (replace with real database)
const dataStore: Record<string, any[]> = {
  users: [],
  orders: [],
  products: [],
}

const nextIds: Record<string, number> = {
  users: 1,
  orders: 1,
  products: 1,
}

export async function POST(req: NextRequest, { params }: { params: { table: string } }) {
  try {
    const tableName = params.table
    const schema = getTableSchema(tableName)

    if (!schema) {
      return NextResponse.json({ error: "Invalid table name" }, { status: 400 })
    }

    const data = await req.json()

    // Validate required fields
    for (const field of schema.fields) {
      if (field.required && !data[field.name]) {
        return NextResponse.json({ error: `${field.label} is required` }, { status: 400 })
      }
    }

    // Create new record with auto-generated ID and timestamp
    const newRecord = {
      id: nextIds[tableName]++,
      ...data,
      created_at: new Date().toISOString().split("T")[0],
    }

    // Initialize table if it doesn't exist
    if (!dataStore[tableName]) {
      dataStore[tableName] = []
    }

    dataStore[tableName].push(newRecord)

    return NextResponse.json({
      success: true,
      data: newRecord,
      message: `${schema.label} created successfully`,
    })
  } catch (error) {
    console.error("Error creating record:", error)
    return NextResponse.json({ error: "Failed to create record" }, { status: 500 })
  }
}

export async function GET(req: NextRequest, { params }: { params: { table: string } }) {
  try {
    const tableName = params.table
    const schema = getTableSchema(tableName)

    if (!schema) {
      return NextResponse.json({ error: "Invalid table name" }, { status: 400 })
    }

    const records = dataStore[tableName] || []

    return NextResponse.json({
      success: true,
      data: records,
      count: records.length,
    })
  } catch (error) {
    console.error("Error fetching records:", error)
    return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 })
  }
}
