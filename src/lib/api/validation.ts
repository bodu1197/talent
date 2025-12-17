import { NextResponse } from 'next/server';

/**
 * 좌표 유효성 검증
 * @returns 에러가 있으면 NextResponse, 없으면 null
 */
export function validateCoordinates(lat: number, lng: number): NextResponse | null {
  // NaN 체크
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json(
      { error: 'Missing or invalid coordinates: lat, lng required' },
      { status: 400 }
    );
  }

  // 범위 검증
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json({ error: 'Coordinates out of range' }, { status: 400 });
  }

  return null;
}

/**
 * UUID 형식 검증
 * @param id - 검증할 UUID 문자열
 * @param fieldName - 에러 메시지에 표시할 필드명
 * @returns 에러가 있으면 NextResponse, 없으면 null
 */
export function validateUUID(id: string, fieldName: string = 'ID'): NextResponse | null {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(id)) {
    return NextResponse.json({ error: `유효하지 않은 ${fieldName} 형식입니다` }, { status: 400 });
  }

  return null;
}
