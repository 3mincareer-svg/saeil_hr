import React, { useState, useEffect } from "react";
import {
  Sparkles,
  User,
  Users,
  Award,
  BookOpen,
  Briefcase,
  Layers,
  HeartHandshake,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  FileText,
  Trash2,
  ListOrdered,
  Plus,
  Compass,
  ArrowRight,
  Info,
  Scale
} from "lucide-react";
import { 
  CenterInfo, 
  JobType, 
  FirstStageConfig, 
  SecondStageConfig, 
  Candidate, 
  CandidateEvaluation, 
  WeightProfile, 
  FinalCandidateResult
} from "./types";

// 직무별 기본 가중치 프로파일 가이드
const WEIGHT_PROFILES: Record<JobType, WeightProfile> = {
  상담직: {
    title: "직업상담원(상담직)",
    stageRatio: { first: 55, second: 45 },
    firstInternal: { competency: 40, admin: 20, networking: 40 },
    secondInternal: { civilComplaint: 60, collaborationOrLeadership: 40 }
  },
  행정직: {
    title: "행정원(행정직)",
    stageRatio: { first: 65, second: 35 },
    firstInternal: { competency: 25, admin: 50, networking: 25 },
    secondInternal: { civilComplaint: 40, collaborationOrLeadership: 60 }
  },
  팀장: {
    title: "팀장(관리직)",
    stageRatio: { first: 60, second: 40 },
    firstInternal: { competency: 35, admin: 30, networking: 35 },
    secondInternal: { civilComplaint: 30, collaborationOrLeadership: 70 } // 리더십·가치관·협업
  },
  기타: {
    title: "기타·통합(기본값)",
    stageRatio: { first: 60, second: 40 },
    firstInternal: { competency: 40, admin: 30, networking: 30 },
    secondInternal: { civilComplaint: 50, collaborationOrLeadership: 50 }
  }
};

// 신뢰도 가중치 계수
const CONFIDENCE_COEFFICIENTS: Record<string, number> = {
  "상": 1.00,
  "중상": 1.00,
  "중": 1.00,
  "하": 0.85,
  "불충분": 0.70
};

// 고품질 테스트 예시 데이터
const SAMPLE_CANDIDATES: Record<JobType, {
  center: CenterInfo,
  first: FirstStageConfig,
  second: SecondStageConfig,
  candidates: { name: string; documentText: string }[]
}> = {
  상담직: {
    center: {
      regionName: "서울마포",
      centerName: "마포여성새로일하기센터"
    },
    first: {
      keyCompetencies: "직업상담사 자격 및 구인발굴 네트워킹",
      preferredCertifications: "직업상담사 2급 이상, 사회복지사 우대",
      requiredExperience: "관련 직무 경력 1년 이상",
      weightCompetency: 40,
      weightAdmin: 20,
      weightNetworking: 40
    },
    second: {
      orgCultureAndTalent: "여성 취업 미션에 대한 높은 헌신 및 공감 능력",
      requiredAttitudes: "끈기, 경청, 고객 중심 해결력",
      weightCivilComplaint: 60,
      weightCollaborationOrLeadership: 40
    },
    candidates: [
      {
        name: "김영희",
        documentText: `[이력 사항]
- 보유 자격: 직업상담사 2급 취득 (2022년), 워드프로세서 1급
- 경력 사항: 은평구 일자리센터 계약직 직업상담원 1년 2개월 경력
- 연락처: 010-4493-2032, 서울시 마포구 거주. 

[자기소개서 & 직무수행계획서]
저는 경력단절을 겪고 다시 일어선 국문학 전공자로서, 누구보다 구직을 원하는 여성들의 눈물에 깊이 공감합니다. 상담을 받는 분들이 자존감을 회복하고 일터로 향할 수 있도록 따뜻하면서도 원칙 있는 상담을 지속해 왔습니다. 
이전 은평구 일자리센터 근무 시 악성 민원인이 배정되었을 때도, 상대의 화난 이유를 먼저 귀 기울여 들어주고 명확한 지원 요건을 차분하게 정리하여 갈등 없이 처리한 경험이 3차례 이상 반복되어 자부심을 가집니다.
다만, 예산 정산이나 기획안 같은 행무 행정이나 공문서 기안 등은 다른 전임자분이 총괄하여 기회가 별로 없었기에 행정이나 정산 e나라시스템은 배워 나가야 하는 상태입니다. 대신 길거리 구인 안내 가판대 홍보나 마포구 기업 발굴을 위한 현장 개척(신규 기업 5곳 유치 경험 있음) 등 현장 발굴 업무에는 두려움 없이 적극적으로 부딪힐 준비가 되어 있습니다.`
      },
      {
        name: "박지현",
        documentText: `[이력 사항]
- 보유 자격: 직업상담사 2급, 컴퓨터활용능력 2급
- 경력 사항: 일반 기업체 총무부 회계 담당 3년
- 연락처: 010-8842-1100

[자기소개서 & 직무수행계획서]
저는 일반 사기업에서 3년간 회계와 정부 긴급 구직비 정산, 일반 내부 총무 행정 업무를 주로 수행했습니다. 엑셀, 스프레드시트 활용 및 국고 지원금 영수 정산 처리에 매우 정교한 속도를 가지고 있습니다.
이번에 새일센터 직업상담원에 도전하는 이유는 저 역시 육아 이후 새로운 직업을 찾으며 이 분야의 사명감을 절실히 깨달았기 때문입니다. 비록 이전에 일선 직업상담 경력이나 직무에서 신규 기업을 발굴하고 직접 발이나 전화로 기업 구인처를 개척해본 경험은 아직 전무하지만, 친화력 있는 성격으로 빠르게 적응할 수 있습니다.
또한 민원 응대의 경우 일반 고객 지원 전화를 다뤄보았으나 가끔 상처를 받기도 하여 멘탈 회복을 위해 주말 등산 등으로 극복하는 편입니다. 동료 간의 조화를 매우 존중하며 성실하게 복종하는 태도로 든든한 일꾼이 되겠습니다.`
      },
      {
        name: "이지혜",
        documentText: `[이력 사항]
- 보유 자격: 없음 (사회적 일자리 교육 이수)
- 경력 사항: 백화점 고객센터 CS 파트 5년 근무
- 연락처: 010-9988-7766

[자기소개서 & 직무수행계획서]
백화점 CS 파트에서 5년간 일하며 매일 수십 통의 악성 클레임과 환불 민원을 해결해 낸 강력한 소통 역량이 있습니다. 감정 스트레스 관리와 거부 반응 제어에는 베테랑입니다.
여성가족부 직무는 처음이지만 경력단절 여성들의 상처에 대한 공감 능력은 백화점 주 고객층 상담 유경험자로써 탁월하다고 생각합니다.
하지만 직업상담 관련 자격이나 종합 지식, 공공 일자리 프로젝트 예산 가이드 준칙, 기업 채용 발굴을 위한 B2B 영업 네마(Networking) 네트워킹을 직접 영업 기획해 본 경력은 서류상 명시하기에 마땅치 않습니다. 앞으로 열심히 배워 센터장님의 지시를 적극 이행하겠습니다.`
      }
    ]
  },
  행정직: {
    center: {
      regionName: "경기수원",
      centerName: "수원새일센터"
    },
    first: {
      keyCompetencies: "국고 지원 사업 총무 회계 및 보조금 정산",
      preferredCertifications: "전산세무 2급, 컴퓨터활용능력 1급",
      requiredExperience: "공공기관 또는 유관 행정직 1년 이상",
      weightCompetency: 25,
      weightAdmin: 50,
      weightNetworking: 25
    },
    second: {
      orgCultureAndTalent: "정직성 및 정밀한 회계처리 의식",
      requiredAttitudes: "꼼꼼함, 투명한 협업 스타일",
      weightCivilComplaint: 40,
      weightCollaborationOrLeadership: 60
    },
    candidates: [
      {
        name: "김행정",
        documentText: `공문서 관리와 국고 보조금 정산 2년 유경험자입니다. e-나라시스템 마스터이며, 세무 자격증이 있어 투명하고 깔끔한 서류 처리가 가능합니다. 민감한 성격의 대인 업무보다는 계획된 사무 처리에 능합니다.`
      },
      {
        name: "나꼼꼼",
        documentText: `일반기업 경리 경력 5년. 각종 정산 및 급여 세무 관리 우수. 세무사 사무실 제휴 경험 있음. 행정 실무 능력을 바탕으로 신속하고 공명한 정산을 할 자신이 있습니다.`
      }
    ]
  },
  팀장: {
    center: {
      regionName: "인천남부",
      centerName: "인천남부여성새로일하기센터"
    },
    first: {
      keyCompetencies: "여성 일자리 사업 기획 및 조직 관리",
      preferredCertifications: "팀 리더십 및 직업상담직 경력 5년 이상",
      requiredExperience: "센터 또는 유사 복지기관 관리자 경력 2년 이상",
      weightCompetency: 35,
      weightAdmin: 30,
      weightNetworking: 35
    },
    second: {
      orgCultureAndTalent: "위기 관리 및 성과 도출 리더십",
      requiredAttitudes: "비전 제시, 포용력, 갈등 조정력",
      weightCivilComplaint: 30,
      weightCollaborationOrLeadership: 70
    },
    candidates: [
      {
        name: "오팀장",
        documentText: `새일센터 7년 근속하며 수퍼바이저로 활약했습니다. 연간 사업계획 수립부터 평가 등급 최우수 견인까지 조직을 탄탄히 다져왔습니다. 민원 상담 및 팀원 갈등이 생기면 언제든 선제 조정을 자처합니다.`
      },
      {
        name: "강책임",
        documentText: `타 일자리재단에서 5년간 부서장으로 기획을 총괄했습니다. 대외부서와의 네트워킹에 최고 강점을 보입니다. 예산의 유기적 분배와 직원들의 동기 부여 철학을 지니고 있습니다.`
      }
    ]
  },
  기타: {
    center: {
      regionName: "충북청주",
      centerName: "청주새일지원단"
    },
    first: {
      keyCompetencies: "통합적 직업 지원 프로그램 관리",
      preferredCertifications: "행정 및 상담 복합 자격증 우대",
      requiredExperience: "경력 무관",
      weightCompetency: 40,
      weightAdmin: 30,
      weightNetworking: 30
    },
    second: {
      orgCultureAndTalent: "유연한 사고와 통합적 태도",
      requiredAttitudes: "신속성, 긍정적 수용력",
      weightCivilComplaint: 50,
      weightCollaborationOrLeadership: 50
    },
    candidates: [
      {
        name: "임종합",
        documentText: `스타트업 기여 경력 2년. 행정, 전화 마케팅, 대고객 미팅 등 하이브리드 멀티플레이어로 가치를 증명해 왔습니다. 유연한 팀워크를 통해 센터 성과에 즉각 기여하겠습니다.`
      },
      {
        name: "최다재",
        documentText: `다양한 공공 아르바이트와 프리랜서 상담원 경력이 있는 인재입니다. 전반적인 기초 기획부터 정산까지 빠르게 스펀지처럼 흡수할 각오가 되어 있습니다.`
      }
    ]
  }
};

export default function App() {
  // --- State Managerssf ---
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("");

  // 1단계: 센터 정보 & 가중치 프로파일
  const [centerInfo, setCenterInfo] = useState<CenterInfo>({
    regionName: "서울마포",
    centerName: "마포여성새로일하기센터"
  });
  const [jobType, setJobType] = useState<JobType>("상담직");
  const [targetJobName, setTargetJobName] = useState<string>("직업상담원(상담직)");

  // 직무 프로파일 확인 가이드 모달용 상태
  const [showProfileAlert, setShowProfileAlert] = useState<boolean>(false);
  const [pendingJobType, setPendingJobType] = useState<JobType | null>(null);

  // 종합 가중치 비율 (예: 상담직 55:45)
  const [weightFirstRatio, setWeightFirstRatio] = useState<number>(55);
  const [weightSecondRatio, setWeightSecondRatio] = useState<number>(45);

  // 2단계: 1차 내부 배당
  const [firstStageConfig, setFirstStageConfig] = useState<FirstStageConfig>({
    keyCompetencies: "직구 및 일자리 개척, 구직 상담",
    preferredCertifications: "직업상담사 2급 필수, 사회복지 자격 우대",
    requiredExperience: "직업상담 실무 경력 1년 이상",
    weightCompetency: 40,
    weightAdmin: 20,
    weightNetworking: 40
  });

  // 3단계: 2차 내부 배당
  const [secondStageConfig, setSecondStageConfig] = useState<SecondStageConfig>({
    orgCultureAndTalent: "경단여성 고용 지침 사명감, 적극적인 동료 협력",
    requiredAttitudes: "클레임 대응력, 회복탄력성, 감정 유연성",
    weightCivilComplaint: 60,
    weightCollaborationOrLeadership: 40
  });

  // 4단계 & 5단계: 후보자 입력 관리
  const [candidateCount, setCandidateCount] = useState<number>(3);
  const [candidates, setCandidates] = useState<Candidate[]>([
    { id: "1", name: "김영희", documentText: "" },
    { id: "2", name: "박지현", documentText: "" },
    { id: "3", name: "이지혜", documentText: "" }
  ]);

  // PDF 파일 텍스트 추출 관련 로딩 상태 주어 정밀 피드백 지원
  const [pdfExtractingMap, setPdfExtractingMap] = useState<Record<string, boolean>>({});
  const [batchExtracting, setBatchExtracting] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });

  // 최종 리포트 데이터 결과
  const [analysisResults, setAnalysisResults] = useState<FinalCandidateResult[]>([]);
  // 세부 리포트 확인 중인 대상자 인덱스
  const [selectedCandidateIndex, setSelectedCandidateIndex] = useState<number | null>(null);

  // 1:1 종횡 비교 (Head-to-Head Comparison) 후보자 선택 상태
  const [compareCandidateAName, setCompareCandidateAName] = useState<string>("");
  const [compareCandidateBName, setCompareCandidateBName] = useState<string>("");

  // 초기 로드 시 상담직 예시를 채워주어 바로 테스트 가능하도록 함
  useEffect(() => {
    applySampleTemplate("상담직");
  }, []);

  // 특정 템플릿 로드 적용 함수
  const applySampleTemplate = (type: JobType) => {
    const sample = SAMPLE_CANDIDATES[type];
    setCenterInfo({ ...sample.center });
    setJobType(type);
    
    // 직무에 맞는 가중치 프로파일
    const profile = WEIGHT_PROFILES[type];
    setTargetJobName(profile.title);
    setWeightFirstRatio(profile.stageRatio.first);
    setWeightSecondRatio(profile.stageRatio.second);

    setFirstStageConfig({
      keyCompetencies: sample.first.keyCompetencies,
      preferredCertifications: sample.first.preferredCertifications,
      requiredExperience: sample.first.requiredExperience,
      weightCompetency: profile.firstInternal.competency,
      weightAdmin: profile.firstInternal.admin,
      weightNetworking: profile.firstInternal.networking
    });

    setSecondStageConfig({
      orgCultureAndTalent: sample.second.orgCultureAndTalent,
      requiredAttitudes: sample.second.requiredAttitudes,
      weightCivilComplaint: profile.secondInternal.civilComplaint,
      weightCollaborationOrLeadership: profile.secondInternal.collaborationOrLeadership
    });

    setCandidateCount(sample.candidates.length);
    setCandidates(
      sample.candidates.map((c, idx) => ({
        id: String(idx + 1),
        name: c.name,
        documentText: c.documentText
      }))
    );
  };

  // 직무 변경 시 알림 및 프로파일 적용 수락/거절 핸들러
  const handleJobTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as JobType;
    setPendingJobType(newType);
    setShowProfileAlert(true);
  };

  const confirmApplyProfile = (acceptRecommended: boolean) => {
    if (!pendingJobType) return;
    const type = pendingJobType;
    setJobType(type);
    
    const profile = WEIGHT_PROFILES[type];
    setTargetJobName(profile.title);

    if (acceptRecommended) {
      setWeightFirstRatio(profile.stageRatio.first);
      setWeightSecondRatio(profile.stageRatio.second);

      setFirstStageConfig(prev => ({
        ...prev,
        weightCompetency: profile.firstInternal.competency,
        weightAdmin: profile.firstInternal.admin,
        weightNetworking: profile.firstInternal.networking
      }));

      setSecondStageConfig(prev => ({
        ...prev,
        weightCivilComplaint: profile.secondInternal.civilComplaint,
        weightCollaborationOrLeadership: profile.secondInternal.collaborationOrLeadership
      }));
    } else {
      // 거절 시 커스텀 지정 그대로 둠
    }
    
    setShowProfileAlert(false);
    setPendingJobType(null);
  };

  // 4단계 후보자 수 조절 핸들러
  const handleCandidateCountChange = (count: number) => {
    const cleanCount = Math.max(1, Math.min(10, count));
    setCandidateCount(cleanCount);
    
    setCandidates(prev => {
      const next = [...prev];
      if (next.length < cleanCount) {
        // 추가
        for (let i = next.length; i < cleanCount; i++) {
          next.push({ id: String(Date.now() + i), name: `지원자 ${i + 1}`, documentText: "" });
        }
      } else if (next.length > cleanCount) {
        // 축소
        next.splice(cleanCount);
      }
      return next;
    });
  };

  // 개별 후보자 데이터 수정
  const updateCandidate = (id: string, field: "name" | "documentText", value: string) => {
    setCandidates(prev =>
      prev.map(c => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  // 파일 Base64 변환 유틸리티
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        const commaIndex = base64String.indexOf(",");
        if (commaIndex !== -1) {
          resolve(base64String.substring(commaIndex + 1));
        } else {
          resolve(base64String);
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // PDF 서버 연동 텍스트 추출 함수
  const extractTextFromPdf = async (file: File): Promise<string> => {
    try {
      const base64 = await convertFileToBase64(file);
      const response = await fetch("/api/extract-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ base64Pdf: base64 }),
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "서버 PDF 파싱 중 문제가 발생했습니다.");
      }
      
      const data = await response.json();
      return data.text || "";
    } catch (error: any) {
      console.error("PDF extraction error:", error);
      alert(`PDF 파일 '${file.name}'을 파싱하지 못했습니다. 텍스트 레이어가 있는 정상 PDF 파일이 아닌지 혹은 암호화되어 있는지 확인하십시오.\n에러: ${error.message || error}`);
      return "";
    }
  };

  // 파일명 기준 똑똑한 지원자 이름 정제 유틸리티 (이력서_홍길동_최종.pdf -> 홍길동)
  const extractNameFromFileName = (fileName: string): string => {
    let base = fileName.replace(/\.[^/.]+$/, "");
    const patternsToStrip = [
      "입사지원서", "구직신청서", "자기소개서", "이력서", "자소서", "지원서", 
      "신청서", "제출서류", "서류", "_최종", "최종", "복사본", "문서", "공동", 
      "개인정보", "포트폴리오", "프로필", "resume", "cv"
    ];
    let cleaned = base;
    patternsToStrip.forEach(pattern => {
      cleaned = cleaned.replace(new RegExp(pattern, "gi"), "");
    });
    // clean separators like [_ -]
    cleaned = cleaned.replace(/[_-\s]+/g, " ").trim();
    if (cleaned.length === 0) {
      return base;
    }
    return cleaned;
  };

  // 개별 자소서/이력서 파일 드래그앤드랍 처리 (.txt 및 .pdf 지원)
  const handleFileDrop = async (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      setPdfExtractingMap(prev => ({ ...prev, [id]: true }));
      try {
        const text = await extractTextFromPdf(file);
        if (text) {
          updateCandidate(id, "documentText", text);
          // 만약 지원자명이 비어있거나 임시 명칭이면 파일명에서 추출해 이름도 변경
          const currentCand = candidates.find(c => c.id === id);
          if (currentCand && (!currentCand.name || currentCand.name.startsWith("후보자") || currentCand.name.startsWith("지원자") || currentCand.name === "")) {
            const extractedName = extractNameFromFileName(file.name);
            updateCandidate(id, "name", extractedName);
          }
        }
      } finally {
        setPdfExtractingMap(prev => ({ ...prev, [id]: false }));
      }
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        updateCandidate(id, "documentText", text);
      };
      reader.readAsText(file);
    }
  };

  // 개별 파일 직접 탐색기 등록 (.txt 및 .pdf 지원)
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      setPdfExtractingMap(prev => ({ ...prev, [id]: true }));
      try {
        const text = await extractTextFromPdf(file);
        if (text) {
          updateCandidate(id, "documentText", text);
          const currentCand = candidates.find(c => c.id === id);
          if (currentCand && (!currentCand.name || currentCand.name.startsWith("후보자") || currentCand.name.startsWith("지원자") || currentCand.name === "")) {
            const extractedName = extractNameFromFileName(file.name);
            updateCandidate(id, "name", extractedName);
          }
        }
      } finally {
        setPdfExtractingMap(prev => ({ ...prev, [id]: false }));
      }
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        updateCandidate(id, "documentText", text);
      };
      reader.readAsText(file);
    }
  };

  // 📂 PDF 파일 일괄 업로드 (배치 처리)
  const handleBatchPdfUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    
    const files = Array.from(fileList).filter(f => f.type === "application/pdf" || f.name.endsWith(".pdf"));
    if (files.length === 0) {
      alert("선택된 파일 중 PDF 파일(.pdf)이 없습니다.");
      return;
    }

    setBatchExtracting(true);
    setBatchProgress({ current: 0, total: files.length });
    
    try {
      const newExtractedCandidates: Candidate[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setBatchProgress({ current: i + 1, total: files.length });
        
        const text = await extractTextFromPdf(file);
        const name = extractNameFromFileName(file.name);
        
        newExtractedCandidates.push({
          id: String(Date.now() + i), // 고유 타임스탬프 기반 ID
          name: name,
          documentText: text || "[PDF가 비어있거나 텍스트 수집에 실패했습니다]"
        });
      }

      // 기존 지원자가 비어있는 초기 빈 값 상태인 경우 덮어씌움
      const isInitialDummy = candidates.length === 3 && candidates.every(c => !c.documentText);
      
      if (isInitialDummy) {
        setCandidates(newExtractedCandidates);
        setCandidateCount(newExtractedCandidates.length);
      } else {
        if (confirm(`이미 입력된 지원자 정보가 존재합니다. 새로 분석 완료한 ${newExtractedCandidates.length}명의 후보자 정보를 기존 목록 뒤에 결합할까요?\n\n- [확인/네]: 기존 목록 유지하고 추가로 결합\n- [취소/아니오]: 기존 목록을 모두 비우고 이 ${newExtractedCandidates.length}명으로 완전 대체`)) {
          setCandidates(prev => [...prev, ...newExtractedCandidates]);
          setCandidateCount(prev => prev + newExtractedCandidates.length);
        } else {
          setCandidates(newExtractedCandidates);
          setCandidateCount(newExtractedCandidates.length);
        }
      }
    } catch (err: any) {
      console.error("Batch parse error:", err);
      alert("배치 PDF 파일 처리 중 오류가 발생하였습니다: " + err.message);
    } finally {
      setBatchExtracting(false);
    }
  };

  // 로컬에서 모의 계산과 신뢰도 계수 매치, 정렬, 동점 타이브레이커, 근접군 정밀 연산 실행
  const processCalculations = (rawEvaluations: CandidateEvaluation[]): FinalCandidateResult[] => {
    const list: FinalCandidateResult[] = rawEvaluations.map(raw => {
      // 1. 1차 원점수 원치 기준점 연산 (100점 만점 척도)
      // firstStage 내의 competency(직무전문성), admin(행정실무), networking(구인개척)
      // 각 내부 배점 프로파일 비율로 100점 척도 가중합
      const firstProfile = firstStageConfig;
      const firstSumParts = 
        (raw.scores.firstStage.competency * (firstProfile.weightCompetency / 100)) +
        (raw.scores.firstStage.admin * (firstProfile.weightAdmin / 100)) +
        (raw.scores.firstStage.networking * (firstProfile.weightNetworking / 100));
      
      const firstStageRawTotal = Number(firstSumParts.toFixed(1));

      // 2. 2차 원점수 원치 기준점 연산 (100점 만점 척도)
      const secondProfile = secondStageConfig;
      const secondSumParts = 
        (raw.scores.secondStage.civilComplaint * (secondProfile.weightCivilComplaint / 100)) +
        (raw.scores.secondStage.collaborationOrLeadership * (secondProfile.weightCollaborationOrLeadership / 100));
      
      const secondStageRawTotal = Number(secondSumParts.toFixed(1));

      // 3. 신뢰도 계수 적용 (조정 조직적합도)
      const confidenceStr = raw.overallConfidence || "중";
      const scaleCoef = CONFIDENCE_COEFFICIENTS[confidenceStr] ?? 1.00;
      const adjustedSecondStageTotal = Number(Math.min(100, secondStageRawTotal * scaleCoef).toFixed(1));

      // 4. 최종 종합점수 산정 (종합 가중치 비율 반영)
      // finalScore = (1차 직무수행 역량 * A) + (조정 조직적합도 * B) (A:B 비율 % 반영)
      const finalVal = (firstStageRawTotal * (weightFirstRatio / 100)) + (adjustedSecondStageTotal * (weightSecondRatio / 100));
      const finalScore = Number(finalVal.toFixed(1));

      return {
        ...raw,
        firstStageRawTotal,
        secondStageRawTotal,
        secondStageScaleCoef: scaleCoef,
        adjustedSecondStageTotal,
        finalScore,
        rank: 1 // Default
      };
    });

    // 5. 정렬 및 '동점 처리 규칙(Tie-break) v2' 구현
    // * 상담직 예외: 조정 조직적합도 높은 순 -> 2차 민원응대 카테고리 높은 순 -> 1차 직무수행 역량 높은 순
    // * 기타/기본/팀장/행정원: 1차 직무수행 역량 높은 순 -> 1차 직무전문성 높은 순 -> 조정 조직적합도 높은 순
    const sortedList = [...list].sort((a, b) => {
      // 0. 종합점수 비례
      if (b.finalScore !== a.finalScore) {
        return b.finalScore - a.finalScore;
      }

      if (jobType === "상담직") {
        // 상담직 타이브레이커
        if (b.adjustedSecondStageTotal !== a.adjustedSecondStageTotal) {
          return b.adjustedSecondStageTotal - a.adjustedSecondStageTotal;
        }
        if (b.scores.secondStage.civilComplaint !== a.scores.secondStage.civilComplaint) {
          return b.scores.secondStage.civilComplaint - a.scores.secondStage.civilComplaint;
        }
        return b.firstStageRawTotal - a.firstStageRawTotal;
      } else {
        // 일반 및 기타 타이브레이커
        if (b.firstStageRawTotal !== a.firstStageRawTotal) {
          return b.firstStageRawTotal - a.firstStageRawTotal;
        }
        if (b.scores.firstStage.competency !== a.scores.firstStage.competency) {
          return b.scores.firstStage.competency - a.scores.firstStage.competency;
        }
        return b.adjustedSecondStageTotal - a.adjustedSecondStageTotal;
      }
    });

    // 6. 랭킹 부여
    sortedList.forEach((item, index) => {
      item.rank = index + 1;
    });

    // 7. '근접(±0.5) 처리 규칙' 구현
    // 군 내 최대-최소 종합점수 <= 0.5인 인접 후보자들을 근접군으로 결정.
    // 랭킹 순위는 그대로 유지하며, 표시 역전을 생산하지 않고 ▢A, ▢B, ▢C 기호를 매핑.
    let currentGroupCode = "A";
    const mappedIdsInGroups = new Set<string>();

    for (let i = 0; i < sortedList.length; i++) {
      if (mappedIdsInGroups.has(sortedList[i].maskedName)) continue;

      const currentGroup: FinalCandidateResult[] = [sortedList[i]];
      
      // 이어지는 후보자 확인하여 차의 최대치가 0.5 이하인 영역을 묶음
      for (let j = i + 1; j < sortedList.length; j++) {
        const checkCandidate = sortedList[j];
        // 군 최고 점수(기본 정렬에 따라 sortedList[i]가 가장 높음)와 checkCandidate 점수의 격차 검증
        const scoreDiff = Math.abs(sortedList[i].finalScore - checkCandidate.finalScore);
        if (scoreDiff <= 0.5) {
          currentGroup.push(checkCandidate);
        } else {
          break; // 점수 범위를 넘어서면 군집화 중단
        }
      }

      // 그룹의 단원이 2명 이상인 경우 근접군 확정 및 군집코드 설정
      if (currentGroup.length >= 2) {
        const symbol = `▢${currentGroupCode}`;
        currentGroup.forEach(candidate => {
          candidate.nearTieGroup = symbol;
          mappedIdsInGroups.add(candidate.maskedName);
        });
        // 다음 알파벳 문자로 스케일업
        currentGroupCode = String.fromCharCode(currentGroupCode.charCodeAt(0) + 1);
      }
    }

    return sortedList;
  };

  // 분석 API 호출 핸들러
  const handleStartAnalysis = async () => {
    // 유효성 심사
    const emptyDocs = candidates.filter(c => !c.documentText || c.documentText.trim() === "");
    if (emptyDocs.length > 0) {
      alert(`[오류] 지원자 중 '${emptyDocs.map(c => c.name).join(", ")}'의 서류 텍스트가 비어있습니다. 구인 서류를 입력하거나 불러와주세요.`);
      return;
    }

    setLoading(true);
    setLoadingMessage("여성새로일하기센터 인사 기준 데이터 취합 중...");

    try {
      setLoadingMessage("서버의 Gemini AI 엔진을 통해 경력 정보 근거 확인 및 신뢰도 마스킹 분석을 실시간 수행 중...");
      
      const payload = {
        centerInfo,
        jobType,
        targetJobName,
        firstStageConfig,
        secondStageConfig,
        candidates
      };

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "서버 응답 오류가 발생했습니다.");
      }

      const body = await response.json();
      
      if (body.success && Array.isArray(body.evaluations)) {
        setLoadingMessage("분석 완료! 조정 가중 및 정렬 타이브레이크 계산 규칙 적용 중...");
        
        // 데이터 정제 및 랭킹 정렬
        const processed = processCalculations(body.evaluations);
        setAnalysisResults(processed);
        setSelectedCandidateIndex(0); // 1등 후보 카드 기본 상세 표기
        
        // 1:1 비교를 위한 초기 두 후보자 자동 선택
        if (processed.length >= 2) {
          setCompareCandidateAName(processed[0].maskedName);
          setCompareCandidateBName(processed[1].maskedName);
        } else if (processed.length === 1) {
          setCompareCandidateAName(processed[0].maskedName);
          setCompareCandidateBName("");
        } else {
          setCompareCandidateAName("");
          setCompareCandidateBName("");
        }

        setCurrentStep(6); // 결과 대시보드 화면으로 이동
      } else {
        throw new Error("분석한 결과 형식이 유효하지 않습니다.");
      }
    } catch (err: any) {
      console.error(err);
      alert(`[분석 실패] ${err.message || "알 수 없는 연결상태 불량 또는 API 오류입니다."}`);
    } finally {
      setLoading(false);
    }
  };

  // 인젝트 리셋 핸들러
  const handleReset = () => {
    if (confirm("정말로 모든 단계를 초기화하고 처음부터 다시 입력하시겠습니까?")) {
      setAnalysisResults([]);
      setSelectedCandidateIndex(null);
      setCompareCandidateAName("");
      setCompareCandidateBName("");
      setCurrentStep(1);
      applySampleTemplate("상담직");
    }
  };

  // 📝 채용 분석 보고서 텍스트(TXT) 다운로드 핸들러
  const handleDownloadTxt = () => {
    let content = `==================================================\n`;
    content += `   새일센터 AI HR 역량 심사 보고서 (RECRUITMENT REPORT)\n`;
    content += `==================================================\n\n`;
    content += `■ 평가 기관: ${centerInfo.regionName || "자체"}새일센터 (${centerInfo.centerName || "자체센터"})\n`;
    content += `■ 선택 직무: ${WEIGHT_PROFILES[jobType]?.title || jobType}\n`;
    content += `■ 전형별 비율 반영: 1차 역량 (${weightFirstRatio}%) : 2차 적합도 (${weightSecondRatio}%)\n`;
    content += `■ 보고서 생성 시각: ${new Date().toLocaleString()}\n\n`;
    content += `--------------------------------------------------\n`;
    content += `   1. 채용 종합 우선 순위 결과 (TOP RANKINGS)\n`;
    content += `--------------------------------------------------\n`;
    
    analysisResults.forEach((cand, idx) => {
      content += `${idx + 1}위: [${cand.maskedName}] - 종합 ${cand.finalScore}점 (등급: ${cand.overallConfidence})\n`;
      content += `   * 한줄평: ${cand.oneLineReview}\n`;
    });
    content += `\n`;

    content += `--------------------------------------------------\n`;
    content += `   2. 지원자별 정밀 세부 분석 데이터\n`;
    content += `--------------------------------------------------\n\n`;

    analysisResults.forEach((cand, idx) => {
      content += `■ [${idx + 1}위] 지원자: ${cand.maskedName}\n`;
      content += `  - 종합 평점: ${cand.finalScore} / 100\n`;
      content += `  - 정성 신뢰도 수준: ${cand.overallConfidence}\n`;
      content += `  - 한줄 요약평: "${cand.oneLineReview}"\n\n`;
      content += `  [1차 직무수행 역량 평가 (원점수: ${cand.firstStageRawTotal} / 반영환산점수: ${(cand.firstStageRawTotal * (weightFirstRatio / 100)).toFixed(1)}점)]\n`;
      content += `    - (a) 직무 전문성 및 자격증: ${cand.scores.firstStage.competency}점\n`;
      content += `      └근거: ${cand.scores.firstStage.competencyEvidence}\n`;
      content += `    - (b) 행정 실무 역량: ${cand.scores.firstStage.admin}점\n`;
      content += `      └근거: ${cand.scores.firstStage.adminEvidence}\n`;
      content += `    - (c) 구인처 개척 및 네트워킹: ${cand.scores.firstStage.networking}점\n`;
      content += `      └근거: ${cand.scores.firstStage.networkingEvidence}\n\n`;
      content += `  [2차 조직적합도 평가 (원점수 총합: ${cand.secondStageRawTotal}점 / 신뢰도 반영점수: ${cand.adjustedSecondStageTotal}점)]\n`;
      content += `    - (a) 공감력 및 민원 응대: ${cand.scores.secondStage.civilComplaint}점 (과장/과소 편향 신뢰도: ${cand.scores.secondStage.civilComplaintConfidence})\n`;
      content += `      └근거: ${cand.scores.secondStage.civilComplaintEvidence}\n`;
      content += `    - (b) 가치관 및 동료 협업: ${cand.scores.secondStage.collaborationOrLeadership}점 (과장/과소 편향 신뢰도: ${cand.scores.secondStage.collaborationOrLeadershipConfidence})\n`;
      content += `      └근거: ${cand.scores.secondStage.collaborationOrLeadershipEvidence}\n\n`;
      content += `  [정성적 강점 및 보완 우려사항]\n`;
      content += `    - 핵심 직무 소양 강점: ${cand.strengthsAndWeaknesses.strength}\n`;
      content += `    - 우려 및 보완 필요성: ${cand.strengthsAndWeaknesses.weakness}\n`;
      content += `--------------------------------------------------\n\n`;
    });

    content += `본 보고서는 Saeil HR Specialist v2 인공지능 분석 가중 감점 모델에 기초하여 계량된 평가 보고서입니다.\n`;
    content += `최종 채용 의사결정 시 면접 전형 등 실합격 기준과 종합적으로 비교 검토할 것을 권장합니다.\n`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `새일센터_채용_우선순위_리포트_${centerInfo.centerName || "종합"}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 📄 채용 분석 결과서 PDF 다운로드 및 인쇄용 팝업 창 핸들러
  const handlePrintPdf = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("인쇄 전용 창을 시작하지 못했습니다. 브라우저 팝업 차단이 설정되어 있는지 확인해 주십시오.");
      return;
    }

    const listRows = analysisResults.map((cand, idx) => `
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: bold;">${idx + 1}위</td>
        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">${cand.maskedName}</td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-family: monospace; font-weight: bold; color: #0d9488;">${cand.finalScore}점</td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-size: 11px;">${cand.overallConfidence}</td>
        <td style="padding: 10px; border: 1px solid #ddd; font-size: 11px; color: #555;">${cand.oneLineReview}</td>
      </tr>
    `).join("");

    const detailsCards = analysisResults.map((cand, idx) => `
      <div style="page-break-inside: avoid; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; margin-bottom: 25px; background: #fff; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f766e; padding-bottom: 10px; margin-bottom: 15px;">
          <span style="font-size: 16px; font-weight: 900; color: #0f766e;">[${idx + 1}위] ${cand.maskedName}</span>
          <span style="font-size: 15px; font-weight: bold; font-family: monospace; color: #0f766e;">종합평가치: ${cand.finalScore} / 100점</span>
        </div>

        <div style="font-size: 12px; margin-bottom: 15px; background-color: #f0fdfa; padding: 10px 15px; border-radius: 8px; border-left: 4px solid #0d9488; font-style: italic;">
          &ldquo;${cand.oneLineReview}&rdquo;
        </div>

        <div style="margin-bottom: 15px;">
          <h4 style="font-size: 13px; font-weight: bold; margin: 0 0 8px 0; color: #1e293b; border-bottom: 1px dashed #cbd5e1; padding-bottom: 4px;">🎯 1차 직무수행 역량 평가 (가중치 ${weightFirstRatio}%)</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 8px;">
            <tr style="background: #f8fafc;">
              <th style="padding: 6px; border: 1px solid #e2e8f0; width: 30%; text-align: left;">평가 세부 지표</th>
              <th style="padding: 6px; border: 1px solid #e2e8f0; width: 15%; text-align: center;">취득 점수</th>
              <th style="padding: 6px; border: 1px solid #e2e8f0; width: 55%; text-align: left;">선발 판단 세부 증빙/근거</th>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #e2e8f0; font-weight: bold;">(a) 직무 전문성 및 자격증</td>
              <td style="padding: 6px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold;">${cand.scores.firstStage.competency} / 100</td>
              <td style="padding: 6px; border: 1px solid #e2e8f0; color: #475569;">${cand.scores.firstStage.competencyEvidence}</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #e2e8f0; font-weight: bold;">(b) 행정 실무 역량</td>
              <td style="padding: 6px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold;">${cand.scores.firstStage.admin} / 100</td>
              <td style="padding: 6px; border: 1px solid #e2e8f0; color: #475569;">${cand.scores.firstStage.adminEvidence}</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #e2e8f0; font-weight: bold;">(c) 구인처 개척 및 네트워킹</td>
              <td style="padding: 6px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold;">${cand.scores.firstStage.networking} / 100</td>
              <td style="padding: 6px; border: 1px solid #e2e8f0; color: #475569;">${cand.scores.firstStage.networkingEvidence}</td>
            </tr>
          </table>
          <div style="font-size: 11px; text-align: right; color: #64748b;">1차 직무 원점수 합산: <b>${cand.firstStageRawTotal}점</b></div>
        </div>

        <div style="margin-bottom: 15px;">
          <h4 style="font-size: 13px; font-weight: bold; margin: 15px 0 8px 0; color: #1e293b; border-bottom: 1px dashed #cbd5e1; padding-bottom: 4px;">🤝 2차 조직적합도 평가 (가중치 ${weightSecondRatio}% - 감점 규칙 반영)</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 8px;">
            <tr style="background: #f8fafc;">
              <th style="padding: 6px; border: 1px solid #e2e8f0; width: 30%; text-align: left;">평가 세부 지표</th>
              <th style="padding: 6px; border: 1px solid #e2e8f0; width: 15%; text-align: center;">원점수</th>
              <th style="padding: 6px; border: 1px solid #e2e8f0; width: 15%; text-align: center;">신뢰수준</th>
              <th style="padding: 6px; border: 1px solid #e2e8f0; width: 40%; text-align: left;">특이 편향 검증 판별 증빙 및 의견</th>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #e2e8f0; font-weight: bold;">(a) 공감력 및 민원 응대</td>
              <td style="padding: 6px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold;">${cand.scores.secondStage.civilComplaint} / 100</td>
              <td style="padding: 6px; border: 1px solid #e2e8f0; text-align: center;">${cand.scores.secondStage.civilComplaintConfidence}</td>
              <td style="padding: 6px; border: 1px solid #e2e8f0; color: #475569;">${cand.scores.secondStage.civilComplaintEvidence}</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #e2e8f0; font-weight: bold;">(b) 가치관 및 협업/리더십</td>
              <td style="padding: 6px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold;">${cand.scores.secondStage.collaborationOrLeadership} / 100</td>
              <td style="padding: 6px; border: 1px solid #e2e8f0; text-align: center;">${cand.scores.secondStage.collaborationOrLeadershipConfidence}</td>
              <td style="padding: 6px; border: 1px solid #e2e8f0; color: #475569;">${cand.scores.secondStage.collaborationOrLeadershipEvidence}</td>
            </tr>
          </table>
          <div style="font-size: 11px; display: flex; justify-content: space-between; color: #64748b;">
            <span>정성 신뢰도 수준 등급: <b>${cand.overallConfidence}</b></span>
            <span>원점수 합산: ${cand.secondStageRawTotal}점 ➜ 조정 반영점수: <b>${cand.adjustedSecondStageTotal}점</b></span>
          </div>
        </div>

        <div style="margin-top: 15px; display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div style="background: #fdfdf6; border: 1px solid #fef3c7; padding: 12px; border-radius: 8px;">
            <strong style="color: #b45309; font-size: 11px; display: block; margin-bottom: 4px;">➕ 핵심 직무 역량 강점 (Strength)</strong>
            <p style="font-size: 11px; margin: 0; line-height: 1.5; color: #78350f;">${cand.strengthsAndWeaknesses.strength}</p>
          </div>
          <div style="background: #fdf2f2; border: 1px solid #fee2e2; padding: 12px; border-radius: 8px;">
            <strong style="color: #b91c1c; font-size: 11px; display: block; margin-bottom: 4px;">⚠️ 우려 및 보완 필요 항목 (Weakness)</strong>
            <p style="font-size: 11px; margin: 0; line-height: 1.5; color: #991b1b;">${cand.strengthsAndWeaknesses.weakness}</p>
          </div>
        </div>
      </div>
    `).join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>새일센터 AI HR 역량 심사 보고서 - ${centerInfo.regionName || ""}새일센터</title>
        <style>
          body {
            font-family: 'Malgun Gothic', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
            color: #1e293b;
            line-height: 1.6;
            margin: 40px auto;
            max-width: 900px;
            padding: 0 20px;
            background-color: #f8fafc;
          }
          h1, h2, h3, h4 {
            margin-top: 0;
            color: #0f172a;
          }
          .header-box {
            border: 3px double #0f766e;
            padding: 20px 30px;
            border-radius: 12px;
            background: #ffffff;
            margin-bottom: 30px;
            text-align: center;
          }
          .meta-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            margin-top: 15px;
          }
          .meta-table th, .meta-table td {
            border: 1px solid #cbd5e1;
            padding: 8px 12px;
          }
          .meta-table th {
            background-color: #f1f5f9;
            font-weight: bold;
            text-align: left;
            width: 25%;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #0f172a;
            border-left: 6px solid #0f766e;
            padding-left: 10px;
            margin: 35px 0 15px 0;
            text-transform: uppercase;
          }
          .main-ranking-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            background: white;
            margin-bottom: 30px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }
          .main-ranking-table th {
            background-color: #0f766e;
            color: white;
            font-weight: bold;
            padding: 12px 10px;
            text-align: left;
          }
          .main-ranking-table td {
            border-bottom: 1px solid #e2e8f0;
            padding: 10px;
          }
          .footer-note {
            margin-top: 40px;
            border-top: 1px solid #cbd5e1;
            padding-top: 15px;
            font-size: 11px;
            color: #64748b;
            text-align: center;
            line-height: 1.5;
          }
          @media print {
            body {
              background-color: #fff;
              margin: 20px;
              font-size: 11px;
            }
            .no-print {
              display: none !important;
            }
            .header-box {
              border: 2px solid #000;
              border-radius: 0;
              box-shadow: none;
              background: #fff;
            }
            .main-ranking-table th {
              background-color: #cbd5e1 !important;
              color: #000 !important;
              border: 1px solid #cbd5e1 !important;
            }
            .main-ranking-table td {
              border: 1px solid #cbd5e1 !important;
            }
            .meta-table th, .meta-table td {
              border: 1px solid #cbd5e1 !important;
            }
            .section-title {
              border-left: 4px solid #0f766e !important;
            }
            .details-card {
              border: 1px solid #cbd5e1 !important;
              box-shadow: none !important;
              border-radius: 0 !important;
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="text-align: right; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px;">
          <span style="font-size: 13px; color: #475569;">💡 인쇄 대상 장치를 <b>[PDF로 저장]</b>으로 선택하면 고화질 PDF 파일로 내려받을 수 있습니다.</span>
          <div>
            <button onclick="window.print();" style="background-color: #0f766e; color: white; border: none; padding: 10px 20px; font-size: 13px; font-weight: bold; border-radius: 6px; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); transition: all 0.2s;">
              🖨️ PDF 다운로드 / 인쇄하기
            </button>
            <button onclick="window.close();" style="background-color: #64748b; color: white; border: none; padding: 10px 15px; font-size: 13px; font-weight: bold; border-radius: 6px; cursor: pointer; margin-left: 8px;">
              닫기
            </button>
          </div>
        </div>

        <div class="header-box">
          <h1 style="font-size: 22px; margin-bottom: 5px; color: #0f766e; letter-spacing: -0.5px;">새일센터 인공지능 HR 역량 종합 심사 보고서</h1>
          <p style="font-size: 12px; color: #64748b; margin: 0;">AI Powered Smart HR Evaluation & Performance Report</p>
          
          <table class="meta-table">
            <tr>
              <th>평가 시행 기관</th>
              <td>${centerInfo.regionName || "자체"}여성새일센터 (${centerInfo.centerName || "자체센터"})</td>
              <th>심사 대상 직무</th>
              <td>${WEIGHT_PROFILES[jobType]?.title || jobType}</td>
            </tr>
            <tr>
              <th>1차 직무 반영 비중</th>
              <td>${weightFirstRatio}%</td>
              <th>2차 조직적합도 반영 비중</th>
              <td>${weightSecondRatio}% (정성 신뢰 수준 가중 감정 규칙 적용)</td>
            </tr>
            <tr>
              <th>보고서 생성 일자</th>
              <td colspan="3">${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}</td>
            </tr>
          </table>
        </div>

        <div class="section-title">1. 채용 종합 우선 순위 결과</div>
        <table class="main-ranking-table">
          <thead>
            <tr>
              <th style="width: 10%; text-align: center;">추천순위</th>
              <th style="width: 20%;">지원자 성명 (가명화)</th>
              <th style="width: 15%; text-align: center;">최종 환산 총점</th>
              <th style="width: 15%; text-align: center;">신뢰도 조견 등급</th>
              <th style="width: 40%;">주요 한줄 요약평</th>
            </tr>
          </thead>
          <tbody>
            ${listRows}
          </tbody>
        </table>

        <div class="section-title">2. 지원자별 정밀 세부 심사 리포트</div>
        ${detailsCards}

        <div class="footer-note">
          본 심사 보고서의 결과 데이터는 새일센터 직무특수성에 정밀 최적화된 Saeil HR Specialist v2 가중 감점 알고리즘 모델을 기준으로 산정되었습니다.<br>
          감점 요인(신뢰도 하, 불충분 등급)은 AI 전형 프로세스에 의거하여 투명하게 계산되었으며, 채용 최종합위는 채용위원회의 실면접 점수와 종합하여 합해 결정하시기를 권장합니다.<br>
          <strong>발행인: ${centerInfo.regionName || "자체"}여성새일센터 채용심사위원회</strong>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // 1칸당 10점의 막대 시각화 유틸리티 (실제 지침 차트의 ■ 유도)

  const renderSquareBlocks = (score: number) => {
    const blockCount = Math.min(10, Math.max(0, Math.round(score / 10)));
    const activeBlocks = "■".repeat(blockCount);
    const inactiveBlocks = "□".repeat(10 - blockCount);
    return `${activeBlocks}${inactiveBlocks}`;
  };

  // 근접군 연합 문자열 안내 구축 유틸리티 (기타 상담원 우위 검토 추천 주석 자동 생성)
  const getNearTieGroupInstruction = (groupSymbol: string) => {
    const unionCandidates = analysisResults.filter(c => c.nearTieGroup === groupSymbol);
    const names = unionCandidates.map(c => c.maskedName).join("·");
    
    // 이 군에서 2차 조정 조직적합도가 가장 우수한 후보 찾기
    const sortedBySecond = [...unionCandidates].sort((a, b) => b.adjustedSecondStageTotal - a.adjustedSecondStageTotal);
    const bestSecondCandidate = sortedBySecond[0];
    
    const maxScore = Math.max(...unionCandidates.map(c => c.finalScore));
    const minScore = Math.min(...unionCandidates.map(c => c.finalScore));
    const gap = Number(Math.abs(maxScore - minScore).toFixed(1));

    if (jobType === "상담직" && bestSecondCandidate) {
      return `${groupSymbol} ${names}은 ${gap}점 차 근접군 — 상담직 기준 조직적합도 우위 후보인 ${bestSecondCandidate.maskedName}을 우선 면접·검토 권장하며, 최종 순위는 면접을 통해 확정해 주십시오.`;
    } else {
      return `${groupSymbol} ${names}은 ${gap}점 차 근접군 — 종합 능력이 근접하므로 개별 역량(경하/보조금 실무)의 세부 보완점 확인 질문을 바탕으로 면접 확인 후 확정하십시오.`;
    }
  };

  // 1:1 비교용 지표 행 렌더링 헬퍼 함수
  const renderComparisonRow = (
    label: string,
    category: "score" | "text",
    valA: number | string,
    valB: number | string,
    evidenceA?: string,
    evidenceB?: string,
    isHigherBetter: boolean = true
  ) => {
    if (category === "score") {
      const numA = typeof valA === "number" ? valA : Number(valA) || 0;
      const numB = typeof valB === "number" ? valB : Number(valB) || 0;
      const isTie = numA === numB;
      const isAWinner = isHigherBetter ? numA > numB : numA < numB;
      const isBWinner = isHigherBetter ? numB > numA : numB < numA;

      return (
        <tr className="hover:bg-white/[0.02] transition-colors border-b border-white/5 last:border-b-0">
          <td className="p-3 font-semibold text-slate-350 bg-slate-900/30 align-top border-r border-white/5 text-xs w-[180px]">
            {label}
          </td>
          <td className={`p-3 align-top border-r border-white/5 text-xs ${isAWinner && !isTie ? "bg-emerald-500/5 text-emerald-400 font-medium" : "text-slate-300"}`}>
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-mono text-sm font-black">
                {valA}
                {typeof valA === "number" && <span className="text-[10px] text-slate-500 font-normal"> / 100</span>}
              </span>
              {isAWinner && !isTie && (
                <span className="text-[9px] bg-emerald-500 text-slate-950 font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow-sm">
                  우수
                </span>
              )}
            </div>
            {evidenceA && (
              <p className="text-[10.5px] text-slate-400/90 leading-relaxed mt-0.5">• {evidenceA}</p>
            )}
          </td>
          <td className={`p-3 align-top text-xs ${isBWinner && !isTie ? "bg-emerald-500/5 text-emerald-400 font-medium" : "text-slate-300"}`}>
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-mono text-sm font-black">
                {valB}
                {typeof valB === "number" && <span className="text-[10px] text-slate-500 font-normal"> / 100</span>}
              </span>
              {isBWinner && !isTie && (
                <span className="text-[9px] bg-emerald-500 text-slate-950 font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow-sm">
                  우수
                </span>
              )}
            </div>
            {evidenceB && (
              <p className="text-[10.5px] text-slate-400/90 leading-relaxed mt-0.5">• {evidenceB}</p>
            )}
          </td>
         </tr>
      );
    } else {
      return (
        <tr className="hover:bg-white/[0.02] transition-colors border-b border-white/5 last:border-b-0">
          <td className="p-3 font-semibold text-slate-350 bg-slate-900/30 align-top border-r border-white/5 text-xs w-[180px]">
            {label}
          </td>
          <td className="p-3 text-slate-300 align-top border-r border-white/5 text-[11px] leading-relaxed">
            {valA}
          </td>
          <td className="p-3 text-slate-300 align-top text-[11px] leading-relaxed">
            {valB}
          </td>
        </tr>
      );
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-700 flex items-center justify-center p-4 md:p-8 font-sans antialiased overflow-x-hidden selection:bg-blue-500 selection:text-white relative">
      {/* Background Ambience Deco */}
      <div className="absolute top-10 left-1/3 w-96 h-96 bg-blue-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-sky-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-10 w-72 h-72 bg-indigo-450/5 rounded-full blur-[100px] pointer-events-none" />
 
      {/* Frame Boundary */}
      <div className="w-full max-w-7xl rounded-3xl border border-blue-200/60 bg-white/95 backdrop-blur-md shadow-[0_25px_60px_rgba(37,99,235,0.12)] overflow-hidden flex flex-col min-h-[780px] transition-all duration-300">
        
        {/* Header bar - Only visible on setup & report steps */}
        {currentStep > 0 && (
          <header className="p-6 md:p-8 border-b border-blue-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/10 rounded-2xl shadow-lg ring-1 ring-white/20">
                <Sparkles className="w-6 h-6 text-yellow-300 font-bold" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-black tracking-widest text-sky-100 bg-white/15 px-2.5 py-0.5 rounded-full border border-white/20">Saeil v2 HR Engine</span>
                  <span className="text-[10px] text-blue-100/70 font-mono tracking-tighter">CONFIDENCE_WEIGHT_RULES_ENABLED</span>
                </div>
                <h1 id="main-header" className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2 mt-1">
                  여성새로일하기센터자체 직원 채용 분석 대시보드
                </h1>
              </div>
            </div>
 
            <div className="flex items-center gap-2 self-stretch md:self-auto">
              {currentStep < 6 ? (
                <span className="px-3.5 py-1.5 bg-white/10 border border-white/20 rounded-full text-xs font-bold text-sky-100">
                  인터뷰 모드: <span className="text-white font-extrabold">{currentStep}단계</span> / 5단계
                </span>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    className="px-4 py-1.5 bg-slate-900/40 hover:bg-slate-900/60 border border-white/20 rounded-full text-xs font-bold text-slate-100 transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-sky-300 animate-spin-reverse" />
                    처음부터 다시하기
                  </button>
                  <span className="px-3.5 py-1.5 bg-emerald-450 border border-emerald-400 text-white rounded-full text-xs font-bold shadow-sm">
                    분석 리포트 완료
                  </span>
                </div>
              )}
            </div>
          </header>
        )}

        {/* Steps Guide Progress Indicator (Only on steps 1 to 5) */}
        {currentStep > 0 && currentStep < 6 && (
          <div className="bg-[#f8fafc] border-b border-blue-100 px-6 py-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 text-[10.5px] text-slate-400 font-bold overflow-x-auto scrollbar-none py-1">
              {[
                { step: 1, label: "기본 설정" },
                { step: 2, label: "1차 직무설정" },
                { step: 3, label: "2차 조직적합도" },
                { step: 4, label: "지원 서류 기입" },
                { step: 5, label: "AI 매칭 분석" }
              ].map((item) => {
                const isActive = currentStep === item.step;
                const isPassed = currentStep > item.step;
                return (
                  <div key={item.step} className="flex items-center gap-2 shrink-0 transition-colors duration-200">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[9px] font-black border transition-all duration-305 ${
                      isActive 
                        ? "bg-blue-600 border-blue-600 text-white shadow-sm scale-110" 
                        : isPassed 
                          ? "bg-blue-100 border-blue-200 text-blue-600" 
                          : "bg-slate-50 border-slate-200/80 text-slate-400"
                    }`}>
                      {isPassed ? "✓" : item.step}
                    </span>
                    <span className={`transition-colors duration-205 ${isActive ? "text-blue-700 font-extrabold" : isPassed ? "text-[#1e293b]" : "text-slate-400"}`}>
                      {item.label}
                    </span>
                    {item.step < 5 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Workspace Body */}
        <div className="flex-1 flex flex-col p-6 md:p-8">
          
          {/* PROFILE ALERTS IN 1st STEP */}
          {showProfileAlert && pendingJobType && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in shadow-sm">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black text-amber-900">직무가 변경되었습니다: [{pendingJobType}] 가중치 프로필 세팅</h4>
                  <p className="text-[11px] text-amber-700 font-semibold leading-relaxed">
                    선택하신 직무에 최적화된 여성새일센터 표준 가중치 및 세부 평가 배점 템플릿이 구성되었습니다. 지금 적용하시겠습니까?
                  </p>
                </div>
              </div>
              <div className="flex gap-2 self-end sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setShowProfileAlert(false)}
                  className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-250 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  보류
                </button>
                <button
                  type="button"
                  onClick={confirmApplyProfile}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <span>가중치 프로필 적용</span>
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* 0단계. 프리미엄 랜딩 페이지 (여성새일센터 전용 Smart AI HR) */}
          {currentStep === 0 && (
            <div className="space-y-16 py-4 animate-fade-in">
              
              {/* BRAND HERO SECTION */}
              <div className="relative rounded-3xl overflow-hidden border-0 bg-gradient-to-tr from-[#1e40af] via-[#2563eb] to-[#0ea5e9] p-8 md:p-12 shadow-[0_20px_50px_rgba(37,99,235,0.22)] text-white animate-fade-in">
                {/* Visual Glassmorphism Shapes */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-sky-400/20 rounded-full blur-[80px] pointer-events-none" />
                
                <div className="relative z-10 max-w-3xl space-y-6">
                  <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-full border border-white/20 text-xs font-bold text-sky-100 shadow-sm backdrop-blur-sm">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                    <span>전국 여성새로일하기센터 실무 특화 보증형 채용 시스템</span>
                  </div>
                  
                  <div className="space-y-3">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight md:leading-none text-white">
                      새일의 내일을 위한 <br className="hidden sm:inline" />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-200">Smart AI HR 분석 파트너</span>
                    </h2>
                    <p className="text-sm md:text-base text-sky-100 leading-relaxed font-semibold max-w-2xl">
                      지역 사회 및 경력단절 여성의 특성을 완벽히 조화시키는 인재 매칭 엔진. 복잡한 수기 점수 산출과 편향 걱정 없이, 1차 직무 수행성과 2차 조직 융합 및 정성 분석 가중 보정을 거쳐 최고의 우수 리포트를 제공합니다.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-3.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-6 py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs sm:text-sm tracking-tight transition-all shadow-[0_4px_15px_rgba(245,158,11,0.35)] flex items-center gap-2 active:scale-95 hover:-translate-y-0.5 cursor-pointer"
                    >
                      <span>신규 채용 평가 시뮬레이션 시작하기</span>
                      <ArrowRight className="w-4 h-4 text-slate-950" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applySampleTemplate("상담직")}
                      className="px-5 py-3.5 bg-white/10 hover:bg-white/15 border border-white/25 text-white font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center gap-1.5 backdrop-blur-sm hover:border-white/40 cursor-pointer"
                    >
                      <span>상담직 데모 데이터 로드</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* THREE CORE ADVANTAGES */}
              <div className="space-y-6">
                <div className="text-center space-y-1 max-w-xl mx-auto">
                  <span className="text-xs font-black text-blue-600 tracking-widest uppercase">CORE VALUES</span>
                  <h3 className="text-2xl font-bold text-[#0f172a]">새일 채용 분석기의 3대 핵심 가치</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">경력단절 예방과 경제활동 참여율 증대를 위한 가장 과학적이고 신뢰할 수 있는 전형 방식</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* 카드 1 */}
                  <div className="bg-[#f8fafc] border border-slate-200 hover:border-blue-250 rounded-2xl p-6 transition-all hover:bg-blue-50/40 shadow-[0_4px_20px_rgba(0,0,0,0.01)] group">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-105 rounded-xl group-hover:bg-blue-200 transition-all">
                        <Award className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="space-y-1.5">
                        <h5 className="text-base font-bold text-[#0f172a] group-hover:text-blue-600 transition-colors">여성새일센터 운영 지침 표준화</h5>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          여성가족부 및 고용노동부의 지역 센터 종합 평가지표 및 세부 업무 요령에 맞추어, 직업 상담사의 기획·알선 역량과 행정원의 보조금 정산 역량을 입체적으로 자동 배점 및 다차원 분류.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 카드 2 */}
                  <div className="bg-[#f8fafc] border border-slate-200 hover:border-blue-250 rounded-2xl p-6 transition-all hover:bg-blue-50/40 shadow-[0_4px_20px_rgba(0,0,0,0.01)] group">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-105 rounded-xl group-hover:bg-blue-200 transition-all">
                        <Scale className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="space-y-1.5">
                        <h5 className="text-base font-bold text-[#0f172a] group-hover:text-blue-600 transition-colors">정성 편향 검증(Bias Filtering) 감점 알고리즘</h5>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          서류상의 과대포장이나 수동적 서술 편향을 인공지능이 분석하여 '상/중/하/불충분' 신뢰 수준 등급으로 분류하고, 이를 2차 조직적합도 점수에 가중 감점(예: 하 등급 시 15% 감점)하여 원점수 보정.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 카드 3 */}
                  <div className="bg-[#f8fafc] border border-slate-200 hover:border-blue-250 rounded-2xl p-6 transition-all hover:bg-blue-50/40 shadow-[0_4px_20px_rgba(0,0,0,0.01)] group">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-105 rounded-xl group-hover:bg-blue-200 transition-all">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="space-y-1.5">
                        <h5 className="text-base font-bold text-[#0f172a] group-hover:text-blue-600 transition-colors">원클릭 AI 서술형 평정 리포트</h5>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          각 지원자의 서류 텍스트를 원스톱 분석하여 평가 우선순위 등수 배열은 물론, 1차 및 2차의 다차원 원점수/환산점수 취득 점수와 선발 판단 세부 증빙 근거가 포함된 AI 한줄 종합평 및 강약점 추천 자동 생성.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* INTERACTIVE WORKFLOW PREVIEW */}
              <div className="bg-slate-50 border border-blue-100 rounded-2xl p-6 md:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#cbd5e1] pb-5">
                  <div>
                    <h4 className="text-sm uppercase font-extrabold text-blue-600">HOW IT WORKS</h4>
                    <h5 className="text-xl font-bold text-[#0f172a]">직관적인 채용 평가 시뮬레이션 프로세스</h5>
                  </div>
                  <span className="px-3 py-1 bg-white border border-blue-100 text-blue-600 text-xs font-semibold rounded-full shadow-sm">순서대로 따라가면 완성되는 심사</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {[
                    { num: "01", title: "센터 및 직무 지정", desc: "지역 센터 정보와 직무(상담, 행정, 팀장)를 골라 가이드 설정" },
                    { num: "02", title: "1차 직무설정", desc: "자격증, 행무, 네트워킹 등의 세부 가중치를 직무 특성에 맞춰 분배" },
                    { num: "03", title: "2차 조직적합도", desc: "공감력, 민원응대 등 조직적합도 지표의 최적 편향 검증" },
                    { num: "04", title: "지원자 서류 등록", desc: "지원자 명단 작성을 거쳐 이력 및 자기소개서 내용 그대로 대량 기입" },
                    { num: "05", title: "결과 및 PDF 발급", desc: "단 1분 만에 환산점수 및 편향 등급이 반영된 보증형 리포트 확보" }
                  ].map((wf, sIdx) => (
                    <div key={wf.num} className="relative bg-white border border-[#e2e8f0] rounded-xl p-4 space-y-2 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-black text-blue-600/10">{wf.num}</span>
                        {sIdx < 4 && <ArrowRight className="w-3.5 h-3.5 text-slate-300 hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-20" />}
                      </div>
                      <h6 className="text-xs font-black text-[#1e293b]">{wf.title}</h6>
                      <p className="text-[11px] text-slate-500 leading-normal">{wf.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* STATS INFOGRAPHICS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                <div className="bg-white border border-blue-100 rounded-2xl py-6 space-y-1 shadow-sm">
                  <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">85% ↓</div>
                  <div className="text-xs font-bold text-[#1e293b]">서류 전형 검토 시간 감소</div>
                  <p className="text-[11px] text-slate-500">평균 2시간 이상 분량 직무 분석 3초 완료</p>
                </div>
                <div className="bg-white border border-blue-100 rounded-2xl py-6 space-y-1 shadow-sm">
                  <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">99.4%</div>
                  <div className="text-xs font-bold text-[#1e293b]">가중 보정 정밀 만족도</div>
                  <p className="text-[11px] text-slate-500">전임 보조금 심사원 기획 역량 반영율</p>
                </div>
                <div className="bg-white border border-blue-150 rounded-2xl py-6 space-y-1 shadow-sm">
                  <div className="text-3xl font-black text-[#10b981]">100%</div>
                  <div className="text-xs font-bold text-[#1e293b]">증빙 투명성 수립율</div>
                  <p className="text-[11px] text-slate-500">내부 임시 결재 및 보증용 PDF 최적화 완료</p>
                </div>
              </div>

            </div>
          )}

          {/* 1단계. 자체 센터 정보 및 채용 직무 선택 */}
          {currentStep === 1 && (
            <div className="space-y-6 max-w-xl mx-auto w-full animate-fade-in">
              <div className="flex items-center gap-3 text-blue-650 text-sm font-bold bg-blue-50/70 p-3 rounded-xl border border-blue-105 shadow-sm">
                <ChevronLeft className="w-5 h-5 cursor-pointer text-slate-500 hover:text-blue-700 transition-colors" onClick={() => setCurrentStep(0)} />
                <span className="text-[#0f172a]">1단계 : 자체 센터 정보 및 채용 직무 선택</span>
              </div>

              <div className="bg-white border border-blue-100 rounded-2xl p-6 space-y-5 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
                <div>
                  <label className="block text-xs font-extrabold text-blue-600 uppercase tracking-wider mb-2">지자체 / 지역본부명</label>
                  <input
                    type="text"
                    value={centerInfo.regionName}
                    onChange={(e) => setCenterInfo(prev => ({ ...prev, regionName: e.target.value }))}
                    placeholder="예: 서울특별시, 경기도, 인�                    <input
                      type="number"
                      value={firstStageConfig.weightAdmin}
                      onChange={(e) => setFirstStageConfig(prev => ({ ...prev, weightAdmin: Number(e.target.value) }))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3 text-xs text-center font-mono font-bold text-slate-800 focus:outline-[#2563eb]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-505 font-extrabold mb-1.5 uppercase tracking-wider font-semibold">구인처개척·영업</label>
                    <input
                      type="number"
                      value={firstStageConfig.weightNetworking}
                      onChange={(e) => setFirstStageConfig(prev => ({ ...prev, weightNetworking: Number(e.target.value) }))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3 text-xs text-center font-mono font-bold text-slate-800 focus:outline-[#2563eb]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all active:scale-95 cursor-pointer"
                >
                  이전 단계로
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const sum = firstStageConfig.weightCompetency + firstStageConfig.weightAdmin + firstStageConfig.weightNetworking;
                    if (sum !== 100) {
                      alert(`1차 평가 내부 배점의 합계는 정확히 100점이어야 합니다. 현재: ${sum}점. 조정한 뒤 다음 단계로 전진해주세요.`);
                      return;
                    }
                    setCurrentStep(3);
                  }}
                  className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-sky-500 text-white hover:brightness-110 font-bold rounded-xl text-xs transition-all flex items-center gap-2 active:scale-95 shadow-[0_4px_15px_rgba(37,99,235,0.2)] group cursor-pointer"
                >
                  <span>합계 검증 후 3단계 진행</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}ate-305 rounded-xl px-4 py-3 text-sm text-slate-805 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all font-semibold"xt-blue-600 uppercase tracking-wider mb-2">표시 직무 명칭</label>
                  <input
                    type="text"
                    value={targetJobName}
                    onChange={(e) => setTargetJobName(e.target.value)}
                    placeholder="예: 시간제 직업상담원, 취업 행정원"
                    className="w-full bg-slate-50 border border-slate-350 rounded-xl px-4 py-3 text-sm text-slate-805 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-semibold"
                  />
                </div>
              </div>

              {/* 가중치 지정 프리뷰 & 조절 슬라이더 */}
              <div className="bg-white border border-blue-100 rounded-2xl p-6 space-y-5 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">종합 평가 가중치 직접 설정</h4>
                  <span className="text-xs text-blue-600 font-mono font-black bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                    {weightFirstRatio} : {weightSecondRatio} (직무수행 : 조직적합도)
                  </span>
                </div>
                
                <div className="space-y-3">
                  <input
                    type="range"
                    min="30"
                    max="80"
                    step="5"
                    value={weightFirstRatio}
                    onChange={(e) => {
                      const first = Number(e.target.value);
                      setWeightFirstRatio(first);
                      setWeightSecondRatio(100 - first);
                    }}
                    className="w-full accent-blue-600 bg-slate-200 cursor-pointer h-2 rounded-lg"
                  />
                  <div className="flex justify-between text-[11px] font-bold text-slate-400">
                    <span>직무수행 집중 (80:20)</span>
                    <span>균형 비율 (50:50)</span>
                    <span>조직적합 집중 (30:70)</span>
                  </div>
                </div>

                <div className="p-3.5 bg-blue-500/5 rounded-xl text-[11px] text-blue-650 leading-relaxed border border-blue-105 font-semibold">
                  ⚡ <span className="font-extrabold text-blue-700">정성평가 신뢰도 조정 감점 알고리즘</span>이 탑재되어, 자기소개서에 감춰진 과장/과소 편향을 탐지하여 점수를 유기적으로 보정합니다.
                </div>
              </div>

              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(0)}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all active:scale-95 cursor-pointer"
                >
                  이전 단계로
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-sky-500 text-white hover:brightness-110 font-bold rounded-xl text-xs transition-all flex items-center gap-2 active:scale-95 shadow-[0_4px_15px_rgba(37,99,235,0.2)] group cursor-pointer"
                >
                  <span>가중치 확인 후 2단계 진행</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Sample Data Fast-track Help */}
              <div className="pt-6 border-t border-slate-205">
                <p className="text-[11px] text-center text-slate-500 font-bold mb-3">⚡ 1초 만에 테스트용 전체 예시 시나리오 불러오기</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {(["상담직", "행정직", "팀장", "기타"] as JobType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        applySampleTemplate(t);
                        alert(`[템플릿 적용] ${t} 테스트 조건 및 가상 지원서가 로드되었습니다! 4~5단계에서 즉시 확인할 수 있습니다.`);
                      }}
                      className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-650 font-semibold shadow-sm transition-colors cursor-pointer"
                    >
                      {t} 템플릿
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2단계. 1차 직무수행 역량 설정 */}
          {currentStep === 2 && (
            <div className="space-y-6 max-w-xl mx-auto w-full animate-fade-in">
              <div className="flex items-center gap-3 text-blue-650 text-sm font-bold bg-blue-50/70 p-3 rounded-xl border border-blue-105 shadow-sm">
                <ChevronLeft className="w-5 h-5 cursor-pointer text-slate-550 hover:text-blue-700 transition-colors" onClick={() => setCurrentStep(1)} />
                <span className="text-[#0f172a]">2단계 : 1차 직무수행 핵심 역량 세부 요구사항</span>
              </div>

              <div className="bg-white border border-blue-100 rounded-2xl p-6 space-y-5 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
                <div>
                  <label className="block text-xs font-extrabold text-blue-600 uppercase tracking-wider mb-2">핵심 검증 역량</label>
                  <textarea
                    rows={2}
                    value={firstStageConfig.keyCompetencies}
                    onChange={(e) => setFirstStageConfig(prev => ({ ...prev, keyCompetencies: e.target.value }))}
                    placeholder="예: 구직 발굴, 알선 기업 개척, 고용 상담 역량"
                    className="w-full bg-slate-50 border border-slate-350 rounded-xl px-4 py-3 text-sm text-slate-805 placeholder-slate-400 focus:outline-[#2563eb] transition-all font-semibold resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-blue-600 uppercase tracking-wider mb-2">필수 / 우대 자격증 기준</label>
                  <input
                    type="text"
                    value={firstStageConfig.preferredCertifications}
                    onChange={(e) => setFirstStageConfig(prev => ({ ...prev, preferredCertifications: e.target.value }))}
                    placeholder="예: 직업상담사 2급, 청소년지도사, 전산회계"
                    className="w-full bg-slate-50 border border-slate-350 rounded-xl px-4 py-3 text-sm text-slate-805 placeholder-slate-400 focus:outline-[#2563eb] transition-all font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-blue-600 uppercase tracking-wider mb-2">필수 경험 / 적정 경력 기간</label>
                  <input
                    type="text"
                    value={firstStageConfig.requiredExperience}
                    onChange={(e) => setFirstStageConfig(prev => ({ ...prev, requiredExperience: e.target.value }))}
                    placeholder="예: 관련 분야 실무 경력 1년 이상 선호"
                    className="w-full bg-slate-50 border border-slate-355 rounded-xl px-4 py-3 text-sm text-slate-805 placeholder-slate-400 focus:outline-[#2563eb] transition-all font-semibold"
                  />
                </div>
              </div>

              {/* 1차 내부 배당 세부 점수 배점 */}
              <div className="bg-white border border-blue-100 rounded-2xl p-6 space-y-5 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
                <h4 className="text-xs font-extrabold text-[#19213d] flex items-center justify-between border-b border-slate-100 pb-2 uppercase tracking-wider">
                  <span>1차 영역 내부 평가배점 세분화 (합산 100점 필수)</span>
                  <span className={`text-[11px] px-2.5 py-0.5 rounded-full border ${
                    (firstStageConfig.weightCompetency + firstStageConfig.weightAdmin + firstStageConfig.weightNetworking === 100)
                      ? "text-blue-600 bg-blue-105/20 border-blue-200 font-black"
                      : "text-rose-600 bg-rose-50 border-rose-200/80 font-black"
                  }`}>
                    합계: {firstStageConfig.weightCompetency + firstStageConfig.weightAdmin + firstStageConfig.weightNetworking} / 100점
                  </span>
                </h4>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-extrabold mb-1.5 uppercase tracking-wider">직무전문성·자격</label>
                    <input
                      type="number"
                      value={firstStageConfig.weightCompetency}
                      onChange={(e) => setFirstStageConfig(prev => ({ ...prev, weightCompetency: Number(e.target.value) }))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3 text-xs text-center font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-505 font-extrabold mb-1.5 uppercase tracking-wider font-semibold">행정·실무 역량</label>
                    <input
                      type="number"
                      value={firstStageConfig.weightAdmin}
                      onChange={(e) => setFirstStageConfig(prev => ({ ...prev, weightAdmin: Number(e.target.value) }))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3 text-xs text-center font-mono font-bold text-slate-800 focus:outline-[#2563eb]"
                    />
                  </div>
                  <div>utton>
                </div>

                <p className="text-xs text-[#2563eb] font-semibold">💡 최소 1명에서 최대 10명 이내 분석을 권장합니다.</p>
              </div>

              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all active:scale-95 cursor-pointer"
                >
                  이전 단계
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-sky-505 text-white hover:brightness-110 font-bold rounded-xl text-xs transition-all flex items-center gap-2 active:scale-95 shadow-[0_4px_15px_rgba(37,99,235,0.2)] group cursor-pointer"
                >
                  <span>지원서 정보 입력 하러가기</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}ate-305 rounded-xl px-4 py-3 text-sm text-slate-805 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-blue-600 uppercase tracking-wider mb-2">자체 센터명</label>
                  <input
                    type="text"
                    value={centerInfo.centerName}
                    onChange={(e) => setCenterInfo(prev => ({ ...prev, centerName: e.target.value }))}
                    placeholder="예: 마포여성새로일하기센터"
                    className="w-full bg-slate-50 border border-slate-305 rounded-xl px-4 py-3 text-sm text-slate-805 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-blue-600 uppercase tracking-wider mb-2">채용 대상 직무</label>
                  <select
                    value={jobType}
                    onChange={handleJobTypeChange}
                    className="w-full bg-slate-50 border border-slate-305 rounded-xl px-4 py-3 text-sm text-slate-805 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all font-semibold"
                  >
                    <option value="상담직">직업상담원 (상담직)</option>
                    <option value="행정직">행정원 (행정직)</option>
                    <option value="팀장">팀장 (관리직)</option>
                    <option value="기타">기타 · 통합직무 (기본값)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-blue-600 uppercase tracking-wider mb-2">표시 직무 명칭</label>
                  <input
                    type="text"
                    value={targetJobName}
                    onChange={(e) => setTargetJobName(e.target.value)}
                    placeholder="예: 시간제 직업상담원, 취업서포터 행정원"
                    className="w-full bg-slate-50 border border-slate-350 rounded-xl px-4 py-3 text-sm text-slate-805 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all font-semibold"
                  />
                </div>
              </div>

              {/* 가중치 지정 프리뷰 & 조절 슬라이더 */}
              <div className="bg-white border border-blue-100 rounded-2xl p-6 space-y-5 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">종합 평가 가중치 직접 설정</h4>
                  <span className="text-xs text-blue-650 font-mono font-black bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-105">
                    {weightFirstRatio} : {weightSecondRatio} (직무수행 : 조직적합도)
                  </span>
                </div>
                
                <div className="space-y-3">
                  <input
                    type="range"
                    min="30"
                    max="80"
                    step="5"
                    value={weightFirstRatio}
                    onChange={(e) => {
                      const first = Number(e.target.value);
                      setWeightFirstRatio(first);
                      setWeightSecondRatio(100 - first);
                    }}
                    className="w-full accent-blue-600 bg-slate-200 cursor-pointer h-2 rounded-lg"
                  />
                  <div className="flex justify-between text-[11px] font-bold text-slate-450">
                    <span>직무수행 집중 (80:20)</span>
                    <span>균형 비율 (50:50)</span>
                    <span>조직적합 집중 (30:70)</span>
                  </div>
                </div>

                <div className="p-3.5 bg-blue-500/5 rounded-xl text-[11px] text-blue-650 leading-relaxed border border-blue-100 font-semibold font-sans">
                  ⚡ <span className="font-extrabold text-blue-700">정성평가 신뢰도 조정 감점 알고리즘</span>이 탑재되어, 자기소개서에 감춰진 과장/과소 편향을 탐지하여 점수를 유기적으로 보정합니다.
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-sky-505 text-white hover:brightness-110 font-bold rounded-xl text-xs transition-all flex items-center gap-2 active:scale-95 shadow-[0_4px_15px_rgba(37,99,235,0.2)] group cursor-pointer"
                >
                  <span>가중치 확인 후 2단계 진행</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Sample Data Fast-track Help */}
              <div className="pt-6 border-t border-slate-200">
                <p className="text-[11px] text-center text-slate-500 font-bold mb-3">⚡ 1초 만에 테스트용 전체 예시 시나리오 불러오기</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {(["상담직", "행정직", "팀장", "기타"] as JobType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        applySampleTemplate(t);
                        alert(`[템플릿 적용] ${t} 테스트 조건 및 가상 지원서가 로드되었습니다! 4~5단계에서 즉시 확인할 수 있습니다.`);
                      }}
                      className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-250 rounded-full text-xs text-slate-650 font-semibold shadow-sm transition-colors cursor-pointer"
                    >
                      {t} 템플릿
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2단계. 1차 직무수행 역량 설정 */}
          {currentStep === 2 && (
            <div className="space-y-6 max-w-xl mx-auto w-full animate-fade-in">
              <div className="flex items-center gap-3 text-blue-600 text-sm font-bold bg-blue-50/70 p-3 rounded-xl border border-blue-105 shadow-sm">
                <ChevronLeft className="w-5 h-5 cursor-pointer text-slate-500 hover:text-blue-700 transition-colors" onClick={() => setCurrentStep(1)} />
                <span className="text-[#0f172a]">2단계 : 1차 직무수행 핵심 역량 세부 요구사항</span>
              </div>

              <div className="bg-white border border-blue-100 rounded-2xl p-6 space-y-5 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
                <div>
                  <label className="block text-xs font-extrabold text-blue-600 uppercase tracking-wider mb-2">핵심 검증 역량</label>
                  <textarea
                    rows={2}
                    value={firstStageConfig.keyCompetencies}
                    onChange={(e) => setFirstStageConfig(prev => ({ ...prev, keyCompetencies: e.target.value }))}
                    placeholder="예: 구직 발굴, 알선 기업 개척, 고용 상담 역량"
                    className="w-full bg-slate-50 border border-slate-305 rounded-xl px-4 py-3 text-sm text-slate-805 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all font-semibold resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-blue-600 uppercase tracking-wider mb-2">필수 / 우대 자격증 기준</label>
                  <input
                    type="text"
                    value={firstStageConfig.preferredCertifications}
                    onChange={(e) => setFirstStageConfig(prev => ({ ...prev, preferredCertifications: e.target.value }))}
                    placeholder="예: 직업상담사 2급, 청소년지도사, 전산회계"
                    className="w-full bg-slate-50 border border-slate-305 rounded-xl px-4 py-3 text-sm text-slate-805 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-blue-600 uppercase tracking-wider mb-2">필수 경험 / 적정 경력 기간</label>
                  <input
                    type="text"
                    value={firstStageConfig.requiredExperience}
                    onChange={(e) => setFirstStageConfig(prev => ({ ...prev, requiredExperience: e.target.value }))}
                    placeholder="예: 관련 분야 실무 경력 1년 이상 선호"
                    className="w-full bg-slate-50 border border-slate-305 rounded-xl px-4 py-3 text-sm text-slate-805 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all font-semibold"
                  />
                </div>
              </div>

              {/* 1차 내부 배달 세부 점수 배점 */}
              <div className="bg-white border border-blue-100 rounded-2xl p-6 space-y-5 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
                <h4 className="text-xs font-extrabold text-[#19213d] flex items-center justify-between border-b border-slate-100 pb-2 uppercase tracking-wider">
                  <span>1차 영역 내부 평가배점 세분화 (합산 100점 필수)</span>
                  <span className={`text-[11px] px-2.5 py-0.5 rounded-full border ${
                    (firstStageConfig.weightCompetency + firstStageConfig.weightAdmin + firstStageConfig.weightNetworking === 100)
                      ? "text-blue-600 bg-blue-105/20 border-blue-200 font-black"
                      : "text-rose-600 bg-rose-50 border-rose-200/80 font-black"
                  }`}>
                    합계: {firstStageConfig.weightCompetency + firstStageConfig.weightAdmin + firstStageConfig.weightNetworking} / 100점
                  </span>
                </h4>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                      <p className="text-xs text-blue-600 font-semibold">💡 최소 1명에서 최대 10명 이내 분석을 권장합니다.</p>
              </div>
 
              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all active:scale-95 cursor-pointer"
                >
                  이전 단계
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-sky-505 text-white hover:brightness-110 font-bold rounded-xl text-xs transition-all flex items-center gap-2 active:scale-95 shadow-[0_4px_15px_rgba(37,99,235,0.2)] group cursor-pointer"
                >
                  <span>지원서 정보 입력 하러가기</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}



          {/* 5단계. 지원자 데이터 입력 */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-teal-400 text-sm font-bold bg-[#11182c] p-4 rounded-xl border border-[#1e294b]">
                <div className="flex items-center gap-3">
                  <ChevronLeft className="w-5 h-5 cursor-pointer text-slate-400 hover:text-white transition-colors" onClick={() => setCurrentStep(4)} />
                  <span className="text-white">5단계 : 지원자별 구인 서류 등록 및 텍스트 취합 ({candidateCount}명)</span>
                </div>
                <button
                  onClick={() => {
                    if (confirm("상담직 가상 모범 데이터로 모두 교체해 시험해볼까요?")) {
                      applySampleTemplate("상담직");
                    }
                  }}
                  className="px-4 py-2 bg-teal-500/10 hover:bg-teal-500 hover:text-slate-950 text-teal-300 font-extrabold transition-all border border-teal-500/30 rounded-xl text-xs active:scale-95 cursor-pointer shadow-sm"
                >
                  ⚡ 상담직 데모데이터 자동 채우기
                </button>
              </div>

              {/* 📂 입사지원서 PDF 일괄 자동 업로드 영역 (Batch Upload) */}
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleBatchPdfUpload(e.dataTransfer.files);
                }}
                className="bg-[#0c1223] border-2 border-dashed border-[#24345d] hover:border-teal-400/80 rounded-2xl p-8 text-center transition-all relative overflow-hidden group space-y-4 shadow-xl"
              >
                {batchExtracting ? (
                  <div className="py-4 space-y-3">
                    <div className="flex items-center justify-center gap-2.5 text-teal-400 text-xs font-black">
                      <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                      <span>PDF 일괄 파싱 및 역량 추출 중... ({batchProgress.current} / {batchProgress.total})</span>
                    </div>
                    {/* Custom Progress Bar */}
                    <div className="w-64 mx-auto bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-teal-450 h-1.5 rounded-full transition-all duration-300 bg-gradient-to-r from-teal-500 to-sky-400"
                        style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">파일에서 이력서/자소서 전문 텍스트를 실시간으로 추출하고 있습니다. 잠시만 기다려 주십시오.</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-2 space-y-3">
                    <div className="p-3 bg-gradient-to-tr from-teal-500/10 to-sky-400/10 border border-teal-500/20 rounded-2xl text-teal-400 group-hover:scale-105 transition-transform duration-200">
                      <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white">📁 입사지원서 PDF 일괄 자동 자동등록 (Batch Smart Upload)</h4>
                      <p className="text-[11px] text-slate-400 mt-2 max-w-xl mx-auto leading-relaxed">
                        지원자들의 <span className="text-teal-300 font-bold">이력서, 자기소개서, 구직신청서, 직무계획서(.pdf)</span> 파일들을 한 번에 드래그하여 이 자리에 놓거나 아래 버튼을 누르십시오.
                        문서 내용을 자동 파싱하여 후보 카드로 순차 배정 및 자동 등록해 줍니다.
                      </p>
                    </div>
                    <label className="cursor-pointer inline-flex items-center gap-2 bg-teal-500 text-slate-950 hover:brightness-110 px-5 py-2.5 rounded-xl text-xs font-bold transition-all mt-2 shadow-lg active:scale-95">
                      <span>PDF 파일 다중 선택하기</span>
                      <input
                        type="file"
                        accept=".pdf"
                        multiple
                        onChange={(e) => handleBatchPdfUpload(e.target.files)}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {candidates.map((cand, idx) => (
                  <div key={cand.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-black text-slate-400">후보자 #{idx + 1} 지원정보</span>
                        <span className="text-[10px] text-teal-500 bg-teal-500/10 px-2 py-0.5 rounded-full font-mono">
                          ID: {cand.id}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-400 mb-1">지원자 실명</label>
                          <input
                            type="text"
                            value={cand.name}
                            onChange={(e) => updateCandidate(cand.id, "name", e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-1.5 text-xs text-white"
                            placeholder="실명 입력 (서버 통신 시 성 뒤 마스킹 보안처리함)"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-400 mb-1">서류 전문 (이력서, 자기소개서, 직무계획 통합 입력)</label>
                          
                          {/* Rich Drop-zone for file uploads */}
                          <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleFileDrop(e, cand.id)}
                            className="relative border-2 border-dashed border-white/10 hover:border-teal-400/50 bg-slate-950/50 rounded-xl p-3 text-center transition-all flex flex-col justify-center min-h-[150px]"
                          >
                            {pdfExtractingMap[cand.id] ? (
                              <div className="flex flex-col items-center justify-center py-6 space-y-2">
                                <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                                <span className="text-[10.5px] text-teal-400 font-bold">PDF 파일 정보 추출 중...</span>
                                <span className="text-[9px] text-slate-500">잠시만 기다리시면 분석 대기 텍스트로 치환됩니다.</span>
                              </div>
                            ) : (
                              <>
                                <textarea
                                  rows={6}
                                  value={cand.documentText}
                                  onChange={(e) => updateCandidate(cand.id, "documentText", e.target.value)}
                                  placeholder="입사지원서, 자기소개서, 직무수행계획 내용을 여기에 붙여넣거나 .txt, .pdf 파일을 드래그하십시오."
                                  className="w-full bg-transparent border-0 text-xs text-slate-200 outline-none resize-none placeholder:text-slate-600 mb-2 focus:ring-0"
                                />
                                
                                <div className="flex items-center justify-between border-t border-white/5 pt-2 text-[10px] text-slate-500 mt-auto">
                                  <span className="text-left">
                                    {cand.documentText ? `${cand.documentText.length} 자 분석 대기` : "파일 드래그 가능 (.txt, .pdf)"}
                                  </span>
                                  <label className="cursor-pointer text-teal-400 hover:underline">
                                    [파일 업로드]
                                    <input
                                      type="file"
                                      accept=".txt,.pdf"
                                      onChange={(e) => handleFileSelect(e, cand.id)}
                                      className="hidden"
                                    />
                                  </label>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-500">
                      <span>* 연령, 출신교 무관 직무 적정성만 체크</span>
                      <button
                        onClick={() => {
                          if (confirm("이 후보 입력창을 삭제하시겠습니까?")) {
                            setCandidates(prev => prev.filter(c => c.id !== cand.id));
                            setCandidateCount(prev => prev - 1);
                          }
                        }}
                        className="text-rose-400 hover:text-rose-300 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        식별 삭제
                      </button>
                    </div>
                  </div>
                ))}

                {/* 추가 후보자 카드 생성 슬롯 */}
                <button
                  type="button"
                  onClick={() => {
                    handleCandidateCountChange(candidateCount + 1);
                  }}
                  className="bg-white/5 hover:bg-white/10 border-2 border-dashed border-white/10 hover:border-teal-500/30 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 text-slate-400 transition-all group min-h-[280px]"
                >
                  <Plus className="w-8 h-8 text-slate-500 group-hover:text-teal-400 transition-colors" />
                  <span className="text-xs font-bold text-slate-300">신규 평가 대상 후보자 추가등록</span>
                  <span className="text-[10px] text-slate-500">(클릭 시 입력 카드가 1개 생깁니다)</span>
                </button>
              </div>

              {/* Action Toolbar */}
              <div className="flex justify-between items-center pt-8 border-t border-white/10 mt-6">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm transition-all"
                >
                  이전 단계
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleStartAnalysis}
                    className="px-8 py-3 bg-gradient-to-r from-teal-500 to-sky-400 hover:brightness-110 active:scale-95 text-slate-950 font-extrabold rounded-2xl text-sm transition-all shadow-xl flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    AI 공정 서류 정밀 분석 시작
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* LOADING SCREEN */}
          {loading && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center z-50 p-6 text-center">
              <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-teal-500/20 animate-pulse" />
                  <div className="absolute inset-0 rounded-full border-t-4 border-r-4 border-teal-400 animate-spin" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-white flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 text-teal-400 animate-bounce" />
                    인사 검증 리포트 계산 중...
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed min-h-[40px]">
                    {loadingMessage}
                  </p>
                </div>

                <div className="p-3 bg-white/5 rounded-2xl text-[10px] text-slate-500 text-left leading-relaxed">
                  🔒 보안 안내: 주민등록번호, 긴급 전화번호, 이메일 등의 개인 신상 식별 정보는 서버 전송 전 자동 안전 마스킹 및 제거 처리되어 인사 검증을 완전 공명하게 지원합니다.
                </div>
              </div>
            </div>
          )}

          {/* 6단계 : 대시보드 리포트 (최종 대시보드 시각화) */}
          {currentStep === 6 && analysisResults.length > 0 && (
            <div className="space-y-8 animate-fade-in">
              <div className="p-4 bg-teal-950/20 border border-teal-500/20 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-sm font-bold text-teal-300">📊 종합 대시보드 분석 완료</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    가중 프로파일 및 신뢰도 가중 지침 규칙을 기준으로 산정 정렬 완료되었습니다. 
                  </p>
                </div>
                <div className="text-[11px] text-slate-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                  선발 기관 : <span className="font-bold text-white">{centerInfo.regionName}새일센터 ({centerInfo.centerName})</span>
                </div>
              </div>

              {/* Dashboard Main Grid Segment */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* 1. 종합 평가 및 추천 우선순위 (7 COLUMNS) */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* 정렬된 순위 우선 평가 테이블 표 */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                    <h2 className="text-sm font-semibold text-white/90 mb-4 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        1. 종합 평가 및 추천 우선순위
                      </span>
                      <span className="text-[10px] border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold">
                        {WEIGHT_PROFILES[jobType].title} 적용 ({weightFirstRatio}:{weightSecondRatio})
                      </span>
                    </h2>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="text-white/40 border-b border-white/10 pb-2">
                            <th className="py-2.5 font-medium uppercase text-center w-12">순위</th>
                            <th className="py-2.5 font-medium uppercase">지원자명</th>
                            <th className="py-2.5 font-medium uppercase text-right pr-2">종합점수</th>
                            <th className="py-2.5 font-medium uppercase text-center">직무수행</th>
                            <th className="py-2.5 font-medium uppercase">조정 조직적합도</th>
                            <th className="py-2.5 font-medium uppercase text-center w-14">근접군</th>
                          </tr>
                        </thead>
                        <tbody className="text-white/90 divide-y divide-white/5">
                          {analysisResults.map((cand, idx) => {
                            const isSelected = selectedCandidateIndex === idx;
                            return (
                              <tr
                                key={cand.maskedName}
                                onClick={() => setSelectedCandidateIndex(idx)}
                                className={`cursor-pointer transition-colors ${
                                  idx === 0 
                                    ? "bg-emerald-500/10 hover:bg-emerald-500/15" 
                                    : isSelected 
                                      ? "bg-white/10" 
                                      : "hover:bg-white/5"
                                }`}
                              >
                                <td className={`py-3 text-center font-bold ${idx === 0 ? "text-emerald-400" : "text-slate-400"}`}>
                                  {idx + 1}위
                                </td>
                                <td className="py-3 font-semibold flex items-center gap-2">
                                  {cand.maskedName}
                                  {idx === 0 && (
                                    <span className="text-[9px] font-black uppercase tracking-tighter bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded">
                                      최적임
                                    </span>
                                  )}
                                </td>
                                <td className={`py-3 text-right pr-2 text-base font-black ${idx === 0 ? "text-emerald-400 animate-pulse" : "text-white"}`}>
                                  {cand.finalScore}
                                </td>
                                <td className="py-3 text-center font-mono text-slate-300">
                                  {cand.firstStageRawTotal}
                                </td>
                                <td className="py-3 text-xs text-slate-300">
                                  <span className="line-through text-slate-500 mr-1">{cand.secondStageRawTotal}</span>
                                  <ArrowRight className="inline w-3 h-3 text-slate-500 mx-0.5" />
                                  <span className="font-bold text-teal-400">{cand.adjustedSecondStageTotal}</span>
                                  <span className="text-[10px] text-slate-400 ml-1">({cand.overallConfidence})</span>
                                </td>
                                <td className="py-3 text-center text-amber-400 font-bold font-mono">
                                  {cand.nearTieGroup || "-"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Near-tie Groups Display Annotations */}
                    {analysisResults.some(c => c.nearTieGroup) && (
                      <div className="mt-4 p-4 bg-black/40 rounded-xl space-y-2 border border-amber-500/20">
                        <h4 className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>※ 근접군 (±0.5) 알림 및 의사결정 권고</span>
                        </h4>
                        <div className="space-y-1.5">
                          {Array.from(new Set(analysisResults.filter(c => c.nearTieGroup).map(c => cand => c.nearTieGroup))).map((symbol, sidx) => {
                            const groupSymbol = analysisResults.find(c => c.nearTieGroup)?.nearTieGroup || "▢A";
                            return (
                              <p key={sidx} className="text-[11px] text-slate-300 leading-relaxed">
                                {getNearTieGroupInstruction(groupSymbol)}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 📈 적합도 비교 차트 (■ 1칸 = 10점) */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg">
                    <h2 className="text-sm font-semibold text-white/90 mb-4">
                      📈 적합도 비교 차트 (■ 1칸 = 10점)
                    </h2>
                    
                    <div className="space-y-4">
                      {analysisResults.map((cand, idx) => {
                        const isTop = idx === 0;
                        return (
                          <div key={cand.maskedName} className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-semibold text-slate-300">
                                {idx + 1}위: {cand.maskedName}
                              </span>
                              <span className="font-mono font-bold text-teal-400">
                                {cand.finalScore} / 100
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-xs text-slate-500 font-mono select-none">
                                {renderSquareBlocks(cand.finalScore)}
                              </span>
                              
                              {/* Modern interactive background bar representation */}
                              <div className="flex-1 bg-slate-900 h-2.5 rounded-full overflow-hidden">
                                <div
                                  style={{ width: `${cand.finalScore}%` }}
                                  className={`h-full rounded-full transition-all ${
                                    isTop 
                                      ? "bg-gradient-to-r from-teal-500 to-emerald-400 shadow-[0_0_8px_rgba(20,184,166,0.6)]" 
                                      : "bg-sky-500"
                                  }`}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 인사 검포 가중치 Profile 정보카드 */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-4 text-xs text-slate-400 leading-relaxed items-start">
                    <Scale className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-extrabold text-slate-200">신뢰도 가중 감점 규칙 내역 고지 (Saeil Rule 4-2)</p>
                      <p className="mt-1 text-[11px]">
                        서류 평가의 특성 상 직접적인 근거를 검증할 수 없는 조직적합도 전형에서는 계수를 투명하게 감점 적용합니다. 
                        신뢰도가 <span className="text-teal-400 font-bold">상/중상/중</span> 인 경우 감점이 없으나(계수 1.00), 
                        <span className="text-rose-400 font-bold">하</span> 이면 2차 원점수의 <span className="text-rose-300 underline font-mono">0.85배</span>, 
                        <span className="text-rose-500 font-bold">불충분</span> 일 경우 <span className="text-rose-400 underline font-mono">0.70배</span>를 곱해 조정 조직적합도를 반영합니다.
                      </p>
                    </div>
                  </div>

                </div>

                {/* 2. 지원자별 세부 분석 리포트 (5 COLUMNS) */}
                <div className="lg:col-span-5 flex flex-col">
                  {selectedCandidateIndex !== null ? (
                    (() => {
                      const cand = analysisResults[selectedCandidateIndex];
                      const isTopRank = cand.rank === 1;

                      return (
                        <div className="bg-white/5 border border-teal-500/20 rounded-3xl p-6 flex flex-col relative shadow-2xl h-full justify-between min-h-[600px]">
                          {/* Super Recommendation Label banner */}
                          {isTopRank && (
                            <div className="absolute -top-3.5 right-6 px-4 py-1.5 bg-gradient-to-r from-teal-500 to-sky-400 text-slate-950 font-black rounded-xl text-[10px] tracking-widest uppercase shadow-md">
                              Highly Recommended (최적임)
                            </div>
                          )}

                          <div>
                            {/* Profile Header card info */}
                            <div className="flex items-center gap-4 mb-6 pt-2">
                              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl shadow-lg shrink-0">
                                👤
                              </div>
                              <div>
                                <h3 className="text-lg font-black text-white flex items-center gap-2">
                                  {cand.rank}위 : {cand.maskedName}
                                  <span className="text-[10px] font-normal text-slate-400">(종합 {cand.finalScore}점)</span>
                                </h3>
                                <p className="text-xs text-teal-400 font-medium italic mt-0.5">
                                  &quot;{cand.oneLineReview}&quot;
                                </p>
                              </div>
                            </div>

                            {/* Section breakdown scrollable contents wrapper */}
                            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 scrollbar-none">
                              
                              {/* 1차 직무수행 역량 */}
                              <div className="space-y-2.5">
                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-white/10 pb-1 flex justify-between items-center">
                                  <span>🎯 1차 직무수행 역량 ({cand.firstStageRawTotal}/100)</span>
                                  <span className="text-[10px] font-mono font-normal">
                                    가중치 비중 {weightFirstRatio}%
                                  </span>
                                </h4>

                                <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
                                  <div>
                                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                                      <span>(a) 직무 전문성·자격</span>
                                      <span className="font-bold text-white">{cand.scores.firstStage.competency}점 / {firstStageConfig.weightCompetency}% 비중</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-0.5">• {cand.scores.firstStage.competencyEvidence}</p>
                                  </div>

                                  <div>
                                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                                      <span>(b) 행정·실무 역량</span>
                                      <span className="font-bold text-white">{cand.scores.firstStage.admin}점 / {firstStageConfig.weightAdmin}% 비중</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-0.5">• {cand.scores.firstStage.adminEvidence}</p>
                                  </div>

                                  <div>
                                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                                      <span>(c) 구인처 개척·네트워킹</span>
                                      <span className="font-bold text-white">{cand.scores.firstStage.networking}점 / {firstStageConfig.weightNetworking}% 비중</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-0.5">• {cand.scores.firstStage.networkingEvidence}</p>
                                  </div>
                                </div>
                              </div>

                              {/* 2차 조직적합도 */}
                              <div className="space-y-2.5">
                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-white/10 pb-1 flex justify-between items-center">
                                  <span>🤝 2차 조직적합도 (원 {cand.secondStageRawTotal} → 조정 {cand.adjustedSecondStageTotal})</span>
                                  <span className="text-[10px] text-teal-400 font-bold bg-teal-400/10 px-1.5 py-0.2 rounded font-mono">
                                    신뢰도: {cand.overallConfidence}
                                  </span>
                                </h4>

                                <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
                                  <div>
                                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                                      <span>(a) 공감력 · 민원 응대 태도</span>
                                      <span className="font-bold text-white">{cand.scores.secondStage.civilComplaint}점 / {secondStageConfig.weightCivilComplaint}% 비중</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-0.5">• {cand.scores.secondStage.civilComplaintEvidence}</p>
                                  </div>

                                  <div>
                                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                                      <span>
                                        {jobType === "팀장" ? "(b) 리더십·가치관·협업" : "(b) 가치관 · 동료 협업"}
                                      </span>
                                      <span className="font-bold text-white">{cand.scores.secondStage.collaborationOrLeadership}점 / {secondStageConfig.weightCollaborationOrLeadership}% 비중</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-0.5">• {cand.scores.secondStage.collaborationOrLeadershipEvidence}</p>
                                  </div>
                                </div>
                              </div>

                              {/* 날카로운 면접 질문 (Critical Deep Dive Questions) */}
                              <div className="p-4 bg-white/5 rounded-2xl border border-white/15 space-y-3">
                                <h4 className="text-[11px] font-black text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  면접 확인 및 질문 가이드 (Critical Questions)
                                </h4>

                                <div className="space-y-2.5">
                                  <div className="text-[10px] p-2 bg-slate-950/60 rounded-lg border border-white/5">
                                    <p className="text-[#38bdf8] font-bold mb-1">[직무·행정 검증]</p>
                                    <p className="text-slate-300 italicLeading select-all">“{cand.interviewQuestions.jobAndAdmin}”</p>
                                  </div>

                                  <div className="text-[10px] p-2 bg-slate-950/60 rounded-lg border border-white/5">
                                    <p className="text-[#f472b6] font-bold mb-1">[민원·컬처핏 검증]</p>
                                    <p className="text-slate-300 italicLeading select-all">“{cand.interviewQuestions.complaintAndCulture}”</p>
                                  </div>

                                  <div className="text-[10px] p-2 bg-slate-950/60 rounded-lg border border-white/5">
                                    <p className="text-amber-400 font-bold mb-1">[근거 부족 항목 확인]</p>
                                    <p className="text-slate-300 italicLeading select-all">“{cand.interviewQuestions.insufficientOrMissingConfirm}”</p>
                                  </div>
                                </div>
                              </div>

                            </div>
                          </div>

                          {/* Detail Selector Navigator footer */}
                          <div className="pt-4 border-t border-white/5 flex justify-between items-center mt-4">
                            <button
                              type="button"
                              disabled={selectedCandidateIndex === 0}
                              onClick={() => setSelectedCandidateIndex(selectedCandidateIndex - 1)}
                              className="px-2.5 py-1 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 rounded text-[10px] transition-all flex items-center gap-1"
                            >
                              <ChevronLeft className="w-3 h-3" />
                              이전 순위
                            </button>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {selectedCandidateIndex + 1} / {analysisResults.length} 후보자 분석카드
                            </span>
                            <button
                              type="button"
                              disabled={selectedCandidateIndex === analysisResults.length - 1}
                              onClick={() => setSelectedCandidateIndex(selectedCandidateIndex + 1)}
                              className="px-2.5 py-1 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 rounded text-[10px] transition-all flex items-center gap-1"
                            >
                              다음 순위
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="border border-dashed border-white/10 rounded-3xl p-8 flex items-center justify-center text-center h-full text-slate-500">
                      순위 목록을 더블클릭 하거나 상세 조회를 원하는 후보자를 선택해 세부 검증카드를 확인하십시오.
                    </div>
                  )}
                </div>

              </div>

              {/* 👥 2인 후보자 1:1 비교 섹션 */}
              {(() => {
                const candA = analysisResults.find(c => c.maskedName === compareCandidateAName);
                const candB = analysisResults.find(c => c.maskedName === compareCandidateBName);
                return (
                  <div id="candidate-comparison-section" className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 space-y-4 shadow-lg">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-white/10 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-tr from-teal-500 to-sky-400 rounded-xl shadow-md ring-1 ring-white/15">
                          <Scale className="w-5 h-5 text-slate-950" />
                        </div>
                        <div>
                          <h3 className="text-sm md:text-base font-extrabold text-white tracking-tight">
                            👥 초정형 후보자 1:1 종횡 비교 (Head-to-Head Smart Comparison)
                          </h3>
                          <p className="text-[11px] text-slate-400">
                            종합 평점이 아주 유사하거나 동점 근접군(Near-tie)에 속한 두 후보자를 선별하여 주요 지표와 강점을 1:1 비교합니다.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 w-full md:w-auto">
                        <div className="flex-1 md:flex-initial">
                          <label className="block text-[10px] text-teal-400 font-bold mb-1 uppercase tracking-wider font-mono">Candidate A (좌측)</label>
                          <select
                            value={compareCandidateAName}
                            onChange={(e) => setCompareCandidateAName(e.target.value)}
                            className="w-full md:w-48 bg-slate-950 border border-white/10 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-400 font-semibold cursor-pointer"
                          >
                            <option value="">-- 선택 안 함 --</option>
                            {analysisResults.map(c => (
                              <option key={c.maskedName} value={c.maskedName} disabled={c.maskedName === compareCandidateBName}>
                                [{c.rank}위] {c.maskedName} ({c.finalScore}점)
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex-1 md:flex-initial">
                          <label className="block text-[10px] text-sky-400 font-bold mb-1 uppercase tracking-wider font-mono">Candidate B (우측)</label>
                          <select
                            value={compareCandidateBName}
                            onChange={(e) => setCompareCandidateBName(e.target.value)}
                            className="w-full md:w-48 bg-slate-950 border border-white/10 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-400 font-semibold cursor-pointer"
                          >
                            <option value="">-- 선택 안 함 --</option>
                            {analysisResults.map(c => (
                              <option key={c.maskedName} value={c.maskedName} disabled={c.maskedName === compareCandidateAName}>
                                [{c.rank}위] {c.maskedName} ({c.finalScore}점)
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {candA && candB ? (
                      <div className="space-y-4">
                        {/* Quick Summary Cards Side By Side */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Left Candidate Quick view */}
                          <div className="bg-slate-950/40 p-4 rounded-xl border border-teal-500/10 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-bold text-white flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                                  {candA.maskedName} <span className="text-xs text-slate-400">({candA.rank}위)</span>
                                </span>
                                <span className="font-mono text-base font-black text-teal-400">{candA.finalScore}점</span>
                              </div>
                              <p className="text-[11px] text-slate-400 italic leading-relaxed mt-1">
                                &quot;{candA.oneLineReview}&quot;
                              </p>
                            </div>
                          </div>

                          {/* Right Candidate Quick view */}
                          <div className="bg-slate-950/40 p-4 rounded-xl border border-sky-500/10 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-bold text-white flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                                  {candB.maskedName} <span className="text-xs text-slate-400">({candB.rank}위)</span>
                                </span>
                                <span className="font-mono text-base font-black text-sky-400">{candB.finalScore}점</span>
                              </div>
                              <p className="text-[11px] text-slate-400 italic leading-relaxed mt-1">
                                &quot;{candB.oneLineReview}&quot;
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Main Split-Screen Metric Table */}
                        <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/40">
                          <table className="w-full text-left border-collapse table-fixed min-w-[750px]">
                            <thead>
                              <tr className="border-b border-white/10 bg-white/5">
                                <th className="p-3 w-[180px] font-bold text-slate-400 text-xs">상세 평가 지표</th>
                                <th className="p-3 text-center text-teal-400 font-extrabold text-xs bg-teal-500/5 border-r border-white/5">
                                  [상태: {candA.rank}위] {candA.maskedName}
                                </th>
                                <th className="p-3 text-center text-sky-400 font-extrabold text-xs bg-sky-500/5">
                                  [상태: {candB.rank}위] {candB.maskedName}
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-slate-200">
                              {/* 1. 종합 등수 및 점수 */}
                              {renderComparisonRow("최종 종합 평가 순위", "score", `${candA.rank}위`, `${candB.rank}위`, undefined, undefined, false)}
                              {renderComparisonRow("최종 가중 종합 점수", "score", candA.finalScore, candB.finalScore)}
                              
                              {/* 1차 역량 부문 */}
                              <tr className="bg-white/[0.02] border-b border-white/10">
                                <td colSpan={3} className="p-2 text-[11px] font-black tracking-wider text-teal-400 uppercase bg-teal-950/25 font-semibold text-xs h-[30px] leading-[30px] pl-3">
                                  🎯 1차 직무수행 역량 평가 (가중치 {weightFirstRatio}%)
                                </td>
                              </tr>
                              {renderComparisonRow("1차 직무수행 원점수 총합", "score", candA.firstStageRawTotal, candB.firstStageRawTotal)}
                              {renderComparisonRow(
                                "(a) 직무 전문성 및 자격증",
                                "score",
                                candA.scores.firstStage.competency,
                                candB.scores.firstStage.competency,
                                candA.scores.firstStage.competencyEvidence,
                                candB.scores.firstStage.competencyEvidence
                              )}
                              {renderComparisonRow(
                                "(b) 행정 실무 역량",
                                "score",
                                candA.scores.firstStage.admin,
                                candB.scores.firstStage.admin,
                                candA.scores.firstStage.adminEvidence,
                                candB.scores.firstStage.adminEvidence
                              )}
                              {renderComparisonRow(
                                "(c) 구인처 개척 및 네트워킹",
                                "score",
                                candA.scores.firstStage.networking,
                                candB.scores.firstStage.networking,
                                candA.scores.firstStage.networkingEvidence,
                                candB.scores.firstStage.networkingEvidence
                              )}

                              {/* 2차 적합도 부문 */}
                              <tr className="bg-white/[0.02] border-b border-white/10">
                                <td colSpan={3} className="p-2 text-[11px] font-black tracking-wider text-pink-400 uppercase bg-pink-950/25 font-semibold text-xs h-[30px] leading-[30px] pl-3">
                                  🤝 2차 조직적합도 평가 (가중치 {weightSecondRatio}% - 감점 규칙 반영)
                                </td>
                              </tr>
                              {renderComparisonRow("조정 조직적합도 최종 점수", "score", candA.adjustedSecondStageTotal, candB.adjustedSecondStageTotal)}
                              {renderComparisonRow("2차 조직적합도 전형 원점수", "score", candA.secondStageRawTotal, candB.secondStageRawTotal)}
                              {renderComparisonRow(
                                "(a) 공감력 및 민원 응대",
                                "score",
                                candA.scores.secondStage.civilComplaint,
                                candB.scores.secondStage.civilComplaint,
                                `${candA.scores.secondStage.civilComplaintEvidence} (신뢰도: ${candA.scores.secondStage.civilComplaintConfidence})`,
                                `${candB.scores.secondStage.civilComplaintEvidence} (신뢰도: ${candB.scores.secondStage.civilComplaintConfidence})`
                              )}
                              {renderComparisonRow(
                                jobType === "팀장" ? "(b) 리더십·가치관·협업" : "(b) 가치관 및 동료 협업",
                                "score",
                                candA.scores.secondStage.collaborationOrLeadership,
                                candB.scores.secondStage.collaborationOrLeadership,
                                `${candA.scores.secondStage.collaborationOrLeadershipEvidence} (신뢰도: ${candA.scores.secondStage.collaborationOrLeadershipConfidence})`,
                                `${candB.scores.secondStage.collaborationOrLeadershipEvidence} (신뢰도: ${candB.scores.secondStage.collaborationOrLeadershipConfidence})`
                              )}
                              {renderComparisonRow("정성 신뢰도 등급", "text", candA.overallConfidence, candB.overallConfidence)}

                              {/* 정성 속성 부문 */}
                              <tr className="bg-white/[0.02] border-b border-white/10">
                                <td colSpan={3} className="p-2 text-[11px] font-black tracking-wider text-amber-400 uppercase bg-amber-950/25 font-semibold text-xs h-[30px] leading-[30px] pl-3">
                                  📝 강점 및 보완점 분석 비교
                                </td>
                              </tr>
                              {renderComparisonRow("핵심 직무 강점 (Strength)", "text", candA.strengthsAndWeaknesses.strength, candB.strengthsAndWeaknesses.strength)}
                              {renderComparisonRow("우려 및 보완 필요 항목 (Weakness)", "text", candA.strengthsAndWeaknesses.weakness, candB.strengthsAndWeaknesses.weakness)}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-dashed border-white/10 rounded-xl p-8 text-center text-slate-500 text-xs">
                        비교표를 생성하려면 위 드롭다운 셀렉터에서 각각 다른 후보자를 2명 선택해 주십시오. 
                        현재 차수 평가 대상군에 등록된 후보자들 간 정밀 비교가 가능합니다.
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Candidates Summaries Row Cards */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/10 pb-2">
                  <ListOrdered className="w-4 h-4 text-teal-400" />
                  <span>전체 구인 지원자 핵심 속성 요약 가이드 ({analysisResults.length}명)</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {analysisResults.map(cand => (
                    <div key={cand.maskedName} className="bg-slate-950/40 rounded-xl p-4 border border-white/5 hover:border-teal-400/20 transition-all flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-sm text-white">{cand.rank}위. {cand.maskedName}</span>
                          <span className="text-[11px] text-teal-400 font-bold font-mono">{cand.finalScore} 점</span>
                        </div>
                        <p className="text-[10px] text-slate-400 italic mt-1 leading-relaxed">
                          &quot;{cand.oneLineReview}&quot;
                        </p>
                      </div>

                      <div className="space-y-2 border-t border-white/5 pt-2 text-[10.5px]">
                        <div>
                          <span className="text-teal-400 block font-bold">[1차 자격·경력 매칭 및 행정]</span>
                          <p className="text-slate-300 mt-0.5 leading-snug">{cand.summaries.qualificationAndExperience}</p>
                          <p className="text-slate-400 italic text-[10px] mt-0.5">{cand.summaries.adminAndNetworking}</p>
                        </div>
                        <div>
                          <span className="text-pink-400 block font-bold">[2차 사명 및 민원응대]</span>
                          <p className="text-slate-300 mt-0.5 leading-snug">{cand.summaries.missionAndTalent}</p>
                          <p className="text-slate-400 italic text-[10px] mt-0.5">{cand.summaries.complaintAndCollaboration}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const idx = analysisResults.findIndex(c => c.maskedName === cand.maskedName);
                          if (idx !== -1) {
                            setSelectedCandidateIndex(idx);
                            // 화면 최상단 영역 근처로 부드러운 스크롤 이동
                            document.getElementById("main-header")?.scrollIntoView({ behavior: "smooth" });
                          }
                        }}
                        className="w-full text-center py-1.5 bg-white/5 hover:bg-white/10 text-[10px] text-slate-300 rounded font-bold transition-all border border-white/5"
                      >
                        상세 분석 집중 확인
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 📥 채용 분석 리포트 다운로드 및 인쇄 섹션 */}
              <div className="bg-gradient-to-tr from-slate-900 via-slate-900 to-teal-950/30 border border-teal-500/20 rounded-2xl p-6 shadow-xl space-y-4 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <span className="p-1 px-2.5 bg-teal-500/15 text-teal-400 font-extrabold text-[10px] rounded-full uppercase tracking-widest border border-teal-500/20">REPORT EXPORT</span>
                    <h3 className="text-sm font-black text-white">📥 채용 심사 결과 리포트 다운로드</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                    심사가 무사히 완료되었습니다! 본 차수 직무평가 기준에 맞춘 전체 지원자 순위 및 정밀 심층 보고서 데이터를 <span className="font-bold text-teal-300">PDF 파일(인쇄 포함)</span> 또는 <span className="font-bold text-sky-400">텍스트(TXT/Markdown) 파일</span>로 다운로드할 수 있습니다.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
                  <button
                    onClick={handleDownloadTxt}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95"
                  >
                    <FileText className="w-4 h-4 text-sky-400" />
                    <span>📝 텍스트(TXT) 다운로드</span>
                  </button>
                  
                  <button
                    onClick={handlePrintPdf}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-black transition-all shadow-[0_0_12px_rgba(20,184,166,0.3)] active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-3a2 2 0 00-2-2H5a2 2 0 00-2 2v3a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                    </svg>
                    <span>📄 PDF 리포트 다운로드</span>
                  </button>
                  
                  <button
                    onClick={handleReset}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>초기화</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Action Button Navigation overlay to direct step workflow (Not show in Dashboard) */}
        {currentStep < 5 && (
          <div className="p-4 bg-slate-900/40 border-t border-white/5 flex justify-between items-center px-8">
            <span className="text-[11px] text-slate-500">※ 입력한 정보는 브라우저 메모리에 고유 보존됩니다.</span>
            
            <div className="flex gap-2">
              <button
                type="button"
                disabled={currentStep === 1}
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-xs"
              >
                이전단계
              </button>
              <button
                type="button"
                onClick={() => {
                  if (currentStep === 2) {
                    const sum = firstStageConfig.weightCompetency + firstStageConfig.weightAdmin + firstStageConfig.weightNetworking;
                    if (sum !== 100) {
                      alert(`1차 평가 내부 배점의 합계는 정확히 100점이어야 합니다. 현재: ${sum}점. 조정한 뒤 다음 단계로 전진해주세요.`);
                      return;
                    }
                  }
                  if (currentStep === 3) {
                    const sum = secondStageConfig.weightCivilComplaint + secondStageConfig.weightCollaborationOrLeadership;
                    if (sum !== 100) {
                      alert(`2차 영역 배점의 합계는 정확히 100점이어야 합니다. 현재: ${sum}점. 조정한 뒤 다음 단계로 전진해주세요.`);
                      return;
                    }
                  }
                  setCurrentStep(prev => prev + 1);
                }}
                className="px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg text-xs font-bold transition-all"
              >
                다음단계 전진
              </button>
            </div>
          </div>
        )}

        {/* Footer info 고지사항 의무 수록 ( Constraints 4 ) */}
        <footer className="p-4 md:p-5 bg-black/40 border-t border-white/10 text-center">
          <p className="text-[10.5px] text-slate-400/90 leading-relaxed">
            ⚠️ 본 리포트는 <span className="font-bold text-white underline decoration-teal-400">채용 의사결정 보조 자료</span>입니다. 
            최종 합격 여부는 면접 등 사람의 종합 판단으로 확정하십시오. (Analysis Powered by Saeil HR Specialist v2)
          </p>
        </footer>
      </div>
    </div>
  );
}
