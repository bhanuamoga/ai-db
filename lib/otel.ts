import { trace, context, SpanStatusCode } from "@opentelemetry/api"

const tracer = trace.getTracer("queryai-app", "1.0.0")

export function createSpan(name: string, attributes?: Record<string, any>) {
  return tracer.startSpan(name, {
    attributes: attributes || {},
  })
}

export async function withSpan<T>(name: string, fn: () => Promise<T>, attributes?: Record<string, any>): Promise<T> {
  const span = createSpan(name, attributes)
  const ctx = trace.setSpan(context.active(), span)

  try {
    const result = await context.with(ctx, fn)
    span.setStatus({ code: SpanStatusCode.OK })
    return result
  } catch (error) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error instanceof Error ? error.message : "Unknown error",
    })
    span.recordException(error as Error)
    throw error
  } finally {
    span.end()
  }
}

export function getCurrentSpanContext() {
  const span = trace.getSpan(context.active())
  if (!span) return null

  const spanContext = span.spanContext()
  return {
    traceId: spanContext.traceId,
    spanId: spanContext.spanId,
  }
}
