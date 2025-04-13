import { Separator } from "@/components/ui/separator";

type SponsorshipLayoutProps = {
  children: React.ReactNode;
  list: React.ReactNode;
  detail: React.ReactNode;
};

export default function SponsorshipLayout({
  children,
  list,
  detail,
}: SponsorshipLayoutProps) {
  return (
    <div className="mx-auto space-y-4 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 space-y-2 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Sponsor me</h1>
          <p className="text-muted-foreground text-lg">
            Search for company sponsorship information in the UK
          </p>
          {children}
        </div>
      </div>
      <Separator className="my-8" />
      <div className="flex space-x-4">
        <div className="flex-1">{list}</div>
        <div className="flex-1">{detail}</div>
      </div>
    </div>
  );
}
