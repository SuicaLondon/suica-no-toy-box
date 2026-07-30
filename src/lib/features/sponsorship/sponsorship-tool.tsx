"use client";

import styles from "@/app/tool-shell.module.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSponsorshipDetail } from "@/hooks/use-sponsorship-detail";
import { useSponsorshipSearch } from "@/hooks/use-sponsorship-search";
import { useToolI18n } from "@/i18n/tool-i18n";
import { Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";

type SponsorshipToolProps = {
  companyName: string;
  selectedCompanyId: string;
};

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
    isLoading: isSearchLoading,
    refetch: retrySearch,
  } = useSponsorshipSearch(companyName);
  const {
    data: companyDetail,
    isError: isDetailError,
    isLoading: isDetailLoading,
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
    <div className={`${styles.workspaceBody} ${styles.stack}`}>
      <section className={styles.panel}>
        <form onSubmit={handleSearch} className={styles.field} role="search">
          <label className={styles.fieldLabel} htmlFor="company-name">
            {content.searchLabel}
          </label>
          <div className={styles.toolbarGroup}>
            <Input
              id="company-name"
              className={`${styles.input} ${styles.grow}`}
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
            <Button type="submit" className={styles.primaryButton}>
              <Search aria-hidden="true" />
              {content.searchAction}
            </Button>
          </div>
          {validationError ? (
            <p id="company-name-error" className={styles.errorText}>
              {validationError}
            </p>
          ) : null}
        </form>
      </section>

      <div className={styles.splitGrid}>
        <section className={styles.panel} aria-live="polite">
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.panelLabel}>{content.results}</span>
              <h2 className={styles.panelTitle}>
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
          ) : isSearchLoading ? (
            <LoadingState label={common.loading} />
          ) : isSearchError ? (
            <ErrorState
              message={content.searchError}
              retryLabel={common.retry}
              onRetry={() => void retrySearch()}
            />
          ) : results?.length ? (
            <div className={styles.resultList}>
              {results.map((company) => (
                <button
                  key={company.id}
                  type="button"
                  className={styles.resultItem}
                  data-selected={selectedCompanyId === company.id}
                  aria-pressed={selectedCompanyId === company.id}
                  aria-controls="sponsorship-company-detail"
                  onClick={() => selectCompany(company.id)}
                >
                  <h3>{company.name}</h3>
                  <div className={styles.resultMeta}>
                    <span className={styles.statusPill}>
                      {content.location}:{" "}
                      {[company.city, company.county]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                    <span className={styles.statusPill}>
                      {content.type}: {company.type}
                    </span>
                    <span className={styles.statusPill}>
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
          className={styles.panel}
          aria-live="polite"
        >
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.panelLabel}>
                {content.companyDetails}
              </span>
              <h2 className={styles.panelTitle}>
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
          ) : isDetailLoading ? (
            <LoadingState label={common.loading} />
          ) : isDetailError ? (
            <ErrorState
              message={content.detailError}
              retryLabel={common.retry}
              onRetry={() => void retryDetail()}
            />
          ) : companyDetail ? (
            <div className={styles.detailSections}>
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

function EmptyState({
  index,
  title,
  description,
}: {
  index: string;
  title: string;
  description: string;
}) {
  return (
    <div className={styles.emptyState}>
      <div>
        <span className={styles.emptyKicker}>{index}</span>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className={styles.stack} role="status">
      <span className="sr-only">{label}</span>
      <div className={styles.loadingBlock} />
      <div className={styles.loadingBlock} />
      <div className={styles.loadingBlock} />
    </div>
  );
}

function ErrorState({
  message,
  retryLabel,
  onRetry,
}: {
  message: string;
  retryLabel: string;
  onRetry: () => void;
}) {
  return (
    <div className={styles.emptyState}>
      <div>
        <span className={styles.emptyKicker}>!</span>
        <h3>{message}</h3>
        <Button
          type="button"
          className={styles.secondaryButton}
          onClick={onRetry}
        >
          {retryLabel}
        </Button>
      </div>
    </div>
  );
}

function DetailSection({
  title,
  value,
  fallback,
}: {
  title: string;
  value: string | null;
  fallback: string;
}) {
  return (
    <section>
      <h3>{title}</h3>
      <p>{value || fallback}</p>
    </section>
  );
}
