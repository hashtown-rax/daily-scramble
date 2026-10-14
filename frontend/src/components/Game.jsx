import { useState, useEffect, useRef } from 'react';
import { getNewPuzzle } from '../api';
import Results from './Results';

export default function Game({ userId }) {
  const [puzzle, setPuzzle] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [wordScores, setWordScores] = useState([]);
  const [guesses, setGuesses] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  function loadPuzzle() {
    setPuzzle(null);
    setCurrentIndex(0);
    setGuess('');
    setAttempts(0);
    setWordScores([]);
    setGuesses([]);
    setFeedback(null);
    setElapsed(0);
    setDone(false);
    setError(null);

    getNewPuzzle()
      .then((p) => {
        setPuzzle(p);
        setStartTime(Date.now());
      })
      .catch((err) => setError(err.message));
  }

  useEffect(() => { loadPuzzle(); }, []);

  useEffect(() => {
    if (!startTime || done) return;
    const id = setInterval(() => {
      setElapsed(((Date.now() - startTime) / 1000).toFixed(1));
    }, 100);
    return () => clearInterval(id);
  }, [startTime, done]);

  useEffect(() => {
    if (!feedback && inputRef.current) inputRef.current.focus();
  }, [feedback, currentIndex]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-400">Loading puzzle...</p>
      </div>
    );
  }

  if (done) {
    const totalTime = parseFloat(elapsed);

    return (
      <Results
        puzzle={puzzle}
        wordScores={wordScores}
        guesses={guesses}
        timeTaken={totalTime}
        userId={userId}
        onPlayAgain={loadPuzzle}
      />
    );
  }

  const word = puzzle.words[currentIndex];

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = guess.trim().toLowerCase();
    if (!trimmed) return;

    if (trimmed === word.answer.toLowerCase()) {
      const attemptNum = attempts + 1;
      const points = attemptNum === 1 ? 100 : 50;
      setWordScores((prev) => [...prev, points]);
      setGuesses((prev) => [...prev, { word_index: currentIndex, guess: trimmed, attempts: attemptNum }]);
      setFeedback('correct');
      setTimeout(() => {
        setFeedback(null);
        moveToNext();
      }, 800);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setFeedback('wrong');

      if (newAttempts >= 2) {
        setTimeout(() => {
          setFeedback('revealed');
          setWordScores((prev) => [...prev, 0]);
          setTimeout(() => {
            setFeedback(null);
            moveToNext();
          }, 1500);
        }, 800);
      } else {
        setTimeout(() => {
          setFeedback(null);
          setGuess('');
        }, 800);
      }
    }
  }

  function moveToNext() {
    setGuess('');
    setAttempts(0);
    if (currentIndex + 1 >= puzzle.words.length) {
      setDone(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-slate-500 text-sm mb-2">
        Word {currentIndex + 1} of {puzzle.words.length}
      </div>

      <div className="text-sm text-slate-400 mb-6 tabular-nums">{elapsed}s</div>

      <div
        className={`text-4xl font-bold tracking-widest mb-2 uppercase transition-colors duration-200 ${
          feedback === 'correct'
            ? 'text-green-400'
            : feedback === 'wrong'
            ? 'text-red-400'
            : feedback === 'revealed'
            ? 'text-yellow-400'
            : 'text-white'
        }`}
      >
        {feedback === 'revealed' ? word.answer : word.scrambled}
      </div>

      {feedback === 'revealed' && (
        <p className="text-yellow-400 text-sm mb-4">
          The answer was <span className="font-bold">{word.answer}</span>
        </p>
      )}

      {feedback !== 'revealed' && (
        <>
          <p className="text-slate-500 text-xs mb-6">
            {attempts === 0 ? '2 attempts' : '1 attempt left'}
          </p>
          <form onSubmit={handleSubmit} className="w-full max-w-xs">
            <input
              ref={inputRef}
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Type the word"
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white text-center text-xl tracking-wide focus:outline-none focus:border-amber-500"
              autoComplete="off"
              autoCapitalize="off"
              autoFocus
            />
            <button
              type="submit"
              disabled={!guess.trim()}
              className="w-full mt-3 py-3 rounded-lg bg-amber-500 text-slate-900 font-semibold active:bg-amber-600 disabled:opacity-50"
            >
              Submit
            </button>
          </form>
        </>
      )}

      <div className="flex gap-2 mt-8">
        {puzzle.words.map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${
              i < wordScores.length
                ? wordScores[i] > 0
                  ? 'bg-green-400'
                  : 'bg-red-400'
                : i === currentIndex
                ? 'bg-amber-500'
                : 'bg-slate-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
