"""AES-256-GCM encryption with PBKDF2. Implemented in Week 3.
Envelope encryption + per-day keys + block reshuffling are post-v1 (FUTURE_WORK §F1).
"""
from __future__ import annotations
import os, hashlib
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
SALT_SIZE = 16; NONCE_SIZE = 12; KEY_LEN = 32; ITERATIONS = 100_000
def derive_key(password: str, salt: bytes) -> bytes:
    kdf = PBKDF2HMAC(algorithm=hashes.SHA256(), length=KEY_LEN,
                     salt=salt, iterations=ITERATIONS)
    return kdf.derive(password.encode("utf-8"))
def encrypt(plaintext: bytes, password: str) -> bytes:
    salt = os.urandom(SALT_SIZE); nonce = os.urandom(NONCE_SIZE)
    key = derive_key(password, salt)
    ct = AESGCM(key).encrypt(nonce, plaintext, None)
    return salt + nonce + ct
def decrypt(blob: bytes, password: str) -> bytes:
    salt, nonce, ct = blob[:SALT_SIZE], blob[SALT_SIZE:SALT_SIZE+NONCE_SIZE], blob[SALT_SIZE+NONCE_SIZE:]
    key = derive_key(password, salt)
    return AESGCM(key).decrypt(nonce, ct, None)
