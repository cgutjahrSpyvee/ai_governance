import { getTenantSession } from "@/lib/session";
import { tenantPrisma } from "@/lib/tenant-prisma";
import { handleHttpError, requireAdmin, HttpError } from "@/lib/rbac";
import { extractText, scoreResume } from "@/lib/resume-scorer";
import { syncHiringFunnel } from "@/lib/screening-integration";

export const maxDuration = 60; // allow up to 60s for Claude scoring

export async function POST(req: Request) {
  try {
    const session = await getTenantSession();
    requireAdmin(session);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const requisitionId = formData.get("requisitionId") as string | null;
    const candidateName = (formData.get("candidateName") as string | null) ?? undefined;
    const candidateEmail = (formData.get("candidateEmail") as string | null) ?? undefined;

    if (!file) throw new HttpError(400, "No file uploaded");
    if (!requisitionId) throw new HttpError(400, "requisitionId is required");

    // Fetch the job requisition
    const db = tenantPrisma(session.organizationId);
    const requisition = await db.jobRequisition.findFirst({
      where: { id: requisitionId },
    });
    if (!requisition) throw new HttpError(404, "Requisition not found");

    // Extract text from the uploaded file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const resumeText = await extractText(buffer, file.type, file.name);

    if (!resumeText || resumeText.length < 50) {
      throw new HttpError(422, "Could not extract readable text from the file");
    }

    // Score with Claude
    const score = await scoreResume(
      resumeText,
      requisition.title,
      requisition.description,
      requisition.requirements
    );

    // Save result
    const result = await db.screeningResult.create({
      data: {
        requisitionId,
        candidateName: candidateName ?? null,
        candidateEmail: candidateEmail ?? null,
        fileName: file.name,
        resumeText: resumeText.slice(0, 20000), // cap stored text
        overallScore: score.overallScore,
        technicalFit: score.technicalFit,
        experienceFit: score.experienceFit,
        educationFit: score.educationFit,
        recommendation: score.recommendation,
        summary: score.summary,
        strengths: JSON.stringify(score.strengths),
        gaps: JSON.stringify(score.gaps),
        biasFlags: JSON.stringify(score.biasFlags),
        reviewRequired: score.reviewRequired,
        status: "Pending",
      } as any,
    });

    // Sync hiring funnel counts after each new screening result
    syncHiringFunnel(db, session.organizationId).catch((e) =>
      console.warn("[integration] syncHiringFunnel failed:", e)
    );

    return Response.json(
      { ...result, strengths: score.strengths, gaps: score.gaps, biasFlags: score.biasFlags },
      { status: 201 }
    );
  } catch (e) {
    // Log full error to Render logs for debugging
    console.error("[screening/upload] error:", e);
    return handleHttpError(e);
  }
}
