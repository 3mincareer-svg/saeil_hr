export interface CenterInfo {
  regionName: string;
  centerName: string;
}

export type JobType = "상담직" | "행정직" | "팀장" | "기타";

export interface FirstStageConfig {
  keyCompetencies: string;
  preferredCertifications: string;
  requiredExperience: string;
  weightCompetency: number; // 1차 내부배점 - 직무전문성
  weightAdmin: number;      // 1차 내부배점 - 행정실무
  weightNetworking: number; // 1차 내부배점 - 구인개척
}

export interface SecondStageConfig {
  orgCultureAndTalent: string;
  requiredAttitudes: string;
  weightCivilComplaint: number; // 2차 내부배점 - 민원응대
  weightCollaborationOrLeadership: number; // 2차 내부배점 - 가치관·협업 (팀장: 리더십·가치관·협업)
}

export interface Candidate {
  id: string; // 고유 ID
  name: string; // 원본 입력 이름
  documentText: string; // 합쳐진 원본 텍스트(자가소개서 등)
}

export interface RawScores {
  firstStage: {
    competency: number;
    competencyEvidence: string;
    admin: number;
    adminEvidence: string;
    networking: number;
    networkingEvidence: string;
  };
  secondStage: {
    civilComplaint: number;
    civilComplaintConfidence: "상" | "중상" | "중" | "하" | "불충분";
    civilComplaintEvidence: string;
    collaborationOrLeadership: number;
    collaborationOrLeadershipConfidence: "상" | "중상" | "중" | "하" | "불충분";
    collaborationOrLeadershipEvidence: string;
  };
}

// AI 응답 지원자 개별 데이터 구조
export interface CandidateEvaluation {
  originalIndex: number;
  maskedName: string;
  oneLineReview: string;
  scores: RawScores;
  summaries: {
    qualificationAndExperience: string;
    adminAndNetworking: string;
    missionAndTalent: string;
    complaintAndCollaboration: string;
  };
  strengthsAndWeaknesses: {
    strength: string;
    weakness: string;
  };
  interviewQuestions: {
    jobAndAdmin: string;
    complaintAndCulture: string;
    insufficientOrMissingConfirm: string;
  };
  overallConfidence: "상" | "중상" | "중" | "하" | "불충분";
}

// 가중치 프로파일 스펙
export interface WeightProfile {
  title: string;
  stageRatio: { first: number; second: number }; // 예: 55 : 45 -> { first: 55, second: 45 }
  firstInternal: { competency: number; admin: number; networking: number }; // 예: 40, 20, 40
  secondInternal: { civilComplaint: number; collaborationOrLeadership: number }; // 예: 60, 40
}

// 클라이언트 계산 후 완전 가공된 지원자 결과
export interface FinalCandidateResult extends CandidateEvaluation {
  // 실제 클라이언트 계산값들
  firstStageRawTotal: number; // 100점 만점으로 스케일된 1차 원점수
  secondStageRawTotal: number; // 100점 만점으로 스케일된 2차 원점수
  secondStageScaleCoef: number; // 신뢰도 계수 (1.00, 0.85, 0.70)
  adjustedSecondStageTotal: number; // 조정 조직적합도 (min(100, 2차 원점수 * 계수))
  finalScore: number; // 최종 가중치 종합점수 (100점 만점)
  
  // 등수 및 보완 결과
  rank: number;
  nearTieGroup?: string; // 근접군 표시 기호 (예: '▢A', '▢B' 등)
}
