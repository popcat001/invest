"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { researchCompany, type AiResearchProvider } from "@/lib/ai-research";
import { createMonthlyReview, exportCompany, exportMonthlyReview, saveAiResearch, saveCompany, savePosition, saveResearch } from "@/lib/db";

export async function upsertCompanyAction(formData: FormData) {
  const id = saveCompany(formData);
  revalidatePath("/");
  revalidatePath("/research");
  redirect(`/research/${id}`);
}

export async function upsertResearchAction(formData: FormData) {
  const companyId = Number(formData.get("companyId"));
  saveResearch(formData);
  revalidatePath("/");
  revalidatePath("/research");
  revalidatePath(`/research/${companyId}`);
  redirect(`/research/${companyId}`);
}

export async function upsertPositionAction(formData: FormData) {
  savePosition(formData);
  revalidatePath("/");
  revalidatePath("/portfolio");
  revalidatePath("/research");
}

export async function createMonthlyReviewAction(formData: FormData) {
  createMonthlyReview(formData);
  revalidatePath("/");
  revalidatePath("/monthly");
  redirect("/monthly");
}

export async function exportCompanyAction(formData: FormData) {
  const id = Number(formData.get("id"));
  exportCompany(id);
  revalidatePath(`/research/${id}`);
}

export async function exportMonthlyReviewAction(formData: FormData) {
  const id = Number(formData.get("id"));
  exportMonthlyReview(id);
  revalidatePath("/monthly");
}

export async function runAiResearchAction(formData: FormData) {
  const query = String(formData.get("query") ?? "").trim();
  const provider = String(formData.get("provider") ?? "openai") as AiResearchProvider;
  if (!query) redirect("/research/ai?error=Enter%20a%20company%20name%20or%20ticker.");

  let companyId: number;
  try {
    const result = await researchCompany(query, provider);
    companyId = saveAiResearch(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI research failed.";
    redirect(`/research/ai?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/");
  revalidatePath("/research");
  revalidatePath(`/research/${companyId}`);
  redirect(`/research/${companyId}`);
}
