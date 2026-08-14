/**
 * Controls whether seeded demonstration content is rendered at all.
 *
 * Default is OFF: screens and sections with no live governance-engine source
 * are hidden rather than shown with seeded numbers. A compliance product must
 * not display figures a viewer could mistake for audit findings.
 *
 * Set NEXT_PUBLIC_SHOW_DEMO_DATA="true" to bring the seeded screens back for a
 * walkthrough; they then render with an explicit demo-data banner.
 */
export const SHOW_DEMO_DATA = process.env.NEXT_PUBLIC_SHOW_DEMO_DATA === "true";

/** Screens whose data has no governance-engine source. */
export const DEMO_ONLY_ROUTES = [
  "/models",
  "/performance",
  "/compensation",
  "/audit",
  "/incidents",
] as const;
