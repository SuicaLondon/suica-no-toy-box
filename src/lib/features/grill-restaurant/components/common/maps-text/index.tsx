import { Fragment } from "react";

const GOOGLE_MAPS = "Google Maps";

/**
 * Text in which every "Google Maps" is kept from being translated, recased
 * or restyled, which Google's attribution rules require.
 */
export function MapsText({ children }: { children: string }) {
  return (
    <>
      {children.split(GOOGLE_MAPS).map((part, index) => (
        <Fragment key={index}>
          {index > 0 ? <span translate="no">{GOOGLE_MAPS}</span> : null}
          {part}
        </Fragment>
      ))}
    </>
  );
}
