import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

// 도로명주소 API 설정
// 참고: https://www.juso.go.kr/addrlink/devGuide.do
const JUSO_API_KEY = 'devU01TX0FVVEgyMDI1MTIwMzE0NTUyMDExNTM0MDY='; // 테스트용, 실제 서비스 시 발급 필요

interface JusoAddress {
  roadAddr: string; // 도로명주소
  jibunAddr: string; // 지번주소
  zipNo: string; // 우편번호
  admCd: string; // 행정구역코드
  rnMgtSn: string; // 도로명코드
  bdMgtSn: string; // 건물관리번호
  siNm: string; // 시도명
  sggNm: string; // 시군구명
  emdNm: string; // 읍면동명
  liNm: string; // 리명
  rn: string; // 도로명
  udrtYn: string; // 지하여부
  buldMnnm: string; // 건물본번
  buldSlno: string; // 건물부번
  bdNm: string; // 건물명
  bdKdcd: string; // 공동주택여부
  detBdNmList: string; // 상세건물명
  emdNo: string; // 읍면동일련번호
  entX: string; // 좌표 X (경도, EPSG:5179)
  entY: string; // 좌표 Y (위도, EPSG:5179)
}

interface JusoApiResponse {
  results: {
    common: {
      errorCode: string;
      errorMessage: string;
      totalCount: string;
      countPerPage: string;
      currentPage: string;
    };
    juso: JusoAddress[] | null;
  };
}

// POST: 주소 검색
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, page = 1, countPerPage = 10 } = body;

    if (!keyword || typeof keyword !== 'string' || !keyword.trim()) {
      return NextResponse.json({
        results: [],
        total: 0,
        hasMore: false,
      });
    }

    // 도로명주소 API 호출 (좌표 포함)
    const url = new URL('https://business.juso.go.kr/addrlink/addrLinkApi.do');
    url.searchParams.set('confmKey', JUSO_API_KEY);
    url.searchParams.set('currentPage', String(page));
    url.searchParams.set('countPerPage', String(countPerPage));
    url.searchParams.set('keyword', keyword.trim());
    url.searchParams.set('resultType', 'json');
    url.searchParams.set('addInfoYn', 'Y'); // 추가정보 포함

    const response = await fetch(url.toString());

    if (!response.ok) {
      logger.error('Juso API response error:', response.status);
      return NextResponse.json(
        {
          error: 'Address API failed',
          results: [],
          total: 0,
          hasMore: false,
        },
        { status: 500 }
      );
    }

    const data: JusoApiResponse = await response.json();
    const { common, juso } = data.results;

    // 오류 처리
    if (common.errorCode !== '0') {
      logger.error('Juso API error:', common.errorMessage);
      return NextResponse.json({
        error: common.errorMessage,
        results: [],
        total: 0,
        hasMore: false,
      });
    }

    // 결과 없음
    if (!juso || juso.length === 0) {
      return NextResponse.json({
        results: [],
        total: 0,
        hasMore: false,
      });
    }

    // 좌표 변환이 필요한 경우 (도로명주소 API는 EPSG:5179 좌표계 사용)
    // 실제 서비스에서는 좌표변환 API 호출 필요
    // 현재는 카카오 API로 추가 좌표 조회하는 방식 권장
    const results = await Promise.all(
      juso.map(async (addr) => {
        // 카카오 API로 정확한 WGS84 좌표 조회
        const coords = await getKakaoCoordinates(addr.roadAddr || addr.jibunAddr);

        return {
          address: addr.roadAddr || addr.jibunAddr,
          roadAddress: addr.roadAddr,
          jibunAddress: addr.jibunAddr,
          latitude: coords?.latitude || 0,
          longitude: coords?.longitude || 0,
          region: addr.sggNm, // 시군구명
          sigunguCode: addr.admCd?.substring(0, 5) || '',
          bcode: addr.admCd || '',
        };
      })
    );

    const total = Number.parseInt(common.totalCount, 10);
    const currentPage = Number.parseInt(common.currentPage, 10);
    const perPage = Number.parseInt(common.countPerPage, 10);

    return NextResponse.json({
      results,
      total,
      hasMore: currentPage * perPage < total,
    });
  } catch (error) {
    logger.error('Address search error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        results: [],
        total: 0,
        hasMore: false,
      },
      { status: 500 }
    );
  }
}

// 카카오 API로 주소 → 좌표 변환
async function getKakaoCoordinates(
  address: string
): Promise<{ latitude: number; longitude: number } | null> {
  const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;

  if (!KAKAO_REST_API_KEY || !address) {
    return null;
  }

  try {
    const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data.documents || data.documents.length === 0) {
      return null;
    }

    const doc = data.documents[0];
    return {
      latitude: Number.parseFloat(doc.y),
      longitude: Number.parseFloat(doc.x),
    };
  } catch {
    return null;
  }
}
