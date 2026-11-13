/**
 * One Grill Restaurant run from what the user gave: a Google Maps link, or
 * (from the CLI) a typed name. Shared by the API route and the CLI.
 */
import { tryCatchAsync } from "@/utils/try-catch";
import {
  grillRestaurant,
  type GrillEvent,
  type GrillPlace,
  type GrillRestaurantRequest,
} from "./grill-restaurant";
import { timestamped } from "./grill-state";
import {
  classifyMapsLink,
  extractLink,
  MapsLinkError,
  resolveMapsLink,
} from "./maps-link";
import { LEADING_SCHEME } from "@/utils/regex";

export type GrillRunOptions = Omit<GrillRestaurantRequest, "place" | "emit"> & {
  /** A Google Maps link, or a name when allowNames is set. */
  input: string;
  allowNames?: boolean;
  onEvent: (event: GrillEvent) => void;
  now?: () => number;
};

export function looksLikeLink(input: string): boolean {
  return LEADING_SCHEME.test(extractLink(input));
}

/** Never throws: a bad link is reported as a run.failed event. */
export async function startGrillRun(options: GrillRunOptions): Promise<void> {
  const emit = timestamped(options.onEvent, options.now);
  const place = await tryCatchAsync(async (): Promise<GrillPlace> => {
    if (!looksLikeLink(options.input) && options.allowNames) {
      return { name: options.input.trim() };
    }
    classifyMapsLink(options.input);
    return resolveMapsLink(options.input, options.fetch ?? fetch);
  });
  if (place.error) {
    const linkError = place.error instanceof MapsLinkError ? place.error : null;
    // The reader sees a fixed message for the code; the log keeps the reason.
    console.warn(
      `Grill Restaurant could not open the link (${linkError?.code ?? "error"}): ${place.error.message}`,
    );
    emit({
      type: "run.failed",
      error: linkError?.message ?? "Could not read that link.",
      ...(linkError ? { code: linkError.code } : {}),
    });
    return;
  }
  await grillRestaurant({ ...options, place: place.data, emit });
}
