import * as z from "zod";

export const sponsorSearchSchema = z.object({
  companyName: z.string().min(1, "Please enter a company name"),
});

export type SponsorSearchFormValues = z.infer<typeof sponsorSearchSchema>;
