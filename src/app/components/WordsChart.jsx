import React from 'react'
import wordsData from '../data/words/wordsData';

const WordsChart = () => {
  const isBrowser = typeof window !== 'undefined';

  const speechSynthesis = isBrowser ? window.speechSynthesis : null;

  let audio = (textToSpeak) => {
    if (speechSynthesis && textToSpeak) {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = "hi-IN";
      console.log(utterance);
      speechSynthesis.speak(utterance);
    }
  }

  return (
    <section id="wordsChart">
      <h3 className="font-bold mb-4 text-xl">Words Chart</h3>
      <hr className="chart-break" />
      <h4 className="font-bold mb-4 text-xl">Common Words:</h4>

      <div className="chart-container grid-cols-5">
        {wordsData.common.map((char, idx) => (
          <button
            key={char.word ? `word-${char.word}-${idx}` : `pron-${char.pronunciation}-${idx}`}
            type="button"
            className={`chart-char-container ${char.word ? 'chart-filled-container' : 'chart-empty-container'}`}
            onClick={() => audio(char.word)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                audio(char.word);
              }
            }}
            tabIndex={0}
            aria-label={char.word ? `Play pronunciation for ${char.word}` : 'Play pronunciation'}
          >
            {char.word}
            <span className="chart-pronunciation">{char.pronunciation}</span>
          </button>
        ))}
      </div>

      <hr className="chart-break" />
    </section>
  )
}

export default WordsChart