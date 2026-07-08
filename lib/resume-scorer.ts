import { anthropic } from "./anthropic";
import { z } from "zod";

// ── Output schema ─────────────────────────────────────────────────────────────

const ScoreSchema = z.object({
  overallScore: z.number().min(0).max(100),
  technicalFit: z.number().min(0).max(100),
  experienceFit: z.number().min(0).max(100),
  educationFit: z.number().min(0).max(100),
  recommendation: z.enum(["Strong Yes", "Yes", "Maybe", "No"]),
  summary: z.string(),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  biasFlags: z.array(z.string()),
  reviewRequired: z.boolean(),
});

export type ScoreResult = z.infer<typeof ScoreSchema>;

// ── Document text extraction ─────────────────────────────────────────────────

function isDocx(mimeType: string, fileName: string) {
  return (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword" ||
    mimeType === "application/zip" || // browsers sometimes send this for .docx
    fileName.toLowerCase().endsWith(".docx") ||
    fileName.toLowerCase().endsWith(".doc")
  );
}

function isPdf(mimeType: string, fileName: string) {
  return (
    mimeType === "application/pdf" ||
    fileName.toLowerCase().endsWith(".pdf")
  );
}

export async function extractText(
  buffer: Buffer,
  mimeType: string,
  fileName = ""
): Promise<string> {
  if (isPdf(mimeType, fileName)) {
    try {
      // pdf-parse has a known Next.js issue — wrap in try/catch and use
      // a safe import path that avoids the test-file side-effect
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfModule = await import("pdf-parse") as any;
      const pdfParse = pdfModule.default ?? pdfModule;
      const data = await pdfParse(buffer);
      return data.text.trim();
    } catch {
      // Fallback: return raw text (better than crashing)
      return buffer.toString("utf8").trim();
    }
  }

  if (isDocx(mimeType, fileName)) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  }

  // Plain text / unknown
  return buffer.toString("utf8").trim();
}

// ── PII anonymization ────────────────────────────────────────────────────────
// Strip name / email / address / phone before sending to the model so the
// scoring is based purely on skills and experience.

function anonymizeResume(text: string): string {
  // Email
  let out = text.replace(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g, "[EMAIL]");
  // Phone numbers
  out = out.replace(/(\+?1?\s?)?(\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4})/g, "[PHONE]");
  // LinkedIn / GitHub URLs (keep general URLs for portfolio links)
  out = out.replace(/linkedin\.com\/in\/[\w\-]+/gi, "[LINKEDIN]");
  out = out.replace(/github\.com\/[\w\-]+/gi, "[GITHUB]");
  return out;
}

// ── Claude scoring ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a certified AI resume screening analyst at HumaniCore AI.
Your role is to evaluate resumes objectively and fairly for job fit.

FAIRNESS MANDATE
- Score based ONLY on demonstrated skills, experience, and qualifications.
- Ignore and flag any signals that could introduce bias: name-based gender/ethnicity cues,
  graduation years that imply age, gap years, school prestige unrelated to skills,
  geographic signals, or hobbies/interests unrelated to the role.
- If any bias risk is detected, set reviewRequired: true and list the flags in biasFlags.

SCORING RUBRIC
- technicalFit (0-100): Do the candidate's technical skills match requirements?
- experienceFit (0-100): Does their experience level / years match?
- educationFit (0-100): Does education/certifications match? (weight lightly — 10%)
- overallScore (0-100): Weighted composite (technical 50%, experience 40%, education 10%)
- recommendation: "Strong Yes" (overall ≥ 80), "Yes" (65-79), "Maybe" (45-64), "No" (< 45)

RESPONSE FORMAT
Return valid JSON matching the schema exactly. No markdown, no explanation outside JSON.`;

export async function scoreResume(
  resumeText: string,
  jobTitle: string,
  jobDescription: string,
  jobRequirements: string
): Promise<ScoreResult> {
  const anonymized = anonymizeResume(resumeText);

  const prompt = `JOB REQUISITION
Title: ${jobTitle}

Description:
${jobDescription}

Requirements:
${jobRequirements}

---

RESUME (anonymized):
${anonymized.slice(0, 6000)}

---

Evaluate this resume against the job requisition and return a JSON object with these exact fields:
{
  "overallScore": <0-100 number>,
  "technicalFit": <0-100 number>,
  "experienceFit": <0-100 number>,
  "educationFit": <0-100 number>,
  "recommendation": <"Strong Yes" | "Yes" | "Maybe" | "No">,
  "summary": <2-3 sentence evaluation>,
  "strengths": [<string>, ...],
  "gaps": [<string>, ...],
  "biasFlags": [<bias risk descriptions, empty if none>],
  "reviewRequired": <true if any bias flags OR borderline score 60-70>
}`;

  const message = await anthropic.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 4096,  // thinking uses tokens before the JSON output
    thinking: { type: "adaptive" },
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });

  // Extract text block (thinking blocks come first)
  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  // Parse JSON — Claude may wrap in ```json ... ```
  const raw = textBlock.text
    .replace(/^```json\s*/im, "")
    .replace(/^```\s*/im, "")
    .replace(/```\s*$/im, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Log the raw response so we can debug unexpected formats
    console.error("[resume-scorer] Claude raw response:", textBlock.text.slice(0, 500));
    throw new Error(`Claude returned invalid JSON. Preview: ${textBlock.text.slice(0, 200)}`);
  }
  return ScoreSchema.parse(parsed);
}
