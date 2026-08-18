/**
 * Controls whether seeded demonstration content is rendered.
 *
 * Default is ON: the seeded screens are shown alongside the engine-backed ones
 * so the full dashboard is walkable. They always carry an explicit demo-data
 * banner — visible-but-labelled, never passed off as an audit finding.
 *
 * Set NEXT_PUBLIC_SHOW_DEMO_DATA="false" to hide them entirely (removed from
 * the nav and blocked by middleware), leaving only live governance results.
 *
 * NOTE: NEXT_PUBLIC_* values are inlined at build time, so changing this needs
 * a rebuild — a restart alone will not pick it up.
 */
export const SHOW_DEMO_DATA = process.env.NEXT_PUBLIC_SHOW_DEMO_DATA !== "false";

/** Screens whose data has no governance-engine source. */
export const DEMO_ONLY_ROUTES = [
  "/models",
  "/performance",
  "/compensation",
  "/audit",
  "/incidents",
] as const;
