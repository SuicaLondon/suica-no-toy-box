import { Company } from "@prisma/client";

export type CompanyItem = Omit<
  Company,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "url"
  | "description"
  | "values"
  | "businessModel"
>;

export function parseCompanies(data: string): CompanyItem[] {
  const rows: string[] = data.split("\n").slice(1);
  const companies: CompanyItem[] = [];
  for (let i = 0; i < rows.length; i++) {
    let row = rows[i];
    row = row.replaceAll("\r", "");
    row = row.replaceAll(",,", ',"",');
    const orgInfo = row.split('","');
    if (orgInfo.length == 5) {
      orgInfo[0] = orgInfo[0].replaceAll('"', "");
      orgInfo[4] = orgInfo[4].replaceAll('"', "");
      const company = {
        name: orgInfo[0].trim(),
        city: orgInfo[1].trim(),
        county: orgInfo[2].trim(),
        type: orgInfo[3].trim(),
        rate: orgInfo[4].trim(),
        hasUrl: null,
      };
      companies.push(company);
    }
  }
  return companies;
}
