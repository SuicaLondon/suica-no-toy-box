export const SYSTEM_PROMPT = `You are a helpful assistant that provides detailed information about companies.`;

export function createSponsorshipPrompt(companyName: string) {
  return `Please provide detailed information about ${companyName}. Focus on finding their official website URL, company description, core values, and business model.`;
}
