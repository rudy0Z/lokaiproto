/**
 * Single source of truth for the demo citizen persona.
 * Prevents cross-shell identity drift between Desktop (Sidebar) and Mobile (MatterDrawer, MobileProfile).
 */

export interface UserProfile {
  name: string;
  shortName: string;
  initials: string;
  city: string;
  state: string;
  stateCode: string;
  country: string;
  plan: string;
}

export const DEMO_USER: UserProfile = {
  name: 'Priya Sharma',
  shortName: 'Priya S.',
  initials: 'PS',
  city: 'Mumbai',
  state: 'Maharashtra',
  stateCode: 'MH',
  country: 'India',
  plan: 'Free plan',
};
