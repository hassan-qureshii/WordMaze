// Keyboard.tsx
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

type KeyboardProps = {
  onLetterClick?: (letter: string) => void;
  disabledLetters?: string[]; // letters to disable (any case)
  wordGuess: string;
};

const KEYS = [
  "QWERTYUIOP".split(""),
  "ASDFGHJKL".split(""),
  "ZXCVBNM".split(""),
];

const Keyboard = ({ onLetterClick, disabledLetters = [] }: KeyboardProps) => {
  // store pressed letters normalized to uppercase
  const [pressedLetters, setPressedLetters] = useState<string[]>([]);

  // normalize disabled letters once
  const normalizedDisabled = Array.from(
    new Set(disabledLetters.map((l) => l.toUpperCase()))
  );

  // useCallback to keep stable reference if you pass it down
  const handleClick = useCallback(
    (rawLetter: string) => {
      const letter = rawLetter.toUpperCase();

      // use functional update to avoid race conditions
      setPressedLetters((prev) => {
        if (prev.includes(letter) || normalizedDisabled.includes(letter)) {
          // return prev unchanged if already pressed or disabled
          return prev;
        }

        // fire callback with normalized letter
        if (onLetterClick) onLetterClick(letter);

        return [...prev, letter];
      });
    },
    [onLetterClick, normalizedDisabled]
  );

  // hardware keyboard support (only attaches once)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const letter = e.key.toUpperCase();
      if (/^[A-Z]$/.test(letter)) {
        handleClick(letter);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleClick]);

  const getButtonClass = (letter: string) => {
    const isPressed = pressedLetters.includes(letter);
    const isDisabled = normalizedDisabled.includes(letter);

    if (isPressed || isDisabled)
      return "bg-gray-400 text-gray-200 cursor-not-allowed opacity-70";
    return "bg-[#083b75] text-gray-200 hover:bg-[#0b4b9b] hover:scale-105 active:scale-95";
  };

  return (
    <div className="w-full flex justify-center mt-10 px-2 sm:px-4">
      <div className="rounded-2xl p-4 sm:p-6 max-w-[1000px] w-full flex flex-col items-center">
        {KEYS.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex justify-center gap-2 sm:gap-4 mb-3 sm:mb-4 flex-wrap"
          >
            {row.map((letter) => {
              const isPressed = pressedLetters.includes(letter);
              const isDisabled = normalizedDisabled.includes(letter);

              return (
                <motion.button
                  key={letter}
                  onClick={() => handleClick(letter)}
                  disabled={isPressed || isDisabled}
                  className={`text-lg sm:text-xl font-semibold rounded-xl shadow-md transition-all duration-200 ${getButtonClass(
                    letter
                  )} w-[50px] sm:w-[70px] h-[45px] sm:h-[55px]`}
                  whileHover={!isPressed && !isDisabled ? { scale: 1.05 } : {}}
                  whileTap={!isPressed && !isDisabled ? { scale: 0.95 } : {}}
                >
                  {letter}
                </motion.button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Keyboard;
