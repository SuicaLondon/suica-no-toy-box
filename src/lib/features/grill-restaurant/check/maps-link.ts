/**
 * Turns a pasted Google Maps link into the Place's name and position.
 *
 * Share links (maps.app.goo.gl) redirect to a full google.com/maps URL, which
 * carries the name in its path or query and the position after "@" or in
 * "!3d…!4d…". Google's share.google links redirect, through a hop of their
 * own, to a Google Search page whose query is the place's name; they carry no
 * position. Only each redirect's Location header is read, and only redirects
 * within Google are followed: no Maps or Search page is fetched or scraped,
 * and no API is called.
 */
import { tryCatch, tryCatchAsync } from "@/utils/try-catch";
import { URL_PLUS, WEB_LINK } from "@/utils/regex";
import {
  COORDINATES_ONLY,
  GOOGLE_HOST,
  MAPS_CENTRE,
  MAPS_PIN,
  MAPS_PLACE_PATH,
  MAPS_SEARCH_PATH,
} from "../regex";

export type MapsPlace = {
  name: string;
  latLng?: { latitude: number; longitude: number };
  /**
   * A Google Maps URL for the place: the one the name was read from, or a
   * Maps search for the name when it came from a Google Search page.
   */
  mapsUrl: string;
};

export class MapsLinkError extends Error {
  constructor(
    message: string,
    readonly code: "invalid" | "unsupported" | "no-name" | "unreachable",
  ) {
    super(message);
    this.name = "MapsLinkError";
  }
}

const MAX_REDIRECTS = 4;

export type LinkKind = "short" | "full";

/**
 * The Maps app's share sheet often copies the place name with the link
 * ("King of Laksa\nhttps://maps.app.goo.gl/…"). Picks the link out.
 */
export function extractLink(text: string): string {
  return WEB_LINK.exec(text)?.[0] ?? text.trim();
}

/** Google's own share-link hosts, whose links redirect to the place. */
const SHARE_HOSTS: readonly string[] = ["maps.app.goo.gl", "share.google"];

/**
 * Says whether this is a Google Maps or share.google link we can read,
 * without fetching it.
 */
export function classifyMapsLink(input: string): {
  url: URL;
  kind: LinkKind;
} {
  const { data: url } = tryCatch(() => new URL(extractLink(input)));
  if (!url) throw new MapsLinkError("That is not a link.", "invalid");
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new MapsLinkError("That is not a web link.", "invalid");
  }
  const host = url.hostname.toLowerCase();
  if (SHARE_HOSTS.includes(host)) return { url, kind: "short" };
  if (host === "goo.gl" && url.pathname.startsWith("/maps/")) {
    return { url, kind: "short" };
  }
  if (
    GOOGLE_HOST.test(host) &&
    (host.startsWith("maps.") || url.pathname.startsWith("/maps"))
  ) {
    return { url, kind: "full" };
  }
  throw new MapsLinkError("That is not a Google Maps link.", "unsupported");
}

function decodeName(segment: string): string {
  return decodeURIComponent(segment.replace(URL_PLUS, " ")).trim();
}

function readLatLng(url: URL): MapsPlace["latLng"] {
  const text = decodeURIComponent(url.pathname + url.search);
  // "!3d<lat>!4d<lng>" is the place itself; "@<lat>,<lng>" is the map centre.
  const pin = MAPS_PIN.exec(text);
  const centre = MAPS_CENTRE.exec(text);
  const match = pin ?? centre;
  if (!match) return undefined;
  const latitude = Number(match[1]);
  const longitude = Number(match[2]);
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return undefined;
  return { latitude, longitude };
}

/** Google's EU consent page, which wraps the real URL in "continue". */
function isConsentPage(url: URL): boolean {
  const host = url.hostname.toLowerCase();
  return (
    host.startsWith("consent.") &&
    GOOGLE_HOST.test(host.slice("consent.".length))
  );
}

/**
 * A Google page a place can be read from: a Maps page, the Google Search page
 * a share.google link opens, or the consent page wrapping either.
 */
function isPlacePage(url: URL): boolean {
  if (isConsentPage(url)) return true;
  const host = url.hostname.toLowerCase();
  if (!GOOGLE_HOST.test(host)) return false;
  return (
    host.startsWith("maps.") ||
    url.pathname.startsWith("/maps") ||
    url.pathname === "/search"
  );
}

/** A host a share link's redirects may pass through: Google's own. */
function isGoogleHop(url: URL): boolean {
  const host = url.hostname.toLowerCase();
  return (
    SHARE_HOSTS.includes(host) ||
    host === "goo.gl" ||
    GOOGLE_HOST.test(host) ||
    isConsentPage(url)
  );
}

/** Google's documented Maps URL for a search, which opens the place by name. */
function mapsSearchUrl(name: string): string {
  const url = new URL("https://www.google.com/maps/search/");
  url.searchParams.set("api", "1");
  url.searchParams.set("query", name);
  return url.toString();
}

/**
 * Reads the Place from a Google Maps URL, or from the Google Search page a
 * share.google link opens. Any other page, such as share.google's own hop,
 * has no place in it, even when its query holds a code.
 */
export function readMapsUrl(url: URL): MapsPlace {
  const wrapped = isConsentPage(url) ? url.searchParams.get("continue") : null;
  if (wrapped) return readMapsUrl(new URL(wrapped));

  const onSearch = url.pathname === "/search";
  // Path segments come percent-encoded; query values come already decoded.
  const place = MAPS_PLACE_PATH.exec(url.pathname)?.[1];
  const searched = MAPS_SEARCH_PATH.exec(url.pathname)?.[1];
  const query = isPlacePage(url)
    ? (url.searchParams.get("q") ?? url.searchParams.get("query"))
    : null;
  const name = [
    place ? decodeName(place) : null,
    query?.trim(),
    searched ? decodeName(searched) : null,
  ].find(
    (value): value is string =>
      Boolean(value) && !COORDINATES_ONLY.test(value ?? ""),
  );

  if (!name) {
    throw new MapsLinkError(
      "That link has no place name in it. Open the place in Google Maps and use Share → Copy link.",
      "no-name",
    );
  }
  return {
    name,
    latLng: onSearch ? undefined : readLatLng(url),
    mapsUrl: onSearch ? mapsSearchUrl(name) : url.toString(),
  };
}

/** Where one redirect leads, or why it led nowhere. */
type Hop = { location: string } | { problem: MapsLinkError };

/** Asks for one redirect, reading its Location header only. */
async function readHop(target: URL, fetchImpl: typeof fetch): Promise<Hop> {
  const { data: response, error } = await tryCatchAsync(() =>
    fetchImpl(target, { method: "GET", redirect: "manual" }),
  );
  if (!response) {
    const reason = error instanceof Error ? error.message : String(error);
    return {
      problem: new MapsLinkError(
        `Could not reach that link (${reason}).`,
        "unreachable",
      ),
    };
  }
  const location = response.headers.get("location");
  if (response.status < 300 || response.status >= 400 || !location) {
    return {
      problem: new MapsLinkError(
        `That share link did not lead to a Google Maps place (status ${response.status}).`,
        "unreachable",
      ),
    };
  }
  return { location };
}

/**
 * Follows a share link's redirects by reading Location headers only, until
 * one lands on a page with the place in it. A redirect that leaves Google is
 * not followed. A hop that fails is asked once more before the link counts
 * as dead: checks that failed at this step have gone through when the same
 * link was retried.
 */
async function expandShortLink(
  url: URL,
  fetchImpl: typeof fetch,
): Promise<URL> {
  let current = url;
  for (let hop = 0; hop < MAX_REDIRECTS; hop++) {
    let answer = await readHop(current, fetchImpl);
    if ("problem" in answer) answer = await readHop(current, fetchImpl);
    if ("problem" in answer) throw answer.problem;
    current = new URL(answer.location, current);
    if (isPlacePage(current)) return current;
    if (!isGoogleHop(current)) {
      throw new MapsLinkError(
        `That share link did not lead to a Google Maps place (it led to ${current.hostname}).`,
        "unreachable",
      );
    }
  }
  throw new MapsLinkError("That link redirects too many times.", "unreachable");
}

export async function resolveMapsLink(
  input: string,
  fetchImpl: typeof fetch = fetch,
): Promise<MapsPlace> {
  const { url, kind } = classifyMapsLink(input);
  return readMapsUrl(
    kind === "short" ? await expandShortLink(url, fetchImpl) : url,
  );
}
