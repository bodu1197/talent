const CATEGORIES = {
    1: {
        id: 1,
        name: '디자인',
        icon: '<i class="fas fa-palette"></i>',
        subcategories: {
            '1-1': {
                name: '그래픽 디자인',
                services: ['로고 디자인', '명함 디자인', '포스터 디자인', '브로슈어 디자인', 'SNS 콘텐츠 디자인']
            },
            '1-2': {
                name: '웹/앱 디자인',
                services: ['웹사이트 디자인', '모바일 앱 UI/UX', '랜딩페이지 디자인', '와이어프레임 작성']
            },
            '1-3': {
                name: '영상/모션 그래픽',
                services: ['유튜브 썸네일', '인트로 영상', '모션 그래픽']
            },
            '1-4': {
                name: '3D/캐릭터 디자인',
                services: ['캐릭터 디자인', '3D 모델링']
            }
        }
    },
    2: {
        id: 2,
        name: 'IT/프로그래밍',
        icon: '<i class="fas fa-code"></i>',
        subcategories: {
            '2-1': {
                name: '웹 개발',
                services: ['웹사이트 제작', '쇼핑몰 구축', 'React 개발', 'WordPress 커스터마이징']
            },
            '2-2': {
                name: '앱 개발',
                services: ['iOS 앱 개발', 'Android 앱 개발', '크로스플랫폼 앱']
            },
            '2-3': {
                name: '데이터/AI',
                services: ['데이터 분석', '머신러닝 모델', '챗봇 개발']
            },
            '2-4': {
                name: '게임 개발',
                services: ['게임 개발', '게임 아트']
            }
        }
    },
    3: {
        id: 3,
        name: '마케팅/광고',
        icon: '<i class="fas fa-bullhorn"></i>',
        subcategories: {
            '3-1': {
                name: '디지털 마케팅',
                services: ['구글 광고 대행', '페이스북 광고', '네이버 광고', '인스타그램 마케팅']
            },
            '3-2': {
                name: '콘텐츠 마케팅',
                services: ['블로그 운영 대행', 'SEO 최적화', '콘텐츠 기획']
            },
            '3-3': {
                name: 'SNS 마케팅',
                services: ['SNS 전략 수립', '인스타 마케팅']
            },
            '3-4': {
                name: '브랜딩/CI',
                services: ['브랜드 전략', 'CI 설계']
            }
        }
    },
    4: {
        id: 4,
        name: '영상/사진',
        icon: '<i class="fas fa-camera"></i>',
        subcategories: {
            '4-1': {
                name: '영상 제작',
                services: ['유튜브 영상 편집', '홍보 영상 제작', '웨딩 영상', '드론 촬영']
            },
            '4-2': {
                name: '사진 촬영',
                services: ['프로필 사진', '제품 사진', '행사 사진']
            },
            '4-3': {
                name: '사진 보정',
                services: ['사진 보정', '배경 제거']
            }
        }
    },
    5: {
        id: 5,
        name: '번역/통역',
        icon: '<i class="fas fa-language"></i>',
        subcategories: {
            '5-1': {
                name: '문서 번역',
                services: ['영어 번역', '중국어 번역', '일본어 번역', '스페인어 번역']
            },
            '5-2': {
                name: '영상 자막',
                services: ['영상 자막 번역', '더빙']
            },
            '5-3': {
                name: '동시통역',
                services: ['회의 통역', '행사 통역']
            },
            '5-4': {
                name: '전문 분야',
                services: ['의료 번역', '법률 번역', '기술 번역']
            }
        }
    },
    6: {
        id: 6,
        name: '문서/글쓰기',
        icon: '<i class="fas fa-pen-fancy"></i>',
        subcategories: {
            '6-1': {
                name: '콘텐츠 작성',
                services: ['블로그 포스팅', '뉴스 기사', '카피라이팅']
            },
            '6-2': {
                name: '전문 문서',
                services: ['사업 계획서', '제안서', '논문 교정']
            },
            '6-3': {
                name: '창작 글쓰기',
                services: ['소설 창작', '시나리오 작성']
            }
        }
    },
    7: {
        id: 7,
        name: '비즈니스 컨설팅',
        icon: '<i class="fas fa-briefcase"></i>',
        subcategories: {
            '7-1': {
                name: '창업 컨설팅',
                services: ['창업 아이디어 검증', '사업 계획 컨설팅']
            },
            '7-2': {
                name: '재무/회계',
                services: ['재무 상담', '회계 자문']
            },
            '7-3': {
                name: '법률 자문',
                services: ['법률 상담', '계약 검토']
            },
            '7-4': {
                name: 'HR/인사',
                services: ['채용 컨설팅', '인사 정책 수립']
            }
        }
    },
    8: {
        id: 8,
        name: '레슨/과외',
        icon: '<i class="fas fa-book"></i>',
        subcategories: {
            '8-1': {
                name: '언어 교육',
                services: ['영어 레슨', '중국어 레슨', '일본어 레슨']
            },
            '8-2': {
                name: '음악 레슨',
                services: ['피아노 레슨', '기타 레슨', '보컬 레슨']
            },
            '8-3': {
                name: '운동 교육',
                services: ['퍼스널 트레이닝', '요가', '필라테스']
            },
            '8-4': {
                name: '학습 과외',
                services: ['수학 과외', '과학 과외']
            },
            '8-5': {
                name: '취미 교육',
                services: ['요리 클래스', '그림 강좌', '댄스 레슨']
            }
        }
    },
    9: {
        id: 9,
        name: '음악/오디오',
        icon: '<i class="fas fa-music"></i>',
        subcategories: {
            '9-1': {
                name: '작곡/편곡',
                services: ['작곡', '편곡', '악기 편성']
            },
            '9-2': {
                name: '믹싱/마스터링',
                services: ['믹싱', '마스터링']
            },
            '9-3': {
                name: '성우/더빙',
                services: ['성우 녹음', '더빙']
            },
            '9-4': {
                name: '악기 연주',
                services: ['악기 연주 녹음', '배경음악']
            }
        }
    },
    10: {
        id: 10,
        name: '생활/이벤트',
        icon: '<i class="fas fa-calendar"></i>',
        subcategories: {
            '10-1': {
                name: '행사 기획',
                services: ['결혼식 기획', '파티 기획', '기업 행사']
            },
            '10-2': {
                name: '인테리어 디자인',
                services: ['인테리어 상담', '공간 설계']
            },
            '10-3': {
                name: '정리 컨설팅',
                services: ['수납 정리', '단순화 컨설팅']
            },
            '10-4': {
                name: '심부름/대행',
                services: ['쇼핑 대행', '예약 대행']
            }
        }
    },
    11: {
        id: 11,
        name: '뷰티/패션',
        icon: '<i class="fas fa-spa"></i>',
        subcategories: {
            '11-1': {
                name: '메이크업',
                services: ['메이크업 시술', '브라이덜 메이크업']
            },
            '11-2': {
                name: '헤어스타일링',
                services: ['헤어 스타일링', '매직/매직 숌']
            },
            '11-3': {
                name: '퍼스널 컬러',
                services: ['퍼스널 컬러 진단', '피부 진단']
            },
            '11-4': {
                name: '스타일링',
                services: ['패션 스타일링', '이미지 컨설팅']
            }
        }
    },
    12: {
        id: 12,
        name: '상담/코칭',
        icon: '<i class="fas fa-bullseye"></i>',
        subcategories: {
            '12-1': {
                name: '심리 상담',
                services: ['심리 상담', '스트레스 관리']
            },
            '12-2': {
                name: '커리어 코칭',
                services: ['커리어 코칭', '진로 상담']
            },
            '12-3': {
                name: '라이프 코칭',
                services: ['라이프 코칭', '목표 설정']
            },
            '12-4': {
                name: '재무 상담',
                services: ['재무 설계', '투자 상담']
            }
        }
    },
    13: {
        id: 13,
        name: '운세/타로',
        icon: '<i class="fas fa-star"></i>',
        subcategories: {
            '13-1': {
                name: '타로 상담',
                services: ['타로 리딩', '연애운 타로', '재물운 타로', '진로 타로']
            },
            '13-2': {
                name: '사주/운세',
                services: ['사주 풀이', '토정비결', '궁합 상담', '작명/개명']
            },
            '13-3': {
                name: '점술',
                services: ['관상', '수상', '궁합']
            },
            '13-4': {
                name: '영적 상담',
                services: ['영적 힐링', '전생 리딩', '오라 리딩']
            }
        }
    },
    14: {
        id: 14,
        name: '전자책/템플릿',
        icon: '<i class="fas fa-book-open"></i>',
        subcategories: {
            '14-1': {
                name: '전자책',
                services: ['전자책 제작', '전자책 편집', 'PDF 변환', '전자책 출판']
            },
            '14-2': {
                name: '문서 템플릿',
                services: ['PPT 템플릿', '엑셀 템플릿', '워드 템플릿', '노션 템플릿']
            },
            '14-3': {
                name: '디자인 템플릿',
                services: ['SNS 템플릿', '명함 템플릿', '포스터 템플릿', '배너 템플릿']
            },
            '14-4': {
                name: '코딩 템플릿',
                services: ['웹사이트 템플릿', '앱 템플릿', '코드 스니펫']
            }
        }
    },
    15: {
        id: 15,
        name: 'AI 서비스',
        icon: '<i class="fas fa-robot"></i>',
        subcategories: {
            '15-1': {
                name: 'AI 컨설팅',
                services: ['AI 도입 컨설팅', 'AI 전략 수립', 'AI 프로세스 개선']
            },
            '15-2': {
                name: 'AI 개발',
                services: ['챗봇 개발', 'AI 모델 개발', '이미지 생성 AI', '텍스트 생성 AI']
            },
            '15-3': {
                name: 'AI 활용',
                services: ['AI 이미지 생성', 'AI 글쓰기', 'AI 영상 제작', 'AI 음악 생성']
            },
            '15-4': {
                name: '데이터 분석',
                services: ['빅데이터 분석', '예측 모델링', '데이터 시각화']
            }
        }
    },
    16: {
        id: 16,
        name: '세무/법무/노무',
        icon: '<i class="fas fa-gavel"></i>',
        subcategories: {
            '16-1': {
                name: '세무 대행',
                services: ['종합소득세 신고', '부가가치세 신고', '법인세 신고', '세무 상담']
            },
            '16-2': {
                name: '법률 자문',
                services: ['법률 상담', '계약서 검토', '내용증명 작성', '소송 자문']
            },
            '16-3': {
                name: '노무 관리',
                services: ['4대보험 관리', '급여 계산', '근로계약서 작성', '노무 상담']
            },
            '16-4': {
                name: '특허/지식재산',
                services: ['특허 출원', '상표 등록', '저작권 등록']
            }
        }
    },
    17: {
        id: 17,
        name: '주문제작',
        icon: '<i class="fas fa-hammer"></i>',
        subcategories: {
            '17-1': {
                name: '굿즈 제작',
                services: ['티셔츠 제작', '머그컵 제작', '에코백 제작', '스티커 제작', '키링 제작']
            },
            '17-2': {
                name: '인쇄물 제작',
                services: ['명함 인쇄', '스티커 인쇄', '포스터 인쇄', '브로슈어 인쇄']
            },
            '17-3': {
                name: '수제품 제작',
                services: ['가죽 공예', '목공예', '도자기', '비누/캔들']
            },
            '17-4': {
                name: '맞춤 선물',
                services: ['맞춤 액자', '맞춤 앨범', '커플템 제작', '기념품 제작']
            }
        }
    },
    18: {
        id: 18,
        name: '취업/입시',
        icon: '<i class="fas fa-graduation-cap"></i>',
        subcategories: {
            '18-1': {
                name: '취업 컨설팅',
                services: ['이력서 첨삭', '자기소개서 작성', '면접 코칭', '취업 전략']
            },
            '18-2': {
                name: '입시 컨설팅',
                services: ['대입 컨설팅', '편입 컨설팅', '유학 컨설팅', 'MBA 컨설팅']
            },
            '18-3': {
                name: '자격증',
                services: ['자격증 과외', '자격증 공부법', '수험서 추천']
            },
            '18-4': {
                name: '포트폴리오',
                services: ['포트폴리오 제작', '포트폴리오 첨삭', '작품집 디자인']
            }
        }
    },
    19: {
        id: 19,
        name: '투잡/부업',
        icon: '<i class="fas fa-briefcase"></i>',
        subcategories: {
            '19-1': {
                name: '온라인 부업',
                services: ['블로그 수익화', '유튜브 수익화', '스마트스토어', '쿠팡파트너스']
            },
            '19-2': {
                name: '재테크',
                services: ['주식 투자', '부동산 투자', '코인 투자', '재테크 컨설팅']
            },
            '19-3': {
                name: '창업 노하우',
                services: ['소자본 창업', '프랜차이즈', '1인 창업', '온라인 창업']
            },
            '19-4': {
                name: '수익화 전략',
                services: ['광고 수익', '제휴 마케팅', '디지털 상품 판매']
            }
        }
    },
    20: {
        id: 20,
        name: '직무역량',
        icon: '<i class="fas fa-chart-line"></i>',
        subcategories: {
            '20-1': {
                name: '오피스 스킬',
                services: ['엑셀 교육', 'PPT 제작', '워드 교육', '구글 스프레드시트']
            },
            '20-2': {
                name: '비즈니스 스킬',
                services: ['프레젠테이션 스킬', '협상 스킬', '리더십 교육', '커뮤니케이션']
            },
            '20-3': {
                name: '프로젝트 관리',
                services: ['PM 교육', '애자일 교육', '업무 자동화', '프로세스 개선']
            },
            '20-4': {
                name: '디지털 리터러시',
                services: ['노션 활용', '슬랙 활용', '업무 툴 교육', 'ChatGPT 활용']
            }
        }
    }
};

const TRENDING_KEYWORDS = [
    '#로고디자인', '#명함디자인', '#SNS콘텐츠', '#웹사이트제작',
    '#쇼핑몰구축', '#영상편집', '#번역', '#과외', '#일러스트',
    '#유튜브썸네일', '#광고대행', '#이력서작성', '#포트폴리오',
    '#앱개발', '#영어과외', '#BI디자인', '#패키지디자인'
];