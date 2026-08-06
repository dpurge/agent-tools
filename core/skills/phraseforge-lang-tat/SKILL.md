---
name: phraseforge-lang-tat
description: Tatar (Tatar tele, ISO 639-3 tat) language conventions for PhraseForge lessons — Cyrillic script variant as in phraseforge-data. Codes, vocabulary shape (agglutinative, no gender), verb/noun tags, and notes. Load whenever a PhraseForge lesson targets Tatar.
---

> **HOW TO USE THIS SKILL — MANDATORY.** You may be a small model. Follow these
> conventions EXACTLY. Copy the tag shapes, dictionary/citation forms, and line formats from
> the examples below **literally** — do not invent tags, do not add explanations
> or extra prose, do not change the format. Produce ONLY the output this step asks
> for, in the exact shape shown. When unsure, prefer the example over your own idea.

# Tatar (tat) language conventions

## Codes

- `lang`: `tat`
- `script`: `cyrl`

Note: Tatar uses Cyrillic in Tatarstan/Russia. A Latin-based alphabet exists but is not official.

## Transcription

Not required by default (Cyrillic excluded from transcription block).

## Vocabulary format

Field rules follow the injected **phraseforge-entry-format** skill. Tatar-specific rules:

- **No grammatical gender, no articles.** All nouns take `{N}`.
- **Verbs:** infinitive (ending `-у`/`-ү`). Tag `{V}`. Add `irreg` for irregular.
- **Adjectives:** uninflected form, tag `{Adj}`.

```
эт {N} = pies
өй {N} = dom
хатын {N} = kobieta
бала {N} = dziecko

сөйләшергә {V} = mówić; rozmawiać
күрергә {V} = widzieć
булырга {V} = być
булырга {V} = mieć (posiadanie)

кечкенә {Adj} = mały
тиз {Adv} = szybko
```

## Grammar notes (B1+)

- **Agglutinative SOV** with front/back vowel harmony. Closely related to Bashkir.
- 6 cases. No grammatical gender.
- The Cyrillic Tatar alphabet includes `ә ө ү ж ң`.

## Translation

Translate to Polish (`pol`). Tatar `син` → informal; `сез` → formal/plural (`Pan`/`Pani`/`wy`).
