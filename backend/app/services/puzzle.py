import random
from app.seed_words import WORDS


def get_random_words() -> list[str]:
    return random.sample(WORDS, 5)


def scramble_word(word: str) -> str:
    letters = list(word)
    for _ in range(10):
        random.shuffle(letters)
        if "".join(letters) != word:
            break
    return "".join(letters)
