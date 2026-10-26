import React from 'react';
import { resolveTheme } from '../../constants/portfolioThemes.js';
import { PurpleAuraFigmaTemplate } from './PurpleAuraFigmaTemplate.jsx';
import { NhoNeonFigmaTemplate } from './NhoNeonFigmaTemplate.jsx';
import { ComNeonFigmaTemplate } from './ComNeonFigmaTemplate.jsx';
import '../../styles/fomlioTheme.css';

/**
 * Main FomlioPassport Component: routes to the respective Figma-accurate template based on candidate's selectedTheme.
 */
export function FomlioPassport({ profile = {}, isDraft = false }) {
  const currentThemeId = resolveTheme(profile?.selectedTheme).id;
  if (currentThemeId === 'PURPLE_AURA') {
    return <PurpleAuraFigmaTemplate profile={profile} isDraft={isDraft} />;
  }
  if (currentThemeId === 'NHO_NEON') {
    return <NhoNeonFigmaTemplate profile={profile} isDraft={isDraft} />;
  }
  return <ComNeonFigmaTemplate profile={profile} isDraft={isDraft} />;
}
