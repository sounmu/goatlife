export const appConfig = {
  name: "GOAT.MORNING",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  bank: {
    name: process.env.BANK_NAME ?? "국민은행",
    account: process.env.BANK_ACCOUNT ?? "123456-12-123456",
    holder: process.env.BANK_HOLDER ?? "홍길동",
  },
  sessionDays: Number(process.env.PARTICIPANT_SESSION_DAYS ?? 90),
  tokenDays: Number(process.env.PARTICIPANT_TOKEN_DAYS ?? 30),
  maxUploadBytes: 1024 * 1024,
  proofBucket: "proof-images",
} as const;

export function isSupabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
