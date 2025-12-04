import { NextRequest, NextResponse } from 'next/server';
import { WeatherCondition } from '@/lib/errand-pricing';

// OpenWeatherMap API를 사용한 날씨 조회
// 환경변수: OPENWEATHER_API_KEY

interface WeatherResponse {
  weather: WeatherCondition;
  description: string;
  temp: number;
  humidity: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!lat || !lng) {
      return NextResponse.json({ error: '위치 정보가 필요합니다' }, { status: 400 });
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;

    // API 키가 없으면 시뮬레이션 데이터 반환
    if (!apiKey) {
      // 시뮬레이션: 랜덤 날씨 (테스트용) - 실제 서비스에서는 API 키 필수
      const weathers: WeatherCondition[] = ['CLEAR', 'CLEAR', 'CLEAR', 'RAIN', 'SNOW'];
      // eslint-disable-next-line sonarjs/pseudo-random -- 시뮬레이션용 랜덤, 보안 무관
      const randomIndex = Math.floor(Math.random() * weathers.length);
      const simulatedWeather = weathers[randomIndex];

      return NextResponse.json({
        weather: simulatedWeather,
        description: getWeatherDescription(simulatedWeather),
        // eslint-disable-next-line sonarjs/pseudo-random -- 시뮬레이션용 랜덤, 보안 무관
        temp: 15 + Math.floor(Math.random() * 10),
        // eslint-disable-next-line sonarjs/pseudo-random -- 시뮬레이션용 랜덤, 보안 무관
        humidity: 50 + Math.floor(Math.random() * 30),
        simulated: true,
      });
    }

    // OpenWeatherMap API 호출
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric&lang=kr`
    );

    if (!response.ok) {
      throw new Error('날씨 정보를 가져올 수 없습니다');
    }

    const data = await response.json();

    // OpenWeatherMap 날씨 코드를 우리 시스템으로 변환
    const weatherCondition = mapOpenWeatherCondition(data.weather[0]?.id || 800);

    const result: WeatherResponse = {
      weather: weatherCondition,
      description: data.weather[0]?.description || '알 수 없음',
      temp: Math.round(data.main?.temp || 0),
      humidity: data.main?.humidity || 0,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Weather API Error:', error);

    // 에러 시 기본값 반환 (맑음)
    return NextResponse.json({
      weather: 'CLEAR' as WeatherCondition,
      description: '날씨 정보 없음',
      temp: 20,
      humidity: 50,
      error: true,
    });
  }
}

// OpenWeatherMap 날씨 코드를 내부 조건으로 변환
function mapOpenWeatherCondition(weatherId: number): WeatherCondition {
  // 2xx: 천둥번개
  if (weatherId >= 200 && weatherId < 300) {
    return 'EXTREME';
  }

  // 3xx: 이슬비
  if (weatherId >= 300 && weatherId < 400) {
    return 'RAIN';
  }

  // 5xx: 비
  if (weatherId >= 500 && weatherId < 600) {
    return 'RAIN';
  }

  // 6xx: 눈
  if (weatherId >= 600 && weatherId < 700) {
    return 'SNOW';
  }

  // 7xx: 대기 상태 (안개, 황사 등)
  if (weatherId >= 700 && weatherId < 800) {
    return 'CLEAR'; // 안개 등은 일반으로 처리
  }

  // 800: 맑음
  if (weatherId === 800) {
    return 'CLEAR';
  }

  // 80x: 구름
  if (weatherId > 800 && weatherId < 900) {
    return 'CLEAR';
  }

  // 기타 극한 날씨
  return 'EXTREME';
}

function getWeatherDescription(condition: WeatherCondition): string {
  switch (condition) {
    case 'CLEAR':
      return '맑음';
    case 'RAIN':
      return '비';
    case 'SNOW':
      return '눈';
    case 'EXTREME':
      return '악천후';
    default:
      return '알 수 없음';
  }
}
