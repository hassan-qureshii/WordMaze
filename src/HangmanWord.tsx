// HangmanWord.tsx
import { motion } from "framer-motion";

type HangmanWordProps = {
  guessedLetters: string[]; // expected letters (any case) from parent/keyboard
  wordGuess: string;        // the target word (any case)
  reveal?: boolean;
  shake?: boolean;
};

const HangmanWord = ({
  guessedLetters,
  wordGuess,
  reveal = false,
  shake = false,
}: HangmanWordProps) => {
  // Normalize everything to uppercase for consistent comparisons
  const normalizedWord = wordGuess.toUpperCase();
  const firstLetter = normalizedWord[0];

  // Normalize guessed letters too, and make unique
  const normalizedGuessed = Array.from(
    new Set(guessedLetters.map((l) => l.toUpperCase()))
  );

  // Ensure the first letter is always revealed (if that's desired)
  const enhancedGuessed = Array.from(new Set([...normalizedGuessed, firstLetter]));

  const containerVariants = {
    shake: {
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.5 },
    },
    idle: { x: 0 },
  };

  return (
    <motion.div
      className="flex gap-4 text-5xl font-mono uppercase mt-10 justify-center flex-wrap p-6 rounded-2xl w-[90%] max-w-[800px] mx-auto"
      variants={containerVariants}
      animate={shake ? "shake" : "idle"}
    >
      {normalizedWord.split("").map((letter, index) => {
        const isGuessed = enhancedGuessed.includes(letter);

        return (
          <span
            key={index}
            className="border-b-[5px] border-[#9B59B6] w-14 text-center transition-all"
          >
            <motion.span
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{
                opacity: isGuessed ? 1 : 0,
                y: isGuessed ? 0 : 10,
                scale: isGuessed ? 1 : 0.9,
              }}
              transition={{ duration: 0.3, delay: index * 0.07 }}
              className={`${
                isGuessed
                  ? "text-[#9B59B6]"
                  : reveal
                  ? "text-[#9B59B6]"
                  : "text-transparent"
              }`}
            >
              {letter}
            </motion.span>
          </span>
        );
      })}
    </motion.div>
  );
};

export default HangmanWord;
