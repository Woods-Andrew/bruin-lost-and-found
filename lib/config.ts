function trim(value: string | undefined) {
  return value?.trim() || "";
}

export const config = {
  supabaseUrl: trim(process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: trim(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  supabaseServiceRoleKey: trim(process.env.SUPABASE_SERVICE_ROLE_KEY),
  allowedEmailDomains: (process.env.ALLOWED_EMAIL_DOMAINS || "ucla.edu")
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean),
  staffEmails: (process.env.STAFF_EMAILS || "staff@ucla.edu,lostandfound@ucla.edu")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
  sessionSecret: trim(process.env.SESSION_SECRET) || "demo-insecure-session-secret",
  visionUrl: trim(process.env.QWEN_VISION_URL),
  visionModel: trim(process.env.QWEN_VISION_MODEL) || "Qwen3-VL",
  embeddingUrl: trim(process.env.QWEN_EMBEDDING_URL),
  embeddingModel:
    trim(process.env.QWEN_EMBEDDING_MODEL) || "Qwen3-VL-Embedding",
  rerankUrl: trim(process.env.QWEN_RERANK_URL),
  rerankModel: trim(process.env.QWEN_RERANK_MODEL) || "Qwen3-VL-Reranker",
  qwenApiKey: trim(process.env.QWEN_API_KEY),
  embeddingDim: Number(process.env.EMBEDDING_DIM || 1024),
};

export function supabaseConfigured() {
  return Boolean(
    config.supabaseUrl &&
      config.supabaseAnonKey &&
      config.supabaseServiceRoleKey,
  );
}

export function visionConfigured() {
  return Boolean(config.visionUrl && config.qwenApiKey);
}

export function embeddingConfigured() {
  return Boolean(config.embeddingUrl && config.qwenApiKey);
}

export function rerankConfigured() {
  return Boolean(config.rerankUrl && config.qwenApiKey);
}

export function isAllowedEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  return config.allowedEmailDomains.some((domain) =>
    normalized.endsWith(`@${domain}`),
  );
}

export function isStaffEmail(email: string) {
  return config.staffEmails.includes(email.trim().toLowerCase());
}

export function modeLabels() {
  const database = supabaseConfigured() ? "supabase" : "demo";
  const vision = visionConfigured() ? "qwen" : "mock";
  const matching = embeddingConfigured() ? "qwen" : "mock";
  const rerank = rerankConfigured() ? "qwen" : "skipped";
  return { database, vision, matching, rerank };
}
