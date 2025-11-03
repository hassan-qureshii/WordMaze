// App.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button, Modal, Select, Tooltip } from "antd";
import {
  FaRedo,
  FaLightbulb,
  FaVolumeUp,
  FaVolumeMute,
  FaTrophy,
} from "react-icons/fa";
import useSound from "use-sound";
import Confetti from "react-confetti";
import Words from "./wordList.json";
import HangmanWord from "./HangmanWord";
import Keyboard from "./Keyboard";

const { Option } = Select;
const MAX_GUESSES = 6;

const App = () => {
  const [wordGuess, setWordGuess] = useState(
    () => Words[Math.floor(Math.random() * Words.length)]
  );
  const [guessLetters, setGuessLetters] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [score, setScore] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(2);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [highScore, setHighScore] = useState(
    () => parseInt(localStorage.getItem("hangmanHighScore") || "0")
  );
  const [showConfetti, setShowConfetti] = useState(false);

  const isWinner = wordGuess.split("").every((letter) => guessLetters.includes(letter));
  const isLoser = guessLetters.length >= MAX_GUESSES && !isWinner;

  const incorrectLetters = guessLetters.filter((letter) => !wordGuess.includes(letter));

  const [playCorrect] = useSound("/sounds/correct.mp3", { volume: 0.5 });
  const [playWrong] = useSound("/sounds/wrong.mp3", { volume: 0.5 });
  const [playWin] = useSound("/sounds/win.mp3", { volume: 0.5 });
  const [playLose] = useSound("/sounds/lose.mp3", { volume: 0.5 });

  useEffect(() => {
    if (isWinner && soundEnabled) playWin();
    if (isLoser && soundEnabled) playLose();

    if (isWinner) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem("hangmanHighScore", score.toString());
      }
    }
  }, [isWinner, isLoser, soundEnabled, score, highScore]);

  const addGuessedLetter = (letter: string, isHint = false) => {
    if (guessLetters.includes(letter) || isLoser || isWinner) return;
    setGuessLetters((current) => [...current, letter]);

    if (wordGuess.includes(letter)) {
      setScore((prev) => prev + 10);
      if (soundEnabled) playCorrect();
    } else {
      setScore((prev) => Math.max(0, prev - 5));
      if (soundEnabled) playWrong();
    }
  };

  const giveHint = () => {
    if (hintsLeft > 0 && !isWinner && !isLoser) {
      const unguessed = wordGuess.split("").filter((l) => !guessLetters.includes(l));
      if (unguessed.length > 0) {
        const hintLetter = unguessed[Math.floor(Math.random() * unguessed.length)];
        addGuessedLetter(hintLetter, true);
        setHintsLeft((prev) => prev - 1);
      }
    }
  };

  const resetGame = () => {
    setGuessLetters([]);
    setWordGuess(Words[Math.floor(Math.random() * Words.length)]);
    setScore(0);
    setHintsLeft(2);
    setShowConfetti(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between py-6 bg-gradient-to-br from-[#f3f8fc] to-[#dfe9f3] text-[#083b75] transition-all duration-500"
    >
      {showConfetti && <Confetti />}

{/* Header */}
<div className="fixed top-0 left-0 w-full z-50 bg-transparent px-6 py-2 mb-30">
  <div className="flex justify-start items-center text-[#083b75]">
    <motion.div
      className="text-2xl font-extrabold"
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      🎯 Score: {score}
    </motion.div>
  </div>
</div>


      {/* Title */}
      <motion.h1
        className="text-4xl font-extrabold mt-6 drop-shadow-md text-center"
        animate={{ scale: isWinner || isLoser ? 1.1 : 1 }}
        transition={{ duration: 0.4 }}
      >
        {isWinner ? "🎉 You Win!" : isLoser ? "💀 You Lose!" : "🧩 Guess the Word!"}
      </motion.h1>

      {/* Difficulty Selector */}
      <div className="mt-3">
        <Select
          value={difficulty}
          onChange={setDifficulty}
          style={{ width: 200 }}
        >
          <Option value="easy">Easy (More Hints)</Option>
          <Option value="medium">Medium</Option>
          <Option value="hard">Hard (Fewer Hints)</Option>
        </Select>
      </div>

      {/* Guesses Left Indicator */}
      <div className="mt-4 text-lg font-semibold">
        Guesses Left: {MAX_GUESSES - guessLetters.length}
      </div>

      {/* Word Display */}
      <HangmanWord
        guessedLetters={guessLetters}
        wordGuess={wordGuess}
        reveal={isLoser}
        shake={incorrectLetters.length > 0 && !isWinner}
      />

      {/* Keyboard */}
      <Keyboard
        onLetterClick={addGuessedLetter}
        disabledLetters={guessLetters}
        wordGuess={wordGuess}
      />

      {/* Buttons Row */}
      <div className="flex gap-4 mt-8">
        <Tooltip title={`Hints Left: ${hintsLeft}`}>
          <Button
            icon={<FaLightbulb />}
            onClick={giveHint}
            disabled={hintsLeft === 0 || isWinner || isLoser}
            className="bg-yellow-400 text-black hover:scale-105 transition-transform font-semibold"
          >
            Hint
          </Button>
        </Tooltip>

        <Button
          icon={<FaRedo />}
          onClick={resetGame}
          className="bg-gradient-to-r from-[#083b75] to-[#9B59B6] text-white font-semibold hover:scale-105 transition-transform"
        >
          Play Again
        </Button>
      </div>

      {/* Win/Lose Modals */}
      <Modal open={isWinner} footer={null} closable={false} centered>
        <h2 className="text-2xl font-bold text-green-600 text-center mb-4">
          🎉 Congratulations!
        </h2>
        <p className="text-center">You Won with a Score of {score}!</p>
        <Button type="primary" block onClick={resetGame}>
          Play Again
        </Button>
      </Modal>

      <Modal open={isLoser} footer={null} closable={false} centered>
        <h2 className="text-2xl font-bold text-red-600 text-center mb-4">
          💀 Game Over!
        </h2>
        <p className="text-center">
          The word was: <b>{wordGuess}</b>
        </p>
        <Button danger block onClick={resetGame}>
          Try Again
        </Button>
      </Modal>

      {/* Footer */}
<footer className="mt-10 text-center text-sm text-gray-600 py-4">
  <p>
    © {new Date().getFullYear()} <span className="font-semibold text-[#083b75]">WordPlay Game</span> — 
    Built with ❤️ by <span className="text-[#9B59B6] font-semibold">Akbar Qureshi</span>.
  </p>
  <p className="mt-1">All rights reserved.</p>
</footer>
    </div>
  );
};

export default App;
