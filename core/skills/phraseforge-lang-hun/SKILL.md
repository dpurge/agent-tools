---
name: phraseforge-lang-hun
description: Hungarian (Magyar, ISO 639-3 hun) language conventions for PhraseForge lessons. Codes, vocabulary shape (no gender, agglutinative, vowel harmony, no articles in dictionary/citation forms), verb/noun tags, and notes. Load whenever a PhraseForge lesson targets Hungarian.
---

> **HOW TO USE THIS SKILL — MANDATORY.** You may be a small model. Follow these
> conventions EXACTLY. Copy the tag shapes, dictionary/citation forms, and line formats from
> the examples below **literally** — do not invent tags, do not add explanations
> or extra prose, do not change the format. Produce ONLY the output this step asks
> for, in the exact shape shown. When unsure, prefer the example over your own idea.

# Hungarian (hun) language conventions

## Codes

- `lang`: `hun`
- `script`: `latn`

## Transcription

Not needed. Hungarian uses Latin script. Preserve diacritics: `á é í ó ö ő ú ü ű`. Note double-length vowels: `ő` (long ö) and `ű` (long ü).

## Vocabulary format

Field rules follow the injected **phraseforge-entry-format** skill. Hungarian-specific rules:

- **No grammatical gender, no articles in dictionary/citation forms.** All nouns take `{N}`. Indefinite article `egy`; definite `a`/`az` — not part of the dictionary/citation form.
- **Verbs:** third-person singular present (dictionary form). Tag `{V}`. Add `irreg` for irregular.
- **Adjectives:** uninflected form, tag `{Adj}`.

```
kutya {N} = pies
ház {N} = dom
nő {N} = kobieta
gyerek {N} = dziecko

beszél {V} = mówić
lát {V} = widzieć
van {V irreg} = być
van neki {Phrase} = mieć

kicsi {Adj} = mały
gyorsan {Adv} = szybko
```

## Grammar notes (B1+)

- **Agglutinative** language with extensive suffixation: case endings, possessive suffixes, and verb conjugation for person/number/definiteness all expressed by suffixes.
- Hungarian distinguishes **definite** and **indefinite** verb conjugation (the verb changes form depending on whether the object is definite).
- **Vowel harmony**: suffixes alternate based on the dominant vowel of the stem (front/back, with a special class for `i`-dominant stems).
- 18 cases (nominative + 17 oblique forms), although most are spatial/locative cases.

## Translation

Translate to Polish (`pol`). Hungarian `te` → informal; `ön` (formal/singular) or `önök` (formal/plural) → `Pan`/`Pani`/`Państwo`.
