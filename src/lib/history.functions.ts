import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const saveInput = z.object({
  jobTitle: z.string().max(200).nullable(),
  company: z.string().max(200).nullable(),
  jobText: z.string().max(15000),
  resumeOriginalText: z.string().max(15000),
  mode: z.enum(["geral", "tecnologia", "primeiro_emprego"]),
  scoreBefore: z.number().int().min(0).max(100),
  scoreAfter: z.number().int().min(0).max(100),
  keywordsFound: z.array(z.unknown()),
  keywordsMissing: z.array(z.unknown()),
  userDeclaredItems: z.array(z.unknown()),
  resumeGenerated: z.unknown(),
  fidelityFlags: z.array(z.unknown()),
  changes: z.array(z.unknown()),
  versionGroupId: z.string().uuid().nullable(),
});

export const saveAnalysis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => saveInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    let versionGroupId = data.versionGroupId;
    let versionNumber = 1;
    if (versionGroupId) {
      const { data: rows } = await supabase
        .from("analyses")
        .select("version_number")
        .eq("version_group_id", versionGroupId)
        .order("version_number", { ascending: false })
        .limit(1);
      if (rows && rows.length > 0) versionNumber = (rows[0]!.version_number as number) + 1;
      else versionGroupId = null;
    }
    if (!versionGroupId) versionGroupId = crypto.randomUUID();

    const { data: inserted, error } = await supabase
      .from("analyses")
      .insert({
        user_id: userId,
        job_title: data.jobTitle,
        company: data.company,
        job_text: data.jobText,
        resume_original_text: data.resumeOriginalText,
        mode: data.mode,
        score_before: data.scoreBefore,
        score_after: data.scoreAfter,
        keywords_found: data.keywordsFound as never,
        keywords_missing: data.keywordsMissing as never,
        user_declared_items: data.userDeclaredItems as never,
        resume_generated: data.resumeGenerated as never,
        fidelity_flags: data.fidelityFlags as never,
        changes: data.changes as never,
        version_group_id: versionGroupId,
        version_number: versionNumber,
      })
      .select("id, version_group_id, version_number")
      .single();
    if (error) throw new Error("Não foi possível salvar a análise.");
    return inserted;
  });

export const listAnalyses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("analyses")
      .select("id, job_title, company, mode, score_before, score_after, version_group_id, version_number, created_at, keywords_found, keywords_missing")
      .order("created_at", { ascending: false });
    if (error) throw new Error("Não foi possível carregar o histórico.");
    return data;
  });

const idInput = z.object({ id: z.string().uuid() });

export const getAnalysis = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => idInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("analyses")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error || !row) throw new Error("Análise não encontrada.");
    return row;
  });

export const deleteAnalysis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => idInput.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("analyses").delete().eq("id", data.id);
    if (error) throw new Error("Não foi possível excluir a análise.");
    return { ok: true };
  });

export const deleteAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await supabase.from("analyses").delete().eq("user_id", userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw new Error("Não foi possível excluir a conta.");
    return { ok: true };
  });
