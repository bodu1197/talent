import { NextRequest, NextResponse } from 'next/server';
import { WeatherCondition } from '@/lib/errand-pricing';

// 기상청 초단기실황 API 사용
// 환경변수: KMA_API_KEY (공공데이터포털에서 발급)
// https://www.data.go.kr/data/15084084/openapi.do

interface WeatherResponse {
  weather: WeatherCondition;
  description: string;
  temp: number;
  humidity: number;
}

// 위경도 → 기상청 격자 좌표 변환
function convertToGrid(lat: number, lng: number): { nx: number; ny: number } {
  const RE = 6371.00877; // 지구 반경(km)
  const GRID = 5; // 격자 간격(km)
  const SLAT1 = 30; // 투영 위도1(degree)
  const SLAT2 = 60; // 투영 위도2(degree)
  const OLON = 126; // 기준점 경도(degree)
  const OLAT = 38; // 기준점 위도(degree)
  const XO = 43; // 기준점 X좌표(GRID)
  const YO = 136; // 기준점 Y좌표(GRID)

  const DEGRAD = Math.PI / 180;

  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;

  let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = (re * sf) / Math.pow(ro, sn);

  let ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
  ra = (re * sf) / Math.pow(ra, sn);
  let theta = lng * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2 * Math.PI;
  if (theta < -Math.PI) theta += 2 * Math.PI;
  theta *= sn;

  const nx = Math.floor(ra * Math.sin(theta) + XO + 0.5);
  const ny = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);

  return { nx, ny };
}

// 기상청 API 발표 시간 계산 (매 정시 발표, 40분 이후 생성)
function getBaseDateTime(): { baseDate: string; baseTime: string } {
  const now = new Date();
  // 한국 시간으로 변환
  const koreaTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);

  // 현재 분이 40분 이전이면 이전 시간 데이터 사용
  if (koreaTime.getMinutes() < 40) {
    koreaTime.setHours(koreaTime.getHours() - 1);
  }

  const year = koreaTime.getFullYear();
  const month = String(koreaTime.getMonth() + 1).padStart(2, '0');
  const day = String(koreaTime.getDate()).padStart(2, '0');
  const hour = String(koreaTime.getHours()).padStart(2, '0');

  return {
    baseDate: `${year}${month}${day}`,
    baseTime: `${hour}00`,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!lat || !lng) {
      return NextResponse.json({ error: '위치 정보가 필요합니다' }, { status: 400 });
    }

    const apiKey = process.env.KMA_API_KEY;

    // API 키가 없으면 기본값 반환 (맑음 - 할증 없음)
    if (!apiKey) {
      console.warn('KMA_API_KEY not set - using default weather');
      return NextResponse.json({
        weather: 'CLEAR' as WeatherCondition,
        description: '맑음',
        temp: 15,
        humidity: 50,
        simulated: true,
      });
    }

    // 위경도 → 격자 좌표 변환
    const { nx, ny } = convertToGrid(Number.parseFloat(lat), Number.parseFloat(lng));
    const { baseDate, baseTime } = getBaseDateTime();

    // 기상청 초단기실황 API 호출
    const apiUrl = new URL(
      'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst'
    );
    apiUrl.searchParams.set('serviceKey', apiKey);
    apiUrl.searchParams.set('numOfRows', '10');
    apiUrl.searchParams.set('pageNo', '1');
    apiUrl.searchParams.set('dataType', 'JSON');
    apiUrl.searchParams.set('base_date', baseDate);
    apiUrl.searchParams.set('base_time', baseTime);
    apiUrl.searchParams.set('nx', String(nx));
    apiUrl.searchParams.set('ny', String(ny));

    const response = await fetch(apiUrl.toString());

    if (!response.ok) {
      throw new Error(`기상청 API 오류: ${response.status}`);
    }

    const data = await response.json();

    // 응답 파싱
    const items = data?.response?.body?.items?.item;

    if (!items || !Array.isArray(items)) {
      throw new Error('기상청 데이터 파싱 실패');
    }

    // 데이터 추출
    let temp = 15;
    let humidity = 50;
    let pty = 0; // 강수형태: 0없음, 1비, 2비/눈, 3눈, 5빗방울, 6빗방울눈날림, 7눈날림

    for (const item of items) {
      switch (item.category) {
        case 'T1H': // 기온
          temp = Number.parseFloat(item.obsrValue);
          break;
        case 'REH': // 습도
          humidity = Number.parseInt(item.obsrValue, 10);
          break;
        case 'PTY': // 강수형태
          pty = Number.parseInt(item.obsrValue, 10);
          break;
      }
    }

    // 강수형태 → WeatherCondition 변환
    const weatherCondition = mapPtyToCondition(pty);

    const result: WeatherResponse = {
      weather: weatherCondition,
      description: getWeatherDescription(weatherCondition, pty),
      temp: Math.round(temp),
      humidity,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Weather API Error:', error);

    // 에러 시 기본값 반환 (맑음 - 할증 없음)
    return NextResponse.json({
      weather: 'CLEAR' as WeatherCondition,
      description: '날씨 정보 없음',
      temp: 15,
      humidity: 50,
      error: true,
    });
  }
}

// 강수형태(PTY) → WeatherCondition 변환
function mapPtyToCondition(pty: number): WeatherCondition {
  switch (pty) {
    case 1: // 비
    case 5: // 빗방울
      return 'RAIN';
    case 2: // 비/눈
    case 6: // 빗방울눈날림
      return 'RAIN'; // 비/눈은 비로 처리
    case 3: // 눈
    case 7: // 눈날림
      return 'SNOW';
    case 4: // 소나기 (일부 API에서 사용)
      return 'RAIN';
    default:
      return 'CLEAR';
  }
}

function getWeatherDescription(condition: WeatherCondition, pty: number): string {
  // PTY 기반 상세 설명
  const ptyDescriptions: Record<number, string> = {
    0: '맑음',
    1: '비',
    2: '비/눈',
    3: '눈',
    4: '소나기',
    5: '빗방울',
    6: '빗방울눈날림',
    7: '눈날림',
  };

  return ptyDescriptions[pty] || condition === 'CLEAR' ? '맑음' : '강수';
}
