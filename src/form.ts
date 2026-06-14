import { FormEvent } from "react"
import { z } from "zod"

export function consumeForm<T>(schema: z.ZodType<T>, e: FormEvent<HTMLFormElement>) {
  e.preventDefault()
  const form = new FormData(e.target as HTMLFormElement)
  const rawobject: Record<string, FormDataEntryValue | null> = {}
  for (const key of form.keys()) {
    rawobject[key] = form.get(key)
  }

  return schema.safeParse(rawobject)
}
