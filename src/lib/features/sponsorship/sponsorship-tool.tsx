"use client";

import { Card } from "suica-ui/card";

import { SectionHeading } from "suica-ui/section-heading";
import { Alert } from "suica-ui/alert";
import { Badge } from "suica-ui/badge";
import { Skeleton } from "suica-ui/skeleton";
import { LoadingIndicator } from "suica-ui/loading-indicator";
import { Spinner } from "suica-ui/spinner";

import { Field } from "suica-ui/field";

import { Button } from "suica-ui/button";
import { Input } from "suica-ui/input";
import { useSponsorshipDetail } from "@/hooks/use-sponsorship-detail";
import { useSponsorshipSearch } from "@/hooks/use-sponsorship-search";
import { useToolI18n } from "@/i18n/tool-i18n";
import { Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";

interface SponsorshipToolProps {
  companyName: string;
  selectedCompanyId: string;
}

export function SponsorshipTool({
  companyName,
  selectedCompanyId,
}: SponsorshipToolProps) {
  const { copy } = useToolI18n();
  const content = copy.sponsorship;
  const common = copy.common;
  const pathname = usePathname();
  const router = useRouter();
  const [draftCompanyName, setDraftCompanyName] = useState(companyName);
  const [validationError, setValidationError] = useState("");
  const {
    data: results,
    isError: isSearchError,
    isFetching: isSearchFetching,
    refetch: retrySearch,
  } = useSponsorshipSearch(companyName);
  const {
    data: companyDetail,
    isError: isDetailError,
    isFetching: isDetailFetching,
    refetch: retryDetail,
  } = useSponsorshipDetail(selectedCompanyId || null);

  useEffect(() => {
    setDraftCompanyName(companyName);
    setValidationError("");
  }, [companyName]);

  function navigate(params: URLSearchParams) {
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextCompanyName = draftCompanyName.trim();
    if (!nextCompanyName) {
      setValidationError(content.required);
      return;
    }

    const params = new URLSearchParams();
    params.set("companyName", nextCompanyName);
    navigate(params);
  }

  function selectCompany(companyId: string) {
    const params = new URLSearchParams();
    params.set("companyName", companyName);
    params.set("selectedCompanyId", companyId);
    navigate(params);
  }

  return (
    <div className="mt-5 grid gap-3.5 max-[767px]:mt-[18px]">
      <Card className="p-6 max-[767px]:p-[18px]">
        <form onSubmit={handleSearch} className="grid gap-[9px]" role="search">
          <div className="flex flex-wrap items-end gap-2.5 max-[767px]:w-full max-[767px]:[&>*]:grow">
            <Field
              label={content.searchLabel}
              error={validationError || undefined}
              className="min-w-0 flex-[1_1_14rem]"
            >
              <Input
                id="company-name"
                className="min-h-12 w-full min-w-0 px-3.5"
                value={draftCompanyName}
                placeholder={content.searchPlaceholder}
                autoComplete="organization"
                aria-invalid={Boolean(validationError)}
                onChange={(event) => {
                  setDraftCompanyName(event.target.value);
                  setValidationError("");
                }}
              />
            </Field>
            <Button
              type="submit"
              className="min-h-11 font-mono text-xs tracking-[0.08em] uppercase max-[520px]:w-full"
              disabled={isSearchFetching}
            >
              {isSearchFetching ? (
                <Spinner
                  label={common.loading}
                  className="size-[18px] shrink-0 motion-reduce:animate-none"
                  aria-hidden="true"
                />
              ) : (
                <Search aria-hidden="true" />
              )}
              {isSearchFetching ? common.loading : content.searchAction}
            </Button>
          </div>
        </form>
      </Card>

      <div className="grid grid-cols-2 gap-3.5 max-[1100px]:grid-cols-1">
        <Card
          className="p-6 max-[767px]:p-[18px]"
          aria-live="polite"
          aria-busy={isSearchFetching}
        >
          <SectionHeading
            titleId="sponsorship-results-title"
            eyebrow={content.results}
            title={content.resultCount(results?.length ?? 0)}
            description={null}
            className="border-line mb-5 flex-col items-start gap-1.5 border-b px-0 pb-4 [&_h2]:shrink [&_h2]:break-words"
          />

          {!companyName ? (
            <EmptyState
              index="01"
              title={content.startTitle}
              description={content.startDescription}
            />
          ) : isSearchFetching ? (
            <LoadingState label={common.loading} />
          ) : isSearchError ? (
            <ErrorState
              message={content.searchError}
              retryLabel={common.retry}
              onRetry={() => void retrySearch()}
            />
          ) : results?.length ? (
            <div className="grid gap-2.5">
              {results.map((company) => (
                <Button
                  variant="ghost"
                  key={company.id}
                  type="button"
                  className="border-toy-line hover:border-toy-accent hover:bg-toy-hover data-[selected=true]:border-toy-accent data-[selected=true]:bg-toy-hover grid w-full justify-stretch gap-3 rounded-[2px] border bg-transparent p-[18px] text-left whitespace-normal text-inherit transition-colors duration-[180ms] motion-reduce:transition-none [&_h3]:m-0 [&_h3]:text-base [&_h3]:font-semibold"
                  data-selected={selectedCompanyId === company.id}
                  aria-pressed={selectedCompanyId === company.id}
                  aria-controls="sponsorship-company-detail"
                  onClick={() => selectCompany(company.id)}
                >
                  <h3>{company.name}</h3>
                  <div className="flex flex-wrap gap-[7px]">
                    <Badge variant="outline" className="whitespace-normal">
                      {content.location}:{" "}
                      {[company.city, company.county]
                        .filter(Boolean)
                        .join(", ")}
                    </Badge>
                    <Badge variant="outline" className="whitespace-normal">
                      {content.type}: {company.type}
                    </Badge>
                    <Badge variant="outline" className="whitespace-normal">
                      {content.rating}: {company.rate}
                    </Badge>
                  </div>
                </Button>
              ))}
            </div>
          ) : (
            <EmptyState
              index="00"
              title={content.noResults(companyName)}
              description={content.startDescription}
            />
          )}
        </Card>

        <Card
          id="sponsorship-company-detail"
          className="p-6 max-[767px]:p-[18px]"
          aria-live="polite"
          aria-busy={isDetailFetching}
        >
          <SectionHeading
            titleId="sponsorship-details-title"
            eyebrow={content.companyDetails}
            title={companyDetail?.name ?? content.selectCompany}
            description={null}
            className="border-line mb-5 flex-col items-start gap-1.5 border-b px-0 pb-4 [&_h2]:shrink [&_h2]:break-words"
          />

          {!selectedCompanyId ? (
            <EmptyState
              index="02"
              title={content.companyDetails}
              description={content.selectCompany}
            />
          ) : isDetailFetching ? (
            <LoadingState label={common.loading} />
          ) : isDetailError ? (
            <ErrorState
              message={content.detailError}
              retryLabel={common.retry}
              onRetry={() => void retryDetail()}
            />
          ) : companyDetail ? (
            <div className="[&_section]:border-toy-line [&_h3]:text-toy-muted [&_p]:text-toy-text [&_a]:text-toy-accent grid gap-[22px] [&_a]:m-0 [&_a]:text-[0.9375rem] [&_a]:leading-[1.65] [&_a]:[overflow-wrap:anywhere] [&_a]:underline [&_a]:underline-offset-4 [&_h3]:mb-2 [&_h3]:font-mono [&_h3]:text-[0.6875rem] [&_h3]:font-medium [&_h3]:tracking-[0.1em] [&_h3]:uppercase [&_p]:m-0 [&_p]:text-[0.9375rem] [&_p]:leading-[1.65] [&_p]:[overflow-wrap:anywhere] [&_section]:border-t [&_section]:pt-[18px] [&_section:first-child]:border-t-0 [&_section:first-child]:pt-0">
              <section>
                <h3>{content.location}</h3>
                <p>
                  {[companyDetail.city, companyDetail.county]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </section>
              <section>
                <h3>{content.type}</h3>
                <p>{companyDetail.type}</p>
              </section>
              <section>
                <h3>{content.rating}</h3>
                <p>{companyDetail.rate}</p>
              </section>
              {companyDetail.hasUrl && companyDetail.url ? (
                <section>
                  <h3>{content.website}</h3>
                  <a
                    href={companyDetail.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {companyDetail.url}
                  </a>
                </section>
              ) : null}
              <DetailSection
                title={content.descriptionLabel}
                value={companyDetail.description}
                fallback={content.detailsNotFound}
              />
              <DetailSection
                title={content.coreValues}
                value={companyDetail.values}
                fallback={content.detailsNotFound}
              />
              <DetailSection
                title={content.businessModel}
                value={companyDetail.businessModel}
                fallback={content.detailsNotFound}
              />
            </div>
          ) : (
            <EmptyState
              index="00"
              title={content.companyDetails}
              description={content.detailsNotFound}
            />
          )}
        </Card>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  index: string;
  title: string;
  description: string;
}

function EmptyState({ index, title, description }: EmptyStateProps) {
  return (
    <Card className="[&_p]:text-toy-muted flex min-h-60 items-center justify-center border-dashed px-7 py-12 text-center [&_h3]:mt-2.5 [&_h3]:text-xl [&_h3]:font-semibold [&_p]:mx-auto [&_p]:mt-2.5 [&_p]:max-w-[430px] [&_p]:text-sm [&_p]:leading-[1.6]">
      <div>
        <span className="text-toy-accent font-mono text-[0.6875rem] font-medium tracking-[0.12em] uppercase">
          {index}
        </span>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </Card>
  );
}

interface LoadingStateProps {
  label: string;
}

function LoadingState({ label }: LoadingStateProps) {
  return (
    <Card
      className="grid min-h-60 content-center gap-5 border-dashed p-6"
      role="status"
    >
      <LoadingIndicator label={label} className="justify-self-center" />
      <div className="grid gap-2.5" aria-hidden="true">
        <LoadingBlock />
        <LoadingBlock />
        <LoadingBlock />
      </div>
    </Card>
  );
}

interface ErrorStateProps {
  message: string;
  retryLabel: string;
  onRetry: () => void;
}

function ErrorState({ message, retryLabel, onRetry }: ErrorStateProps) {
  return (
    <Alert
      variant="danger"
      title={message}
      className="flex-wrap"
      action={
        <Button variant="outline" onClick={onRetry}>
          {retryLabel}
        </Button>
      }
    />
  );
}

function LoadingBlock() {
  return <Skeleton className="min-h-[54px] rounded-[2px]" />;
}

interface DetailSectionProps {
  title: string;
  value: string | null;
  fallback: string;
}

function DetailSection({ title, value, fallback }: DetailSectionProps) {
  return (
    <section>
      <h3>{title}</h3>
      <p>{value || fallback}</p>
    </section>
  );
}
