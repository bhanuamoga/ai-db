"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import type { TableSchema, FieldSchema } from "@/lib/table-schemas"

interface DynamicFormProps {
  schema: TableSchema
  onSubmit: (data: Record<string, any>) => Promise<void>
  onCancel: () => void
}

export function DynamicForm({ schema, onSubmit, onCancel }: DynamicFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  const validateField = (field: FieldSchema, value: any): string | null => {
    if (field.required && !value) {
      return `${field.label} is required`
    }

    if (field.validation) {
      if (field.type === "number" && field.validation.min !== undefined && value < field.validation.min) {
        return field.validation.message || `Must be at least ${field.validation.min}`
      }

      if (field.type === "email" && field.validation.pattern) {
        const regex = new RegExp(field.validation.pattern)
        if (!regex.test(value)) {
          return field.validation.message || "Invalid format"
        }
      }
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}
    schema.fields.forEach((field) => {
      const error = validateField(field, formData[field.name])
      if (error) {
        newErrors[field.name] = error
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      await onSubmit(formData)
      setSubmitStatus("success")
      setTimeout(() => {
        onCancel()
      }, 1500)
    } catch (error) {
      setSubmitStatus("error")
      setErrors({ _form: "Failed to submit form. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderField = (field: FieldSchema) => {
    const value = formData[field.name] || ""
    const error = errors[field.name]

    const updateValue = (newValue: any) => {
      setFormData((prev) => ({ ...prev, [field.name]: newValue }))
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field.name]
        return newErrors
      })
    }

    switch (field.type) {
      case "select":
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Select value={value} onValueChange={updateValue}>
              <SelectTrigger id={field.name} className={error ? "border-destructive" : ""}>
                <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        )

      case "boolean":
        return (
          <div key={field.name} className="flex items-center space-x-2">
            <Checkbox id={field.name} checked={value} onCheckedChange={(checked) => updateValue(checked)} />
            <Label htmlFor={field.name} className="cursor-pointer">
              {field.label}
            </Label>
          </div>
        )

      case "number":
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={field.name}
              type="number"
              value={value}
              onChange={(e) => updateValue(Number.parseFloat(e.target.value) || "")}
              placeholder={field.placeholder}
              className={error ? "border-destructive" : ""}
              min={field.validation?.min}
              max={field.validation?.max}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        )

      default:
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={field.name}
              type={field.type}
              value={value}
              onChange={(e) => updateValue(e.target.value)}
              placeholder={field.placeholder}
              className={error ? "border-destructive" : ""}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        )
    }
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span>{schema.icon}</span>
          {schema.description}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {schema.fields.map(renderField)}

        {errors._form && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <XCircle className="h-4 w-4" />
            {errors._form}
          </div>
        )}

        {submitStatus === "success" && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            {schema.label} created successfully!
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              `Create ${schema.label}`
            )}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}
