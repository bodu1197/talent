import { NextResponse } from 'next/server';

/**
 * UUID 형식 검증
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * UUID 검증 및 에러 응답 반환
 */
export function validateUUID(uuid: string, fieldName = 'ID'): NextResponse | null {
  if (!isValidUUID(uuid)) {
    return NextResponse.json({ error: `유효하지 않은 ${fieldName}입니다` }, { status: 400 });
  }
  return null;
}
