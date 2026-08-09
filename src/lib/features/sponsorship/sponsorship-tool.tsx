"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSponsorshipDetail } from "@/hooks/use-sponsorship-detail";
import { useSponsorshipSearch } from "@/hooks/use-sponsorship-search";
import { useToolI18n } from "@/i18n/tool-i18n";
import { LoaderCircle, Search } from "lucide-react";
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
      <section className="border-toy-line text-toy-text rounded-[2px] border bg-[color-mix(in_srgb,var(--toy-bg)_96%,transparent)] p-6 max-[767px]:p-[18px]">
        <form onSubmit={handleSearch} className="grid gap-[9px]" role="search">
          <label
            className="text-toy-muted font-mono text-[0.6875rem] font-medium tracking-[0.12em] uppercase"
            htmlFor="company-name"
          >
            {content.searchLabel}
          </label>
          <div className="flex flex-wrap items-center gap-2.5 max-[767px]:w-full max-[767px]:[&>*]:grow">
            <Input
              id="company-name"
              className="border-toy-line-strong text-toy-text placeholder:text-toy-muted/75 focus-visible:border-toy-accent focus-visible:ring-toy-accent min-h-12 min-w-0 flex-[1_1_14rem] rounded-[2px] bg-transparent px-3.5 shadow-none focus-visible:ring-1 focus-visible:ring-offset-2"
              value={draftCompanyName}
              placeholder={content.searchPlaceholder}
              autoComplete="organization"
              aria-invalid={Boolean(validationError)}
              aria-describedby={
                validationError ? "company-name-error" : undefined
              }
              onChange={(event) => {
                setDraftCompanyName(event.target.value);
                setValidationError("");
              }}
            />
            <Button
              type="submit"
              className="border-toy-accent bg-toy-accent text-toy-bg hover:text-toy-bg min-h-11 rounded-[2px] border font-mono text-xs tracking-[0.08em] uppercase shadow-none hover:bg-[color-mix(in_srgb,var(--toy-accent)_88%,var(--toy-text))] max-[520px]:w-full"
              disabled={isSearchFetching}
            >
              {isSearchFetching ? (
                <LoaderCircle
                  className="animate-toy-spin size-[18px] shrink-0 motion-reduce:animate-none"
                  aria-hidden="true"
                />
              ) : (
                <Search aria-hidden="true" />
              )}
              {isSearchFetching ? common.loading : content.searchAction}
            </Button>
          </div>
          {validationError ? (
            <p
              id="company-name-error"
              className="text-toy-error m-0 text-[0.8125rem] leading-[1.45]"
            >
              {validationError}
            </p>
          ) : null}
        </form>
      </section>

      <div className="grid grid-cols-2 gap-3.5 max-[1100px]:grid-cols-1">
        <section
          className="border-toy-line text-toy-text rounded-[2px] border bg-[color-mix(in_srgb,var(--toy-bg)_96%,transparent)] p-6 max-[767px]:p-[18px]"
          aria-live="polite"
          aria-busy={isSearchFetching}
        >
          <div className="border-toy-line mb-[22px] flex items-start justify-between gap-5 border-b pb-[18px] max-[520px]:flex-col max-[520px]:items-stretch">
            <div>
              <span className="text-toy-accent font-mono text-[0.6875rem] font-medium tracking-[0.12em] uppercase">
                {content.results}
              </span>
              <h2 className="mt-1.5 text-xl leading-tight font-semibold">
                {content.resultCount(results?.length ?? 0)}
              </h2>
            </div>
          </div>

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
                <button
                  key={company.id}
                  type="button"
                  className="border-toy-line hover:border-toy-accent hover:bg-toy-hover data-[selected=true]:border-toy-accent data-[selected=true]:bg-toy-hover grid w-full gap-3 rounded-[2px] border bg-transparent p-[18px] text-left text-inherit transition-colors duration-[180ms] motion-reduce:transition-none [&_h3]:m-0 [&_h3]:text-base [&_h3]:font-semibold"
                  data-selected={selectedCompanyId === company.id}
                  aria-pressed={selectedCompanyId === company.id}
                  aria-controls="sponsorship-company-detail"
                  onClick={() => selectCompany(company.id)}
                >
                  <h3>{company.name}</h3>
                  <div className="flex flex-wrap gap-[7px]">
                    <span className="border-toy-line text-toy-muted border px-[7px] py-1 font-mono text-[0.6875rem] tracking-[0.04em]">
                      {content.location}:{" "}
                      {[company.city, company.county]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                    <span className="border-toy-line text-toy-muted border px-[7px] py-1 font-mono text-[0.6875rem] tracking-[0.04em]">
                      {content.type}: {company.type}
                    </span>
                    <span className="border-toy-line text-toy-muted border px-[7px] py-1 font-mono text-[0.6875rem] tracking-[0.04em]">
                      {content.rating}: {company.rate}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              index="00"
              title={content.noResults(companyName)}
              description={content.startDescription}
            />
          )}
        </section>

        <section
          id="sponsorship-company-detail"
          className="border-toy-line text-toy-text rounded-[2px] border bg-[color-mix(in_srgb,var(--toy-bg)_96%,transparent)] p-6 max-[767px]:p-[18px]"
          aria-live="polite"
          aria-busy={isDetailFetching}
        >
          <div className="border-toy-line mb-[22px] flex items-start justify-between gap-5 border-b pb-[18px] max-[520px]:flex-col max-[520px]:items-stretch">
            <div>
              <span className="text-toy-accent font-mono text-[0.6875rem] font-medium tracking-[0.12em] uppercase">
                {content.companyDetails}
              </span>
              <h2 className="mt-1.5 text-xl leading-tight font-semibold">
                {companyDetail?.name ?? content.selectCompany}
              </h2>
            </div>
          </div>

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
        </section>
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
    <div className="border-toy-line-strong [&_p]:text-toy-muted flex min-h-60 items-center justify-center border border-dashed px-7 py-12 text-center [&_h3]:mt-2.5 [&_h3]:text-xl [&_h3]:font-semibold [&_p]:mx-auto [&_p]:mt-2.5 [&_p]:max-w-[430px] [&_p]:text-sm [&_p]:leading-[1.6]">
      <div>
        <span className="text-toy-accent font-mono text-[0.6875rem] font-medium tracking-[0.12em] uppercase">
          {index}
        </span>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

interface LoadingStateProps {
  label: string;
}

function LoadingState({ label }: LoadingStateProps) {
  return (
    <div
      className="border-toy-line-strong grid min-h-60 content-center gap-5 border border-dashed bg-[color-mix(in_srgb,var(--toy-accent)_4%,transparent)] p-6"
      role="status"
    >
      <div className="text-toy-accent inline-flex items-center gap-[9px] justify-self-center font-mono text-xs font-semibold tracking-[0.08em] uppercase">
        <LoaderCircle
          className="animate-toy-spin size-[18px] shrink-0 motion-reduce:animate-none"
          aria-hidden="true"
        />
        <span>{label}</span>
      </div>
      <div className="grid gap-2.5" aria-hidden="true">
        <LoadingBlock />
        <LoadingBlock />
        <LoadingBlock />
      </div>
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  retryLabel: string;
  onRetry: () => void;
}

function ErrorState({ message, retryLabel, onRetry }: ErrorStateProps) {
  return (
    <div className="border-toy-line-strong flex min-h-60 items-center justify-center border border-dashed px-7 py-12 text-center [&_button]:mt-[18px] [&_h3]:mt-2.5 [&_h3]:text-xl [&_h3]:font-semibold">
      <div>
        <span className="text-toy-accent font-mono text-[0.6875rem] font-medium tracking-[0.12em] uppercase">
          !
        </span>
        <h3>{message}</h3>
        <Button
          type="button"
          className="border-toy-line-strong text-toy-text hover:bg-toy-hover hover:text-toy-accent min-h-10 rounded-[2px] bg-transparent font-mono text-xs tracking-[0.08em] uppercase shadow-none max-[520px]:w-full"
          onClick={onRetry}
        >
          {retryLabel}
        </Button>
      </div>
    </div>
  );
}

function LoadingBlock() {
  return (
    <div className="animate-toy-loading border-toy-line min-h-[54px] border bg-[linear-gradient(90deg,color-mix(in_srgb,var(--toy-text)_5%,transparent)_20%,color-mix(in_srgb,var(--toy-accent)_18%,transparent)_50%,color-mix(in_srgb,var(--toy-text)_5%,transparent)_80%)] bg-[length:200%_100%] motion-reduce:animate-none" />
  );
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
