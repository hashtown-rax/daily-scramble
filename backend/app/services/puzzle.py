import hashlib
import random
from datetime import date

from app.seed_words import WORDS


def get_daily_words(puzzle_date: date) -> list[str]:
    seed = int(hashlib.sha256(str(puzzle_date).encode()).hexdigest(), 16)
    rng = random.Random(seed)
    return rng.sample(WORDS, 5)


def scramble_word(word: str, puzzle_date: date) -> str:
    seed = int(hashlib.sha256(f"{puzzle_date}{word}".encode()).hexdigest(), 16)
    rng = random.Random(seed)
    letters = list(word)
    # keep shuffling until it's actually different from the original
    for _ in range(10):
        rng.shuffle(letters)
        if "".join(letters) != word:
            break
    return "".join(letters)
