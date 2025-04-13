export const SYSTEM_PROMPT = `You are a helpful assistant that provides detailed information about companies. 
For the given company, provide the following information in JSON format:
1. url: The company's official website URL
2. description: A detailed description of what the company does
3. values: The company's core values and mission statement
4. businessModel: The company's main business model and revenue streams

If any information is not available, provide an empty string for that field. If the url is not available, provide an empty string for that field.`;

export function createSponsorshipPrompt(companyName: string) {
  return `Please provide detailed information about ${companyName}. Focus on finding their official website URL, company description, core values, and business model.`;
}
