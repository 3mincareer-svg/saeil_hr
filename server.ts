import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Server-side Gemini initialization
const geminiApiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({
  apiKey: geminiApiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// APIs
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", mode: process.env.NODE_ENV });
});

// Helper: Mask sensitive personal information in raw text
function preMaskSensitiveData(text: string): string {
  if (!text) return "";
  // Mask Resident Registration Numbers (주민등록번호)
  let masked = text.replace(/\d{6}-\d{7}/g, "******-*******");
  masked = masked.replace(/\d{6}-\d{1}\d{6}/g, "******-*******");
  // Mask phone numbers (휴대폰 번호)
  masked = masked.replace(/010[-. ]?\d{3,4}[-. ]?\d{4}/g, "010-****-****");
  // Mask emails
  masked = masked.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "****@****.***");
  // Mask detailed physical addresses or specifics (simplified)
  masked = masked.replace(/주소\s*:\s*[^\n]+/g, "주소 : [개인정보 보호법에 의거 기본 주소 외 상세 주소 마스킹]");
  return masked;
}

// REST Endpoint for document analysis
app.post("/api/analyze", async (req, res) => {
  try {
    const { centerInfo, jobType, targetJobName, firstStageConfig, secondStageConfig, candidates } = req.body;

    if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
      return res.status(400).json({ error: "분석할 지원자 데이터가 없습니다." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY가 서버 환경 변수에 설정되어 있지 않습니다. AI Studio UI의 Secrets 패널에서 등록해 주세요.",
      });
    }

    // Prepare evaluation prompt instructions
    const prompt = `
당신은 여성새로일하기센터(새일센터)의 우수한 인사 책임자(HR Specialist)이자 자체 직원 채용 분석가입니다.
제시된 센터 정보, 채용 직무, 핵심 평가 요구역량을 기준으로 지원자의 제출 서류(이력서, 자기소개서, 직무수행계획서 등)를 '공정'하고 '근거 중심'으로 정밀 분석해 주십시오.

[기관 및 채용 개요]
- 센터명: ${centerInfo.regionName || "지역미상"} 여성새로일하기센터 (${centerInfo.centerName || "새일센터"})
- 채용 직무: ${targetJobName} (직무 분류: ${jobType})
- 1차 역량 요구사항: 핵심 역량 [${firstStageConfig.keyCompetencies || "직무수행 역량"}], 우대 자격증 [${firstStageConfig.preferredCertifications || "직무 관련 자격증"}], 필수 경력 기간 [${firstStageConfig.requiredExperience || "경력 무관"}]
- 2차 적합도 요구사항: 조직문화 및 인재상 [${secondStageConfig.orgCultureAndTalent || "민원 해결력 및 성실성"}], 요구 태도 [${secondStageConfig.requiredAttitudes || "협동, 공감, 회복탄력성"}]

[평가 대상 지원자 목록]
${candidates.map((c: any, idx: number) => `
--- 후보자 #${idx + 1} ---
임시 식별명: ${c.name || `지원자${idx + 1}`}
제출 서류 내용 (개인정보 보호 마스킹 사전 적용됨):
${preMaskSensitiveData(c.documentText)}
`).join("\n")}

[핵심 평가 5대 원칙 (★엄격히 준수★)]
1. 근거 기반 채점 (No Fabrication): 서류에 기재된 명백한 '사실'과 '경험'에만 기반해 점수를 매기십시오. 추측이나 창작은 엄금합니다. 구체적 근거가 부재한 카테고리는 보수적으로 최하 평가를 부여하고 실질 근거 부재 표시 및 면접 검증 필수로 분류하며, 근거가 아예 없거나 희박하면 평가 카테고리 텍스트에 [근거 부족]이라고 정확히 표기하십시오.
2. 공정성 및 편향 철저 배제: 연령, 혼인·출산·육아 여부, 거주지, 학교 서열, 외모 등 무관 요소는 일절 감점/가점하지 않습니다. 특히 새일센터의 사명(여성 취업 지원 및 경력단절 예방)과 배치되게 '경력단절' 기간 자체를 결함으로 보지 마십시오. 직무 관련 역량과 경험만을 공정히 반영하십시오.
3. 정성평가 신뢰도 명시 및 원점수 투명 공개: 2차 조직적합도 카테고리(민원응대, 가치관 및 협업)는 서류상의 표현에 의존하므로 평가 신뢰도('상', '중상', '중', '하', '불충분')를 명확하게 매겨야 합니다. 
   - '상' (직접적/반복적 근거 검증됨)
   - '중상' (명확한 근거 1건 이상 있음)
   - '중' (유관 근거 있으나 직접성 보통)
   - '하' (근거가 연약하거나 단순 정황 추정 위주)
   - '불충분' / '[근거 부족]' (설명 기반 근거가 거의 없음)
4. 자격/경력 매칭 및 실무 대처 검증: 실무(상담, 행정, 발굴) 멀티태스킹을 지치지 않고 오래 해낼 인성을 보아야 합니다. 행정 기피 성향, 민원 스트레스 극복력 부재 등 우려되는 요소를 면접에서 캐낼 수 있도록 '날카로운 면접 추천 질문'을 반드시 도출하십시오.
5. 개인정보 보호: 출력되는 JSON 및 텍스트 데이터의 지원자명이나 개인식별정보는 민감정보 유출 방지를 위해 성 뒤에 마스킹 처리(예: "홍길동" -> "홍*동", "김민수" -> "김*수")하여 제공해 주십시오.

각 지원자에 대해 아래 JSON 스키마 형식의 배열 객체로 답해 주십시오.
JSON 외에는 일체의 서두나 후미 설명, 코드 블록 백틱 등을 포함하지 말고, 오직 순수한 유효 JSON 데이터만을 반환하십시오.

[필요 출력 스키마 형식]
[
  {
    "originalIndex": 0, // 입력 받은 후보자의 순번 (0-based)
    "maskedName": "홍*동", // 반드시 성 뒤를 마스킹 처리한 이름이어야 함 (예: 김*아, 최*석)
    "oneLineReview": "일선 상담 경험이 풍부하고 회복탄력성이 돋보이나 국가사업 회계 정산 경험이 다소 비어 보임",
    "scores": {
      "firstStage": {
        "competency": 85, // 직무전문성 원점수 (0~100점)
        "competencyEvidence": "일자리센터 3년 근무, 직업상담사 2급 보유 명시",
        "admin": 70, // 행정실무 원점수 (0~100점)
        "adminEvidence": "[근거 부족] 일반 문서 작성은 가능하나 국고 보조금 시스템 사용 이력은 언급 안 됨",
        "networking": 60, // 구인개척 원점수 (0~100점)
        "networkingEvidence": "기업 관리 활동 근거는 연약하나 홍보지 배부 경력 있음"
      },
      "secondStage": {
        "civilComplaint": 90, // 민원응대/태도 원점수 (0~100점)
        "civilComplaintConfidence": "중상", // '상' | '중상' | '중' | '하' | '불충분'
        "civilComplaintEvidence": "민원 극복 에세이가 매우 구체적으로 기술됨",
        
        "collaborationOrLeadership": 80, // 가치관·협업 (팀장인 경우 리더십·가치관·협업) 원점수 (0~100점)
        "collaborationOrLeadershipConfidence": "중", // '상' | '중상' | '중' | '하' | '불충분'
        "collaborationOrLeadershipEvidence": "공동 워크숍 추진 실적이 있으나 리더 역할은 단편적임"
      }
    },
    "summaries": {
      "qualificationAndExperience": "직업상담원 3년 경력 및 유관 자격 보유 상태로 즉시 투입에 유리함",
      "adminAndNetworking": "정부 예산 보조금 처리 및 기업 네트워킹은 기초적 수준으로 OJT 필요함",
      "missionAndTalent": "새일센터의 경력단절 여성 재취업 지원 미션에 강한 유치 의지와 사명감을 표현함",
      "complaintAndCollaboration": "고객 거부감 극복 역량이 뛰어나며, 팀 소통 시 경청형 태도를 보임"
    },
    "strengthsAndWeaknesses": {
      "strength": "직무 이해도가 높고 일선 구직상담 경력이 직접적이며 태도가 공감 지향적임",
      "weakness": "정부지정사업 행정 문서 기안 및 정산 보고 실무 공백 우려(근거 부족)"
    },
    "interviewQuestions": {
      "jobAndAdmin": "이전 일자리센터 재직 당시 분기별 성과 정산이나 e-나라도움 같은 정부 보조금 시스템을 실무에 적용해본 수준과 한계를 설명해 주십시오.",
      "complaintAndCulture": "지원서에 기술된 '악성 민원 중재 사례' 외에, 심리적으로 매우 완강하거나 자포자기 상태인 장기 경단 여성 군의 취업 극복 상담 시 본인이 취할 구체적 극복 방안은 무엇입니까?",
      "insufficientOrMissingConfirm": "자기소개서에 나타난 보조금 기획 및 정산 역량 [근거 부족] 항목과 관련하여, 실제로 공공 예산을 직접 기획/집행 및 회계 감사에 대처한 구체적 에피소드가 있다면 입증해 주십시오."
    },
    "overallConfidence": "중상" // 2차 전체 만족도를 고려한 종합평가 신뢰도 ('상' | '중상' | '중' | '하' | '불충분')
  }
]
`;

    // Execute server-side Gemini 3.5 Flash Content Generation
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.1, // 보수적이고 합리적인 점수 배분을 위해 온도를 낮게 조정
      },
    });

    const resultText = response.text || "[]";
    const parsedData = JSON.parse(resultText.trim());

    res.json({ success: true, evaluations: parsedData });
  } catch (error: any) {
    console.error("Gemini 분석 중 에러 발생:", error);
    res.status(500).json({ error: error.message || "지원자 정밀 분석 중 오류가 발생하였습니다." });
  }
});

// PDF 문서 텍스트 추출 API 엔드포인트
app.post("/api/extract-pdf", async (req, res) => {
  try {
    const { base64Pdf } = req.body;
    if (!base64Pdf) {
      return res.status(400).json({ error: "PDF base64 데이터가 전달되지 않았습니다." });
    }

    const pdfBuffer = Buffer.from(base64Pdf, "base64");
    
    // pdf-parse를 통해 텍스트 취합
    const data = await pdf(pdfBuffer);
    
    res.json({
      success: true,
      text: data.text || "",
      numpages: data.numpages || 1,
    });
  } catch (error: any) {
    console.error("PDF Parsing Error:", error);
    res.status(500).json({ error: error.message || "PDF 텍스트 추출 도중 오류가 발생했습니다." });
  }
});

// Vite middleware development / Production setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Saeil Recruitment Analyzer] Server booted at port ${PORT}`);
  });
}

startServer();
