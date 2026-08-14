/**
 * Whether `href` names the view the reader is already in. Session routes live
 * under each root, so `/form` covers `/form/<id>`.
 *
 * Shared by the header (which marks the current tab) and the session guard
 * (which has nothing to warn about when the destination is where you already
 * are) so the two cannot disagree about what "current" means.
 */
export function isCurrentView(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
