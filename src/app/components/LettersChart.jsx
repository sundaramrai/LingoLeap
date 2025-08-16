import React from 'react';
import lettersData from '../data/letters/lettersData';

const LettersChart = () => {
  const isBrowser = typeof window !== 'undefined';

  const speechSynthesis = isBrowser ? window.speechSynthesis : null;

  let audio = (textToSpeak) => {
    if (speechSynthesis && textToSpeak) {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = "hi-IN";
      console.log(utterance);
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <section id="lettersChart">
      <h3 className="font-bold mb-4 text-xl">Letters Chart</h3>

      <div className="chart-container grid-cols-5">
        {lettersData.vowels.map((char, idx) => (
          <button
            key={char.character ? `vowel-${char.character}` : `vowel-${char.pronunciation}-${idx}`}
            type="button"
            className={`chart-char-container ${char.character ? 'chart-filled-container' : 'chart-empty-container'}`}
            onClick={() => audio(char.character)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                audio(char.character);
              }
            }}
            tabIndex={0}
            aria-label={`Play pronunciation for ${char.pronunciation}`}
          >
            {char.character}
            <span className="chart-pronunciation">{char.pronunciation}</span>
          </button>
        ))}
      </div>

      <hr className="chart-break" />

      <div className="chart-container grid-cols-5">
        {lettersData.consonants.map((char, idx) => (
          <button
            key={char.character ? `consonant-${char.character}` : `consonant-${char.pronunciation}-${idx}`}
            type="button"
            className={`chart-char-container ${char.character ? 'chart-filled-container' : 'chart-empty-container'}`}
            onClick={() => audio(char.character)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                audio(char.character);
              }
            }}
            tabIndex={0}
            aria-label={`Play pronunciation for ${char.pronunciation}`}
          >
            {char.character}
            <span className="chart-pronunciation">{char.pronunciation}</span>
          </button>
        ))}
      </div>

      <hr className="chart-break" />

      <div className="chart-container grid-cols-3">
        {lettersData.dependingVowels.map((char, idx) => (
          <button
            key={char.character ? `depvowel-${char.character}` : `depvowel-${char.pronunciation}-${idx}`}
            type="button"
            className={`chart-char-container ${char.character ? 'chart-filled-container' : 'chart-empty-container'}`}
            onClick={() => audio(char.pronunciation)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                audio(char.pronunciation);
              }
            }}
            tabIndex={0}
            aria-label={`Play pronunciation for ${char.pronunciation}`}
          >
            {char.character}
            <span className="chart-pronunciation">{char.pronunciation}</span>
          </button>
        ))}
      </div>

    </section>
  );
};

export default LettersChart;
