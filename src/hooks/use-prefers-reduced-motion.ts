"use client";

import { matchesMediaQuery, subscribeToMediaQuery } from "@/utils/media-query";
import { useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  return subscribeToMediaQuery(REDUCED_MOTION_QUERY, onChange);
}

function getSnapshot() {
  return matchesMediaQuery(REDUCED_MOTION_QUERY);
}

function getServerSnapshot() {
  return false;
}

export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
