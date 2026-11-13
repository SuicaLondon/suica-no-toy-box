/**
 * Which review sites have a mark of their own (site-mark-paths.ts), found from
 * the host of a site's link, or from its name when it has no link. Every other
 * site shows the default mark.
 */
import { NON_WORD_RUN } from "@/utils/regex";
import { tryCatch } from "@/utils/try-catch";
import { SITE_MARK_PATHS, type SiteMarkId } from "./site-mark-paths";

export type SiteMark = { id: SiteMarkId; title: string; path: string };

type SiteMatch = {
  /** Host labels that name the site in any country: "yelp" in yelp.com.sg. */
  labels?: string[];
  /** Whole domains, for hosts too short to match safely as a label: x.com. */
  domains?: string[];
  /** The site's name in lower case, its first two words run together. */
  names: string[];
};

const SITES: Record<SiteMarkId, SiteMatch> = {
  tripadvisor: { labels: ["tripadvisor"], names: ["tripadvisor"] },
  yelp: { labels: ["yelp"], names: ["yelp"] },
  foursquare: { labels: ["foursquare"], names: ["foursquare"] },
  zomato: { labels: ["zomato"], names: ["zomato"] },
  tabelog: { labels: ["tabelog"], names: ["tabelog", "食べログ"] },
  facebook: {
    labels: ["facebook"],
    domains: ["fb.com", "fb.me", "fb.watch"],
    names: ["facebook"],
  },
  instagram: {
    labels: ["instagram"],
    domains: ["instagr.am"],
    names: ["instagram"],
  },
  tiktok: { labels: ["tiktok"], names: ["tiktok"] },
  youtube: { labels: ["youtube"], domains: ["youtu.be"], names: ["youtube"] },
  x: { domains: ["x.com", "twitter.com"], names: ["x", "twitter"] },
  threads: { domains: ["threads.net", "threads.com"], names: ["threads"] },
  reddit: { labels: ["reddit"], domains: ["redd.it"], names: ["reddit"] },
  xiaohongshu: {
    labels: ["xiaohongshu", "xhslink"],
    names: ["xiaohongshu", "rednote", "小紅書", "小红书"],
  },
  naver: { labels: ["naver"], names: ["naver"] },
  kakao: { labels: ["kakao"], names: ["kakao", "kakaomap"] },
  grab: { domains: ["grab.com"], names: ["grab", "grabfood"] },
  foodpanda: { labels: ["foodpanda"], names: ["foodpanda"] },
  deliveroo: { labels: ["deliveroo"], names: ["deliveroo"] },
  ubereats: { labels: ["ubereats"], names: ["ubereats"] },
  doordash: { labels: ["doordash"], names: ["doordash"] },
  wikipedia: { labels: ["wikipedia"], names: ["wikipedia"] },
  blogger: { labels: ["blogger", "blogspot"], names: ["blogger", "blogspot"] },
  wordpress: { labels: ["wordpress"], names: ["wordpress"] },
  medium: { labels: ["medium"], names: ["medium"] },
};

function hostnameOf(url: string): string | null {
  const { data } = tryCatch(() => new URL(url));
  return data ? data.hostname.toLowerCase() : null;
}

function hostMatches(host: string, site: SiteMatch): boolean {
  const labels = host.split(".");
  const byLabel = (site.labels ?? []).some((label) => labels.includes(label));
  const byDomain = (site.domains ?? []).some(
    (domain) => host === domain || host.endsWith(`.${domain}`),
  );
  return byLabel || byDomain;
}

/** "Uber Eats (delivery)" → ["uber", "ubereats"]. */
function nameKeys(name: string): string[] {
  const [first = "", second = ""] = name
    .toLowerCase()
    .split(NON_WORD_RUN)
    .filter(Boolean);
  return [first, first + second];
}

function findMark(matches: (site: SiteMatch) => boolean): SiteMark | null {
  const ids = Object.keys(SITES) as SiteMarkId[];
  const id = ids.find((candidate) => matches(SITES[candidate]));
  return id ? { id, ...SITE_MARK_PATHS[id] } : null;
}

/**
 * A review site's own mark, or null for a site without one. A link decides
 * by its host; only a site without a usable link is matched by its name.
 */
export function siteMarkFor(site: {
  url: string | null;
  name: string;
}): SiteMark | null {
  const host = site.url ? hostnameOf(site.url) : null;
  if (host) return findMark((match) => hostMatches(host, match));
  const keys = nameKeys(site.name);
  return findMark((match) => keys.some((key) => match.names.includes(key)));
}
