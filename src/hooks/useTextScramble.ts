import { useState, useEffect } from 'react';

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=';

/**
 * useTextScramble Hook
 * WHAT: Animates a string of text from randomized glitch characters into the resolved phrase.
 * WHY:  Adds an award-style cinematic decryption effect when titles and placeholders
 *       first enter the viewport.
 *
 * @param finalPhrase The completed text string to reveal
 * @param trigger When true, starts the scramble sequence
 * @param speed Interval tick duration in milliseconds (default 30ms)
 */
export function useTextScramble(
  finalPhrase: string,
  trigger = true,
  speed = 30
): string {
  const [displayText, setDisplayText] = useState(finalPhrase);

  useEffect(() => {
    if (!trigger) return;

    let iteration = 0;
    const maxIterations = finalPhrase.length * 3;

    const interval = setInterval(() => {
      setDisplayText(
        finalPhrase
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration / 3) {
              return finalPhrase[index];
            }
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          })
          .join('')
      );

      iteration += 1;

      if (iteration >= maxIterations) {
        setDisplayText(finalPhrase);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [finalPhrase, trigger, speed]);

  return displayText;
}
