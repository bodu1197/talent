import { NextResponse } from 'next/server';

export function validateUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export function createErrorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function validateRequiredFields(fields: Record<string, unknown>): string | null {
  for (const [key, value] of Object.entries(fields)) {
    if (!value) {
      return `${key} is required`;
    }
  }
  return null;
}
