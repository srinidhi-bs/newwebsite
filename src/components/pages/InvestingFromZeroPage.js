/**
 * InvestingFromZeroPage — /trading/investing-from-zero
 * ===========================================================================
 * Home of the "Investing, from zero" game: a story told in short sittings
 * that teaches a first-time investor how money, markets and mutual funds work.
 * Design doc: ~/.claude/plans/srinidhibs.com/investing-from-zero.md
 *
 * How the page flows (E3 — "the map is the home screen"):
 *
 *   MAP  ──tap a glowing part──▶  STORY (?sitting=1 in the URL)
 *    ▲                                  │
 *    └──── finish → back to the map, ───┘
 *          next part "pops" unlocked ✨
 *
 *   • Tapping a LOCKED part opens a small bottom sheet: "opens after X —
 *     already know this? open it anyway" (agreed rule: in order, can peek).
 *   • Tapping a SOON part (not written yet) says so.
 *   • The sitting number lives in the URL (?sitting=2), so the phone's Back
 *     button returns to the map, and a link can point straight at a sitting.
 *
 * Progress (what's finished, where you are, your guesses) is held HERE via
 * useStoryProgress and shared with both the map and the player.
 *
 * Language: all words come from src/content/investing/en/.
 * ===========================================================================
 */
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageWrapper from '../layout/PageWrapper';
import SEO from '../common/SEO';
import SectionHeader from '../common/SectionHeader';
import StoryPlayer from '../investing/StoryPlayer';
import LevelMap from '../investing/LevelMap';
import { useStoryProgress, isSittingPlayable } from '../investing/storyProgress';
import ui from '../../content/investing/en/ui';
import sittings, { mapWords } from '../../content/investing/en/sittings';

// "{title}" placeholders in ui words → real titles.
const fill = (template, title) => template.replace('{title}', title);

const InvestingFromZeroPage = () => {
  const [progress, setProgress] = useStoryProgress();
  const [searchParams, setSearchParams] = useSearchParams();

  // Which part of the map the reader tapped while it was locked / not written.
  const [promptIndex, setPromptIndex] = useState(null);
  // Set right after finishing a sitting: { doneIndex } → banner + "pop".
  const [celebration, setCelebration] = useState(null);
  const promptButtonRef = useRef(null);

  // ?sitting=N → that sitting's story (only if it has content).
  const requested = Number(searchParams.get('sitting'));
  const openIndex = sittings.findIndex((s) => s.number === requested);
  const openSitting = openIndex >= 0 && isSittingPlayable(sittings[openIndex]) ? sittings[openIndex] : null;

  // ── Navigation between map and story ────────────────────────────────────
  const openSittingAt = (i) => {
    console.log(`[InvestingStory] Opening sitting ${sittings[i].number}`);
    setPromptIndex(null);
    setCelebration(null);
    setSearchParams({ sitting: String(sittings[i].number) });
    // Big layout change (tall map → story card): start at the top.
    window.scrollTo(0, 0);
  };

  const backToMap = () => {
    console.log('[InvestingStory] Back to the map');
    setSearchParams({}, { replace: true });
    window.scrollTo(0, 0);
  };

  const handleComplete = (sittingId) => {
    const doneIndex = sittings.findIndex((s) => s.id === sittingId);
    console.log(`[InvestingStory] Sitting ${doneIndex + 1} complete → back to the map to celebrate`);
    setCelebration({ doneIndex });
    setSearchParams({}, { replace: true });
    window.scrollTo(0, 0);
  };

  // After a celebration lands on the map, bring the newly unlocked part into
  // view (only this one big moment auto-scrolls — nothing else does).
  useEffect(() => {
    if (!celebration || openSitting) return;
    const next = document.querySelector(`[data-testid="map-sitting-${celebration.doneIndex + 2}"]`);
    if (next && next.scrollIntoView) {
      next.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [celebration, openSitting]);

  // Bottom sheet: focus its main button when it opens; Escape closes it.
  useEffect(() => {
    if (promptIndex === null) return undefined;
    if (promptButtonRef.current) promptButtonRef.current.focus();
    const onKey = (e) => { if (e.key === 'Escape') setPromptIndex(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [promptIndex]);

  // ── STORY view ──────────────────────────────────────────────────────────
  if (openSitting) {
    return (
      <PageWrapper>
        <SEO routeKey="/trading/investing-from-zero" />
        {/* key: a different sitting = a fresh player (its own end-card state) */}
        <StoryPlayer
          key={openSitting.id}
          sitting={openSitting}
          ui={ui}
          progress={progress}
          setProgress={setProgress}
          onComplete={handleComplete}
          onExit={backToMap}
        />
      </PageWrapper>
    );
  }

  // ── MAP view ────────────────────────────────────────────────────────────
  const prompt = promptIndex === null ? null : sittings[promptIndex];
  const promptPlayable = prompt && isSittingPlayable(prompt);
  const nextAfterDone = celebration ? sittings[celebration.doneIndex + 1] : null;

  return (
    <PageWrapper>
      <SEO routeKey="/trading/investing-from-zero" />
      <div className="max-w-md mx-auto">
        <SectionHeader
          kicker={ui.pageKicker}
          title={ui.pageTitle}
          accent="text-accent-trading"
          standfirst={ui.pageStandfirst}
        />

        {/* Celebration banner after finishing a sitting */}
        {celebration && (
          <div className="card-skin p-4 mb-4" role="status" data-testid="celebration">
            <p className="font-bold text-ink">{fill(ui.celebrateDone, sittings[celebration.doneIndex].title)}</p>
            <p className="text-ink-muted text-sm mt-1">
              {nextAfterDone && isSittingPlayable(nextAfterDone)
                ? fill(ui.celebrateNext, nextAfterDone.title)
                : ui.celebrateSoon}
            </p>
          </div>
        )}

        <p className="font-labmono text-xs text-ink-muted mb-3">{ui.mapHint}</p>
        <div className="card-skin overflow-hidden">
          <LevelMap
            sittings={sittings}
            words={mapWords}
            progress={progress}
            ui={ui}
            onOpen={openSittingAt}
            onLocked={setPromptIndex}
            celebrateIndex={celebration ? celebration.doneIndex + 1 : null}
          />
        </div>
      </div>

      {/* Bottom sheet for a locked / not-yet-written part */}
      {prompt && (
        <div
          className="fixed inset-x-0 bottom-0 z-50 p-4"
          role="dialog"
          aria-modal="false"
          aria-labelledby="ifz-prompt-title"
          data-testid="map-prompt"
        >
          <div className="card-skin p-5 max-w-md mx-auto">
            <p id="ifz-prompt-title" className="font-bold text-ink mb-1">
              {promptPlayable ? ui.lockedTitle : ui.soonTitle}
            </p>
            <p className="text-ink-muted text-sm mb-4">
              {promptPlayable
                ? fill(ui.lockedBody, sittings[promptIndex - 1].title)
                : ui.soonBody}
            </p>
            <div className="flex flex-wrap gap-3">
              {promptPlayable && (
                <button ref={promptButtonRef} type="button" onClick={() => openSittingAt(promptIndex)}
                  className="btn-skin-primary px-4 py-2 whitespace-nowrap">
                  {ui.openAnyway}
                </button>
              )}
              <button
                ref={promptPlayable ? undefined : promptButtonRef}
                type="button"
                onClick={() => setPromptIndex(null)}
                className="btn-skin-secondary px-4 py-2 whitespace-nowrap"
              >
                {ui.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default InvestingFromZeroPage;
