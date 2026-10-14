import hashlib
import random
from datetime import date

from app.seed_words import WORDS


def get_random_words() -> list[str]:
    return random.sample(WORDS, 5)


def get_daily_words(puzzle_date: date) -> list[str]:
    seed = int(hashlib.sha256(str(puzzle_date).encode()).hexdigest(), 16)
    rng = random.Random(seed)
    return rng.sample(WORDS, 5)


def scramble_word(word: str, seed_str: str = None) -> str:
    if seed_str:
        seed = int(hashlib.sha256(seed_str.encode()).hexdigest(), 16)
        rng = random.Random(seed)
    else:
        rng = random.Random()

    letters = list(word)
    for _ in range(10):
        rng.shuffle(letters)
        if "".join(letters) != word:
            break
    return "".join(letters)
