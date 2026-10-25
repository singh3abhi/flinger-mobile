/** Public API of the discover feature (the profile card is reused by Liked You). */
export { ProfileCard, type LikeTarget } from './components/profile-card';
export { LikeSheet, LimitSheet } from './components/sheets';
export { DiscoverScreen, matchHref } from './screens/discover-screen';
export { MatchScreen } from './screens/match-screen';
export { useDecisions, useLimits } from './use-deck';
export { fetchProfile, type PublicProfile } from './api';
