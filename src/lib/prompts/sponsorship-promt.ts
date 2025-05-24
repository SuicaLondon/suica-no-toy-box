export const SYSTEM_PROMPT = `You are a helpful assistant that searches and concludes the information about companies from the internet.`;

export function createCompanyUrlPrompt(companyName: string) {
  return `Please provide the official website URL for ${companyName}, if it exists, only return the URL, if it does not exist, return nothing.`;
}

export function createSponsorshipPrompt(
  companyName: string,
  url: string | undefined,
) {
  if (url) {
    return `Please provide detailed information about ${companyName} from ${url}, company description, core values, and business model.`;
  }
  return `Please provide detailed information about ${companyName}, company description, core values, and business model from the internet. for example, https://find-and-update.company-information.service.gov.uk/`;
}
