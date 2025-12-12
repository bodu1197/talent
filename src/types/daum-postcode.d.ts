/**
 * Daum Postcode API 타입 선언
 */

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: {
        oncomplete: (data: DaumPostcodeData) => void;
        onclose?: () => void;
        width?: string | number;
        height?: string | number;
      }) => {
        open: () => void;
        embed: (element: HTMLElement) => void;
      };
    };
  }
}

export interface DaumPostcodeData {
  zonecode: string; // 우편번호
  address: string; // 전체 주소 (지번주소)
  addressEnglish: string; // 영문 주소
  addressType: 'R' | 'J'; // R: 도로명주소, J: 지번주소
  userSelectedType: 'R' | 'J'; // 사용자가 선택한 주소 타입
  roadAddress: string; // 도로명 주소
  jibunAddress: string; // 지번 주소
  bname: string; // 법정동/법정리 이름
  buildingName: string; // 건물명
  apartment: 'Y' | 'N'; // 아파트 여부
  sido: string; // 시도
  sigungu: string; // 시군구
  roadnameCode: string; // 도로명코드
  bcode: string; // 법정동/법정리 코드
  autoRoadAddress: string; // 도로명주소(참고항목 제외)
  autoJibunAddress: string; // 지번주소(참고항목 제외)
  userLanguageType: 'K' | 'E'; // 검색 언어 (K: 한글, E: 영문)
}

export {};
