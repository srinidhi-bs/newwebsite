/**
 * NarrationBeat — the simplest screen in the story: a line (or a few lines)
 * of text, with an optional small "kicker" label on top.
 *
 * Example beat from a content file:
 *   { id: 's1-dosa', type: 'narration', kicker: 'JAN 2000',
 *     text: 'A plate of masala dosa costs ₹10.' }
 * renders as:
 *      JAN 2000                      ← kicker (small mono caps)
 *      A plate of masala dosa costs ₹10.   ← big readable text
 *
 * @param {Object} props.beat - the beat object from the sitting file
 */
import React from 'react';

const NarrationBeat = ({ beat }) => {
  // `text` may be one string or an array of paragraphs — normalise to array.
  const paragraphs = Array.isArray(beat.text) ? beat.text : [beat.text];

  return (
    <div>
      {beat.kicker && (
        <p className="font-labmono text-xs tracking-widest uppercase mb-4 text-accent-trading">
          {beat.kicker}
        </p>
      )}
      {paragraphs.map((para, i) => (
        // Large, generous type: many first readers are 50+ and on a phone.
        <p key={i} className="text-xl md:text-2xl leading-relaxed text-ink mb-4 last:mb-0">
          {para}
        </p>
      ))}
    </div>
  );
};

export default NarrationBeat;
