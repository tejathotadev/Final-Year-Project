import hashlib
import random

# =========================================================
# COMMON CONSTANTS
# =========================================================

EOM_CHAR = '\u0003'  # End-of-message delimiter

SHIFT_KEY = 3
BASE_XOR_KEY = 143

# =========================================================
# CHARACTER-LEVEL (Zero Width Characters) — KEY BASED
# =========================================================

ZWC_ZERO = '\u200B'
ZWC_ONE = '\u200C'


def get_keyed_shuffle(key: str):
    seed = int(hashlib.sha256(key.encode()).hexdigest(), 16)
    rng = random.Random(seed)
    order = list(range(8))
    rng.shuffle(order)
    return order


def _shuffle_byte(byte: str, key: str) -> str:
    order = get_keyed_shuffle(key)
    return ''.join(byte[i] for i in order)


def _unshuffle_byte(byte: str, key: str) -> str:
    order = get_keyed_shuffle(key)
    out = [''] * 8
    for i, pos in enumerate(order):
        out[pos] = byte[i]
    return ''.join(out)


def _char_text_to_binary(text: str) -> str:
    return ''.join(format(ord(c), '08b') for c in text)


def encode_character_level(cover_text: str, secret: str, secret_key: str) -> str:
    secret += EOM_CHAR
    binary = _char_text_to_binary(secret)

    encoded = []
    bit_index = 0

    for ch in cover_text:
        encoded.append(ch)

        if bit_index + 8 <= len(binary):
            byte = binary[bit_index:bit_index + 8]
            shuffled = _shuffle_byte(byte, secret_key)

            for bit in shuffled:
                encoded.append(ZWC_ONE if bit == '1' else ZWC_ZERO)

            bit_index += 8

    return ''.join(encoded)


def decode_character_level(stego_text: str, secret_key: str) -> str:
    bits = ""

    for ch in stego_text:
        if ch == ZWC_ZERO:
            bits += "0"
        elif ch == ZWC_ONE:
            bits += "1"

    secret = ""
    for i in range(0, len(bits), 8):
        byte = bits[i:i + 8]
        if len(byte) < 8:
            break

        unshuffled = _unshuffle_byte(byte, secret_key)
        char = chr(int(unshuffled, 2))

        if char == EOM_CHAR:
            break

        secret += char

    return secret


# =========================================================
# HOMOGLYPH-LEVEL (UNCHANGED — WORKING)
# =========================================================

HOMOGLYPH_MAP = {
    'a': 'а', 'e': 'е', 'o': 'о',
    'c': 'с', 'p': 'р', 'x': 'х', 'y': 'у'
}
REVERSE_HOMOGLYPH_MAP = {v: k for k, v in HOMOGLYPH_MAP.items()}

SHUFFLE_ORDER_H = [3, 1, 6, 0, 7, 2, 5, 4]


def _h_shuffle(bits):
    return ''.join(bits[i] for i in SHUFFLE_ORDER_H)


def _h_unshuffle(bits):
    out = [''] * 8
    for i, pos in enumerate(SHUFFLE_ORDER_H):
        out[pos] = bits[i]
    return ''.join(out)


def _h_xor(val, idx):
    return val ^ (BASE_XOR_KEY + idx)


def encode_homoglyph_level(cover_text: str, secret: str) -> str:
    secret += EOM_CHAR
    binary = ""

    for i, ch in enumerate(secret):
        shifted = ord(ch) + SHIFT_KEY
        xored = _h_xor(shifted, i)
        binary += _h_shuffle(format(xored, '08b'))

    usable = [c for c in cover_text if c.lower() in HOMOGLYPH_MAP]
    if len(usable) < len(binary):
        raise ValueError("Not enough homoglyph-capable characters")

    encoded = ""
    bit_index = 0

    for ch in cover_text:
        if bit_index < len(binary) and ch.lower() in HOMOGLYPH_MAP:
            encoded += (
                HOMOGLYPH_MAP[ch.lower()]
                if binary[bit_index] == '1'
                else ch
            )
            bit_index += 1
        else:
            encoded += ch

    return encoded


def decode_homoglyph_level(stego_text: str) -> str:
    bits = ""
    idx = 0
    secret = ""

    for ch in stego_text:
        if ch in REVERSE_HOMOGLYPH_MAP:
            bits += '1'
        elif ch.lower() in HOMOGLYPH_MAP:
            bits += '0'

        if len(bits) == 8:
            unshuffled = _h_unshuffle(bits)
            xored = int(unshuffled, 2)
            original = _h_xor(xored, idx) - SHIFT_KEY
            char = chr(original)

            if char == EOM_CHAR:
                break

            secret += char
            bits = ""
            idx += 1

    return secret


# =========================================================
# WORD-LEVEL (UNCHANGED — WORKING)
# =========================================================

ZWC_MAP = {
    "00": "\u200B",
    "01": "\u200C",
    "10": "\u200D",
    "11": "\u2060"
}
REVERSE_ZWC_MAP = {v: k for k, v in ZWC_MAP.items()}

SHUFFLE_ORDER_W = [2, 5, 1, 7, 3, 0, 6, 4]


def _w_shuffle(bits):
    return ''.join(bits[i] for i in SHUFFLE_ORDER_W)


def _w_unshuffle(bits):
    out = [''] * 8
    for i, pos in enumerate(SHUFFLE_ORDER_W):
        out[pos] = bits[i]
    return ''.join(out)


def _w_xor(val, idx):
    return val ^ (BASE_XOR_KEY + idx)


def encode_word_level(cover_text: str, secret: str) -> str:
    words = cover_text.split()
    secret += EOM_CHAR

    if len(words) < len(secret):
        raise ValueError("Not enough words in cover text")

    stego_words = []

    for i, word in enumerate(words):
        if i < len(secret):
            shifted = ord(secret[i]) + SHIFT_KEY
            xored = _w_xor(shifted, i)
            shuffled = _w_shuffle(format(xored, '08b'))

            zwc_seq = ""
            for j in range(0, 8, 2):
                zwc_seq += ZWC_MAP[shuffled[j:j + 2]]

            stego_words.append(word + zwc_seq)
        else:
            stego_words.append(word)

    return " ".join(stego_words)


def decode_word_level(stego_text: str) -> str:
    words = stego_text.split()
    secret = ""

    for i, word in enumerate(words):
        bits = ""
        for ch in word:
            if ch in REVERSE_ZWC_MAP:
                bits += REVERSE_ZWC_MAP[ch]

        if len(bits) == 8:
            unshuffled = _w_unshuffle(bits)
            xored = int(unshuffled, 2)
            original = _w_xor(xored, i) - SHIFT_KEY
            char = chr(original)

            if char == EOM_CHAR:
                break

            secret += char

    return secret
