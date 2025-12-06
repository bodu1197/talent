import { NextResponse } from 'next/server';

// 카카오맵 SDK 프록시 - ORB (Origin Read Blocking) 우회
export async function GET() {
  try {
    const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

    if (!appKey) {
      return NextResponse.json({ error: 'Kakao API key not configured' }, { status: 500 });
    }

    const sdkUrl = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`;

    const response = await fetch(sdkUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: '*/*',
        Referer: 'https://dolpagu.com/',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch Kakao SDK' }, { status: response.status });
    }

    const sdkScript = await response.text();

    return new NextResponse(sdkScript, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'public, max-age=86400', // 24시간 캐시
      },
    });
  } catch (error) {
    console.error('Kakao SDK proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
