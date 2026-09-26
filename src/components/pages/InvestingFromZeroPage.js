/**
 * InvestingFromZeroPage — /trading/investing-from-zero
 * ===========================================================================
 * Home of the "Investing, from zero" game: a story told in short sittings
 * that teaches a first-time investor how money, markets and mutual funds work.
 * Design doc: ~/.claude/plans/srinidhibs.com/investing-from-zero.md
 *
 * Build status:
 *   E1 (this) — engine skeleton: the StoryPlayer plays sitting 1 (placeholder).
 *   E3 adds the "you are here" level map above the player.
 *
 * Language: all words come from src/content/investing/en/ — swap the folder
 * to translate.
 * ===========================================================================
 */
import React from 'react';
import PageWrapper from '../layout/PageWrapper';
import SEO from '../common/SEO';
import SectionHeader from '../common/SectionHeader';
import StoryPlayer from '../investing/StoryPlayer';
import ui from '../../content/investing/en/ui';
import sitting1 from '../../content/investing/en/sitting1';

const InvestingFromZeroPage = () => (
  <PageWrapper>
    <SEO routeKey="/trading/investing-from-zero" />
    <SectionHeader
      kicker={ui.pageKicker}
      title={ui.pageTitle}
      accent="text-accent-trading"
      standfirst={ui.pageStandfirst}
    />
    <StoryPlayer sitting={sitting1} ui={ui} />
  </PageWrapper>
);

export default InvestingFromZeroPage;
