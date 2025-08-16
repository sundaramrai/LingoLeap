'use client';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { quiz } from '../../../data/quiz/listenquizdata';
import './styles.css';
import { MdVolumeUp } from 'react-icons/md';

const SCORE_PER_QUESTION = 5;
const SPEECH_LANG = 'hi-IN';
const CORRECT_ANSWER_PREFIX = 'Is prashna ka sahi uttar hai ';

const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback((text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = SPEECH_LANG;
    utterance.rate = 0.9;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return { speak, stop, isSpeaking };
};

const Page = () => {
  const [selectedAnswerForPronunciation, setSelectedAnswerForPronunciation] = useState(null);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState({
    score: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
  });
  const [answerSelectedForCurrentQuestion, setAnswerSelectedForCurrentQuestion] = useState(false);

  const { speak, stop } = useSpeechSynthesis();
  const { questions } = quiz;

  const currentQuestionData = useMemo(() => {
    return questions[activeQuestion] || {};
  }, [questions, activeQuestion]);

  const { answers, correctAnswer } = currentQuestionData;

  const pronounceText = useCallback((text) => {
    speak(text);
  }, [speak]);

  const pronounceAnswer = useCallback((answer) => {
    pronounceText(answer);
    setSelectedAnswerForPronunciation(answer);
  }, [pronounceText]);

  const onAnswerSelected = useCallback((answer, idx) => {
    if (!answerSelectedForCurrentQuestion) {
      setChecked(true);
      setSelectedAnswerIndex(idx);
      setSelectedAnswerForPronunciation(null); // Deselect the answer for pronunciation
      if (answer === correctAnswer) {
        setSelectedAnswer(true);
        pronounceText(answer);
        console.log('true');
      } else {
        setSelectedAnswer(false);
        pronounceText(CORRECT_ANSWER_PREFIX + correctAnswer);
        console.log('false');
      }
      setAnswerSelectedForCurrentQuestion(true);
    }
  }, [answerSelectedForCurrentQuestion, correctAnswer, pronounceText]);

  const renderAnswerFeedback = useCallback(() => {
    if (selectedAnswer === true) {
      return <div className="feedback correct">Correct!</div>;
    } else if (selectedAnswer === false) {
      return (
        <div className="feedback wrong">
          Wrong! The correct answer is: {correctAnswer}
        </div>
      );
    }
    return null;
  }, [selectedAnswer, correctAnswer]);

  // Calculate score and increment to next question
  const nextQuestion = useCallback(() => {
    setAnswerSelectedForCurrentQuestion(false);
    setSelectedAnswerIndex(null);

    setResult((prev) =>
      selectedAnswer
        ? {
          ...prev,
          score: prev.score + SCORE_PER_QUESTION,
          correctAnswers: prev.correctAnswers + 1,
        }
        : {
          ...prev,
          wrongAnswers: prev.wrongAnswers + 1,
        }
    );

    if (activeQuestion !== questions.length - 1) {
      setActiveQuestion((prev) => prev + 1);
    } else {
      setActiveQuestion(0);
      setShowResult(true);
    }
    setChecked(false);
    setSelectedAnswer('');
  }, [selectedAnswer, activeQuestion, questions.length]);

  const handleRedirect = useCallback(() => {
    window.location.href = '/user/leaderboard';
  }, []);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  const percentageScore = useMemo(() => {
    const totalPossibleScore = questions.length * SCORE_PER_QUESTION;
    return Math.round((result.score / totalPossibleScore) * 100);
  }, [result.score, questions.length]);

  return (
    <div className='container'>
      <div>
        {!showResult ? (
          <div>
            <h2>
              Question: {activeQuestion + 1}
              <span>/{questions.length}</span>
            </h2>
            <div className="quiz-container">
              <h3>{questions[activeQuestion].question}</h3>
              {renderAnswerFeedback()}
              {answers.map((answer, idx) => (
                <li
                  key={`${activeQuestion}-${idx}`}
                  onClick={() => onAnswerSelected(answer, idx)}
                  onKeyDown={() => onAnswerSelected(answer, idx)}
                  className={
                    selectedAnswerIndex === idx ? 'li-selected' : 'li-hover'
                  }
                >
                  {/* Add the speaker icon and handle pronunciation */}
                  <span className="inline-flex grid-cols-3">
                    <span className='pl-96 pt-1.35 '>{' '}</span>
                    <MdVolumeUp
                      className={`speaker-icon h-6 w-6 ${selectedAnswerForPronunciation === answer ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        pronounceAnswer(answer);
                      }}
                    />
                    <span className='pl-4 pt-1.35'>{' '}</span>
                  </span>
                </li>
              ))}
              {checked ? (
                <button onClick={nextQuestion} className="btn">
                  {activeQuestion === questions.length - 1 ? 'Finish' : 'Next'}
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  disabled
                  className="btn-disabled"
                >
                  {' '}
                  {activeQuestion === questions.length - 1 ? 'Finish' : 'Next'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className='quiz-container'>
            <h3>Results</h3>
            <h3>Overall {percentageScore}%</h3>
            <p>
              Total Questions: <span>{questions.length}</span>
            </p>
            <p>
              Total Score: <span>{result.score}</span>
            </p>
            <p>
              Correct Answers: <span>{result.correctAnswers}</span>
            </p>
            <p>
              Wrong Answers: <span>{result.wrongAnswers}</span>
            </p>
            <button onClick={() => window.location.reload()}>Start +10XP</button>
            <button onClick={handleRedirect}>View Leaderboard</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;