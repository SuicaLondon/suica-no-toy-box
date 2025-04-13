type SponsorListNotFoundProps = {
  companyName: string;
};

export default function SponsorListNotFound({
  companyName,
}: SponsorListNotFoundProps) {
  return (
    <div className="py-8 text-center">
      <p className="text-muted-foreground">
        No results found for {companyName}
      </p>
    </div>
  );
}
