/**
 * AI 분쟁 판결 엔진
 * 모든 서비스 유형과 분쟁 케이스를 고려한 판결 시스템
 */

// ============================================
// 1. 서비스 유형 분류
// ============================================
export const SERVICE_TYPES = {
  // 창작물 (불가분적 용역)
  CREATIVE: {
    id: 'creative',
    name: '창작물',
    examples: ['로고 디자인', '일러스트', '영상 제작', '음악 작곡', '글쓰기', '웹툰'],
    divisible: false, // 불가분적
    hasDeliverable: true, // 결과물 있음
    refundableBeforeStart: true,
    refundableAfterStart: false, // 시작 후 원칙적 환불 불가
    partialRefundPossible: true, // 진행률에 따라 협의 가능
  },

  // 기술 개발 (단계적 가분)
  DEVELOPMENT: {
    id: 'development',
    name: '기술 개발',
    examples: ['웹사이트 개발', '앱 개발', '프로그램 제작', 'DB 구축', 'API 개발'],
    divisible: true, // 가분적 (마일스톤 기준)
    hasDeliverable: true,
    refundableBeforeStart: true,
    refundableAfterStart: true, // 미진행 단계 환불 가능
    partialRefundPossible: true,
  },

  // 레슨/교육 (시간 기반 가분)
  LESSON: {
    id: 'lesson',
    name: '레슨/교육',
    examples: ['과외', '온라인 강의', '코칭', '멘토링', '컨설팅'],
    divisible: true, // 가분적 (회차 기준)
    hasDeliverable: false, // 결과물 없음 (과정 자체가 서비스)
    refundableBeforeStart: true,
    refundableAfterStart: true, // 남은 회차 환불
    partialRefundPossible: true,
  },

  // 상담 (시간 기반)
  CONSULTATION: {
    id: 'consultation',
    name: '상담',
    examples: ['법률 상담', '세무 상담', '심리 상담', '진로 상담', '창업 상담'],
    divisible: true, // 가분적 (시간/회차 기준)
    hasDeliverable: false, // 또는 보고서
    refundableBeforeStart: true,
    refundableAfterStart: true,
    partialRefundPossible: true,
  },

  // 대행 서비스 (결과물 기반)
  AGENCY: {
    id: 'agency',
    name: '대행',
    examples: ['번역', '문서 작성', '이력서 작성', '대리 신청', '리서치'],
    divisible: false, // 불가분적 (결과물 전달)
    hasDeliverable: true,
    refundableBeforeStart: true,
    refundableAfterStart: false,
    partialRefundPossible: true,
  },

  // 심부름 (완료 기반)
  ERRAND: {
    id: 'errand',
    name: '심부름',
    examples: ['배달', '구매 대행', '줄서기', '물건 전달', '픽업'],
    divisible: false, // 불가분적 (완료/미완료)
    hasDeliverable: true, // 물품 또는 증거사진
    refundableBeforeStart: true,
    refundableAfterStart: false, // 출발 후 환불 불가
    partialRefundPossible: false, // 심부름은 부분 환불 어려움
    specialRules: ['출발 전 취소 가능', '물품 파손 시 배상'],
  },

  // 오프라인 작업
  OFFLINE: {
    id: 'offline',
    name: '오프라인 작업',
    examples: ['촬영', '이사', '청소', '수리', '설치', '인테리어'],
    divisible: true, // 가분적 (일부 작업 완료 가능)
    hasDeliverable: true, // 사진/영상 증거
    refundableBeforeStart: true,
    refundableAfterStart: true,
    partialRefundPossible: true,
    specialRules: ['출장비 별도', '자재비 별도', '현장 상황에 따라 변동'],
  },
};

// ============================================
// 2. 분쟁 유형 정의
// ============================================
export const DISPUTE_TYPES = {
  // 구매자 신청
  REFUND_REQUEST: {
    id: 'refund',
    name: '환불 요청',
    plaintiff: 'buyer',
    description: '서비스가 제공되지 않았거나 취소하고 싶습니다',
  },

  QUALITY_COMPLAINT: {
    id: 'quality',
    name: '품질 불만',
    plaintiff: 'buyer',
    description: '제공된 서비스가 기대에 미치지 못합니다',
  },

  CONTRACT_MISMATCH: {
    id: 'mismatch',
    name: '계약/광고 불일치',
    plaintiff: 'buyer',
    description: '서비스 설명과 실제 제공 내용이 다릅니다',
  },

  NO_RESPONSE_SELLER: {
    id: 'no_response',
    name: '판매자 무응답',
    plaintiff: 'buyer',
    description: '판매자가 연락이 되지 않습니다',
  },

  DEADLINE_MISSED: {
    id: 'deadline',
    name: '납기 지연',
    plaintiff: 'buyer',
    description: '약속한 기한 내에 서비스가 제공되지 않았습니다',
  },

  INCOMPLETE_DELIVERY: {
    id: 'incomplete',
    name: '불완전 이행',
    plaintiff: 'buyer',
    description: '서비스가 완전히 제공되지 않았습니다',
  },

  DAMAGED_GOODS: {
    id: 'damaged',
    name: '물품 파손/분실',
    plaintiff: 'buyer',
    description: '심부름 중 물품이 파손되거나 분실되었습니다',
  },

  // 판매자 신청
  SCOPE_CREEP: {
    id: 'extra_charge',
    name: '범위 초과 요청',
    plaintiff: 'seller',
    description: '구매자가 계약 범위를 벗어난 요청을 합니다',
  },

  NO_RESPONSE_BUYER: {
    id: 'buyer_no_response',
    name: '구매자 무응답',
    plaintiff: 'seller',
    description: '구매자가 연락이 되지 않습니다',
  },

  UNFAIR_REVIEW: {
    id: 'unfair_review',
    name: '부당한 리뷰',
    plaintiff: 'seller',
    description: '사실과 다른 악의적인 리뷰가 작성되었습니다',
  },

  BUYER_CANCELLATION: {
    id: 'buyer_cancel',
    name: '일방적 취소',
    plaintiff: 'seller',
    description: '구매자가 작업 진행 중 일방적으로 취소를 요구합니다',
  },

  MODIFICATION_ABUSE: {
    id: 'mod_abuse',
    name: '과도한 수정 요청',
    plaintiff: 'seller',
    description: '합의된 수정 횟수를 초과하여 요청합니다',
  },
};

// ============================================
// 3. 서비스 진행 상태
// ============================================
export const SERVICE_STAGES = {
  BEFORE_START: {
    id: 'before_start',
    name: '서비스 시작 전',
    description: '주문 완료 후 작업 시작 전',
    defaultRefund: 'full', // 기본 전액 환불
  },

  IN_PROGRESS: {
    id: 'in_progress',
    name: '서비스 진행 중',
    description: '작업이 진행되고 있는 상태',
    defaultRefund: 'partial', // 진행률에 따라 부분 환불
  },

  DELIVERED: {
    id: 'delivered',
    name: '결과물 전달됨',
    description: '결과물이 전달되었으나 구매 확정 전',
    defaultRefund: 'review', // 검토 후 결정
  },

  REVISION: {
    id: 'revision',
    name: '수정 진행 중',
    description: '수정 요청에 따른 작업 진행 중',
    defaultRefund: 'review',
  },

  COMPLETED: {
    id: 'completed',
    name: '구매 확정',
    description: '구매자가 구매 확정한 상태',
    defaultRefund: 'negotiation', // 당사자 협의
  },
};

// ============================================
// 4. 판결 기준 (법적 근거 포함)
// ============================================
export const VERDICT_RULES = {
  // 기본 규정 (전자상거래법, 소비자보호법 기반)
  BASIC: {
    beforeStart: {
      verdict: 'full_refund',
      reason: '용역 제공이 개시되기 전이므로 전액 환불이 가능합니다.',
      legalBasis: '전자상거래 소비자보호법 제17조',
    },

    inProgressDivisible: {
      verdict: 'partial_refund',
      reason: '가분적 용역으로, 개시되지 않은 범위에 대해 환불이 가능합니다.',
      legalBasis: '전자상거래 소비자보호법 제17조 제2항',
    },

    inProgressIndivisible: {
      verdict: 'no_refund',
      reason: '불가분적 용역으로, 용역 제공이 개시된 경우 환불이 불가합니다.',
      legalBasis: '전자상거래 소비자보호법 제17조 제2항',
      exception: '단, 판매자 귀책사유가 있는 경우 협의 가능',
    },

    misrepresentation: {
      verdict: 'full_refund',
      reason: '표시/광고 내용과 다르게 이행된 경우 환불이 가능합니다.',
      legalBasis: '전자상거래 소비자보호법 제17조 제3항',
      validPeriod: '용역 공급일로부터 3개월 또는 인지일로부터 30일',
    },

    afterConfirmation: {
      verdict: 'negotiation',
      reason: '구매 확정 후에는 판매자와 직접 협의가 필요합니다.',
      legalBasis: '민법 제544조 (계약해제)',
    },
  },

  // 서비스 유형별 특수 규정
  CREATIVE: {
    revisionLimit: {
      withinLimit: {
        verdict: 'continue',
        reason: '약정된 수정 횟수 내이므로 수정을 진행해야 합니다.',
      },
      overLimit: {
        verdict: 'extra_payment',
        reason: '약정된 수정 횟수를 초과했으므로 추가 비용이 발생합니다.',
      },
      noLimitSpecified: {
        verdict: 'review',
        reason: '수정 횟수가 명시되지 않은 경우 합리적 범위 내 수정 의무가 있습니다.',
        guideline: '일반적으로 2-3회 수정이 합리적 범위로 인정됩니다.',
      },
    },

    subjectiveQuality: {
      verdict: 'review',
      reason: '창작물의 품질은 주관적이므로, 계약 내용 충족 여부를 기준으로 판단합니다.',
      criteria: [
        '최초 요구사항 충족 여부',
        '참고 이미지/스타일 가이드 반영 여부',
        '기술적 품질 (해상도, 파일 형식 등)',
        '업계 표준 충족 여부',
      ],
    },
  },

  LESSON: {
    noShow: {
      byBuyer: {
        verdict: 'no_refund_session',
        reason: '수업 당일 무단 불참 시 해당 회차는 환불되지 않습니다.',
      },
      bySeller: {
        verdict: 'refund_session',
        reason: '강사 불참 시 해당 회차는 환불되거나 보강이 진행됩니다.',
      },
    },

    dissatisfaction: {
      earlyStage: {
        verdict: 'partial_refund',
        reason: '초기 단계에서 수업 방식 불만 시 잔여 회차 환불이 가능합니다.',
        condition: '전체 일정의 30% 이내',
      },
      lateStage: {
        verdict: 'negotiation',
        reason: '상당 부분 진행 후 불만 시 당사자 협의가 필요합니다.',
      },
    },
  },

  ERRAND: {
    beforeDeparture: {
      verdict: 'full_refund',
      reason: '라이더 출발 전 취소는 전액 환불됩니다.',
    },

    afterDeparture: {
      verdict: 'no_refund',
      reason: '라이더 출발 후에는 환불이 불가합니다.',
      exception: '라이더 귀책사유 (지연, 파손 등) 시 배상',
    },

    damagedGoods: {
      verdict: 'compensation',
      reason: '물품 파손 시 배상 책임이 있습니다.',
      calculation: '실제 손해액 또는 물품 가액',
    },

    wrongDelivery: {
      verdict: 'refund_and_compensation',
      reason: '잘못된 배달 시 환불 및 추가 손해 배상이 필요합니다.',
    },
  },

  OFFLINE: {
    travelFee: {
      cancelled: {
        verdict: 'travel_fee_only',
        reason: '현장 도착 후 취소 시 출장비는 청구됩니다.',
      },
    },

    materialCost: {
      verdict: 'material_fee',
      reason: '이미 구입한 자재 비용은 환불되지 않습니다.',
    },

    partialCompletion: {
      verdict: 'proportional_payment',
      reason: '완료된 작업에 비례하여 비용을 정산합니다.',
    },
  },
};

// ============================================
// 5. 증거 평가 기준
// ============================================
export const EVIDENCE_CRITERIA = {
  CHAT_LOG: {
    weight: 'high',
    evaluates: ['요구사항 변경 여부', '합의 내용', '대응 시간', '분쟁 경위'],
  },

  CONTRACT: {
    weight: 'high',
    evaluates: ['서비스 범위', '수정 횟수', '납기일', '금액'],
  },

  DELIVERABLE: {
    weight: 'high',
    evaluates: ['요구사항 충족', '품질 수준', '완성도'],
  },

  SCREENSHOT: {
    weight: 'medium',
    evaluates: ['추가 증거', '상황 설명'],
  },

  THIRD_PARTY: {
    weight: 'medium',
    evaluates: ['객관적 평가', '전문가 의견'],
  },
};

// ============================================
// 6. AI 판결 알고리즘
// ============================================
export interface DisputeContext {
  serviceType: keyof typeof SERVICE_TYPES;
  disputeType: keyof typeof DISPUTE_TYPES;
  serviceStage: keyof typeof SERVICE_STAGES;
  plaintiffRole: 'buyer' | 'seller';

  // 계약 정보
  contractDetails: {
    totalAmount: number;
    revisionLimit?: number;
    deadline?: Date;
    deliverables?: string[];
    specialTerms?: string[];
  };

  // 진행 상태
  progress: {
    percentage: number; // 0-100
    revisionsUsed: number;
    completedMilestones?: string[];
    deliveredItems?: string[];
  };

  // 증거
  evidence: {
    chatLogs?: boolean;
    contract?: boolean;
    deliverables?: boolean;
    screenshots?: boolean;
    responseTime?: number; // 마지막 응답으로부터 경과 시간 (시간)
  };

  // 양측 주장
  claims: {
    plaintiff: string;
    defendant?: string;
  };
}

export interface VerdictResult {
  verdict:
    | 'full_refund'
    | 'partial_refund'
    | 'no_refund'
    | 'extra_payment'
    | 'negotiation'
    | 'continue';
  refundAmount: number;
  refundPercentage: number;
  reason: string;
  legalBasis?: string;
  recommendations: string[];
  confidence: 'high' | 'medium' | 'low';
}

export function analyzeDispute(context: DisputeContext): VerdictResult {
  const serviceConfig = SERVICE_TYPES[context.serviceType];


  // CASE 1: 서비스 시작 전 취소
  if (context.serviceStage === 'BEFORE_START') {
    return {
      verdict: 'full_refund',
      refundAmount: context.contractDetails.totalAmount,
      refundPercentage: 100,
      reason: VERDICT_RULES.BASIC.beforeStart.reason,
      legalBasis: VERDICT_RULES.BASIC.beforeStart.legalBasis,
      recommendations: ['판매자는 차후 더 신중한 계약을 권장합니다.'],
      confidence: 'high',
    };
  }

  // CASE 2: 판매자 무응답
  if (context.disputeType === 'NO_RESPONSE_SELLER') {
    if (context.evidence.responseTime && context.evidence.responseTime >= 48) {
      const refundPercentage = 100 - context.progress.percentage;
      return {
        verdict: 'partial_refund',
        refundAmount: Math.round(context.contractDetails.totalAmount * (refundPercentage / 100)),
        refundPercentage,
        reason: `판매자가 ${context.evidence.responseTime}시간 이상 무응답 상태입니다. 미진행 부분에 대해 환불 처리합니다.`,
        legalBasis: '소비자분쟁해결기준',
        recommendations: ['판매자에게 경고 조치', '반복 시 판매자 자격 제한 검토'],
        confidence: 'high',
      };
    }
  }

  // CASE 3: 수정 횟수 분쟁
  if (context.disputeType === 'MODIFICATION_ABUSE') {
    const limit = context.contractDetails.revisionLimit;
    const used = context.progress.revisionsUsed;

    if (limit && used > limit) {
      return {
        verdict: 'extra_payment',
        refundAmount: 0,
        refundPercentage: 0,
        reason: `계약된 수정 횟수(${limit}회)를 초과했습니다. 추가 수정에 대해 별도 비용이 발생합니다.`,
        recommendations: [
          `추가 수정 ${used - limit}회에 대한 비용 협의 권장`,
          '서비스 설명에 수정 횟수 명시 여부 확인',
        ],
        confidence: 'high',
      };
    } else if (!limit) {
      return {
        verdict: 'review',
        refundAmount: 0,
        refundPercentage: 0,
        reason: '수정 횟수가 명시되지 않았습니다. 일반적으로 2-3회가 합리적 범위입니다.',
        recommendations: [
          `현재 ${used}회 수정 진행됨`,
          used <= 3 ? '합리적 범위 내 수정 의무 인정' : '추가 수정 비용 협의 권장',
        ],
        confidence: 'medium',
      };
    }
  }

  // CASE 4: 품질 불만 (창작물)
  if (context.disputeType === 'QUALITY_COMPLAINT' && context.serviceType === 'CREATIVE') {
    // 증거 평가
    const hasStrongEvidence = context.evidence.contract && context.evidence.chatLogs;

    if (context.progress.deliveredItems && context.progress.deliveredItems.length > 0) {
      return {
        verdict: 'review',
        refundAmount: 0,
        refundPercentage: 0,
        reason: '창작물이 전달된 상태입니다. 계약 내용 충족 여부를 검토합니다.',
        recommendations: [
          '최초 요구사항과 결과물 비교 필요',
          '약정된 수정 횟수 내 수정 권장',
          hasStrongEvidence ? '증거 기반 판단 가능' : '추가 증거 제출 권장',
        ],
        confidence: hasStrongEvidence ? 'medium' : 'low',
      };
    }
  }

  // CASE 5: 심부름 관련 분쟁
  if (context.serviceType === 'ERRAND') {
    if (context.disputeType === 'DAMAGED_GOODS') {
      return {
        verdict: 'compensation',
        refundAmount: context.contractDetails.totalAmount, // 물품 가액 필요
        refundPercentage: 100,
        reason: '심부름 중 물품 파손에 대한 배상 책임이 있습니다.',
        recommendations: ['물품 가액 증빙 필요', '파손 경위 확인 필요', '라이더 과실 여부 판단'],
        confidence: 'medium',
      };
    }

    if (context.serviceStage === 'IN_PROGRESS') {
      return {
        verdict: 'no_refund',
        refundAmount: 0,
        refundPercentage: 0,
        reason: VERDICT_RULES.ERRAND.afterDeparture.reason,
        recommendations: [
          '라이더가 이미 출발한 경우 취소 불가',
          '특별한 사유 있을 시 관리자 검토 요청',
        ],
        confidence: 'high',
      };
    }
  }

  // CASE 6: 가분적 용역 - 진행 중
  if (serviceConfig.divisible && context.serviceStage === 'IN_PROGRESS') {
    const refundPercentage = 100 - context.progress.percentage;
    return {
      verdict: 'partial_refund',
      refundAmount: Math.round(context.contractDetails.totalAmount * (refundPercentage / 100)),
      refundPercentage,
      reason: VERDICT_RULES.BASIC.inProgressDivisible.reason,
      legalBasis: VERDICT_RULES.BASIC.inProgressDivisible.legalBasis,
      recommendations: [
        `진행률 ${context.progress.percentage}% 기준 정산`,
        '완료된 작업물 인도 권장',
      ],
      confidence: 'high',
    };
  }

  // CASE 7: 불가분적 용역 - 진행 중
  if (!serviceConfig.divisible && context.serviceStage === 'IN_PROGRESS') {
    return {
      verdict: 'no_refund',
      refundAmount: 0,
      refundPercentage: 0,
      reason: VERDICT_RULES.BASIC.inProgressIndivisible.reason,
      legalBasis: VERDICT_RULES.BASIC.inProgressIndivisible.legalBasis,
      recommendations: [
        '불가분적 용역은 시작 후 환불이 어렵습니다',
        '양측 협의를 통한 해결 권장',
        '판매자 귀책사유 시 예외 검토 가능',
      ],
      confidence: 'high',
    };
  }

  // CASE 8: 구매 확정 후
  if (context.serviceStage === 'COMPLETED') {
    return {
      verdict: 'negotiation',
      refundAmount: 0,
      refundPercentage: 0,
      reason: VERDICT_RULES.BASIC.afterConfirmation.reason,
      legalBasis: VERDICT_RULES.BASIC.afterConfirmation.legalBasis,
      recommendations: [
        '구매 확정 후에는 당사자 협의가 원칙입니다',
        '판매자의 동의 하에 환불 가능',
        '합의 불가 시 관리자 중재 요청',
      ],
      confidence: 'high',
    };
  }

  // 기본값: 검토 필요
  return {
    verdict: 'negotiation',
    refundAmount: 0,
    refundPercentage: 0,
    reason: '복합적인 사안으로 양측 협의가 필요합니다.',
    recommendations: [
      '추가 증거 제출 권장',
      '채팅을 통한 협의 시도',
      '합의 불가 시 관리자 중재 요청',
    ],
    confidence: 'low',
  };
}

// ============================================
// 7. AI 판결문 생성
// ============================================
export function generateVerdictDocument(
  caseNumber: string,
  plaintiff: { name: string; role: string },
  defendant: { name: string; role: string },
  context: DisputeContext,
  verdictResult: VerdictResult
): string {
  const now = new Date();
  const formattedDate = now.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const verdictText = {
    full_refund: '전액 환불',
    partial_refund: '부분 환불',
    no_refund: '환불 불가',
    extra_payment: '추가 정산',
    negotiation: '합의 권고',
    continue: '서비스 계속 진행',
    compensation: '손해 배상',
    review: '추가 검토 필요',
  };

  return `
═══════════════════════════════════════════════════════════════
                    ⚖️ AI 심판관 판결문
═══════════════════════════════════════════════════════════════

【사건 번호】 ${caseNumber}
【판결 일자】 ${formattedDate}

───────────────────────────────────────────────────────────────
■ 당사자
───────────────────────────────────────────────────────────────
  원고 (${plaintiff.role}): ${plaintiff.name}
  피고 (${defendant.role}): ${defendant.name}

───────────────────────────────────────────────────────────────
■ 분쟁 개요
───────────────────────────────────────────────────────────────
  서비스 유형: ${SERVICE_TYPES[context.serviceType].name}
  분쟁 유형: ${DISPUTE_TYPES[context.disputeType].name}
  분쟁 금액: ${context.contractDetails.totalAmount.toLocaleString()}원
  진행 상태: ${SERVICE_STAGES[context.serviceStage].name}

───────────────────────────────────────────────────────────────
■ 주문 (판결)
───────────────────────────────────────────────────────────────

  📌 ${verdictText[verdictResult.verdict] || verdictResult.verdict}

${
  verdictResult.refundAmount > 0
    ? `
  💰 환불 금액: ${verdictResult.refundAmount.toLocaleString()}원 (${verdictResult.refundPercentage}%)
`
    : ''
}

───────────────────────────────────────────────────────────────
■ 판결 이유
───────────────────────────────────────────────────────────────

  ${verdictResult.reason}

${
  verdictResult.legalBasis
    ? `
【적용 법령】
  ${verdictResult.legalBasis}
`
    : ''
}

───────────────────────────────────────────────────────────────
■ 권고 사항
───────────────────────────────────────────────────────────────
${verdictResult.recommendations.map((r, i) => `  ${i + 1}. ${r}`).join('\n')}

───────────────────────────────────────────────────────────────
■ 판결 신뢰도: ${verdictResult.confidence === 'high' ? '높음 ⭐⭐⭐' : (verdictResult.confidence === 'medium' ? '보통 ⭐⭐' : '낮음 ⭐')}
───────────────────────────────────────────────────────────────

  본 판결에 이의가 있는 당사자는 24시간 내 이의 신청이 가능합니다.
  이의 신청 시 관리자가 직접 검토합니다.

═══════════════════════════════════════════════════════════════
                      Dolpagu AI 심판관
═══════════════════════════════════════════════════════════════
`;
}
