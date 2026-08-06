---
name: phraseforge-lang-ron
description: Romanian (Română, ISO 639-3 ron) language conventions for PhraseForge lessons. Codes, vocabulary shape (postpositional article + gender), verb tags, and notes. Load whenever a PhraseForge lesson targets Romanian.
---

> **HOW TO USE THIS SKILL — MANDATORY.** You may be a small model. Follow these
> conventions EXACTLY. Copy the tag shapes, dictionary/citation forms, and line formats from
> the examples below **literally** — do not invent tags, do not add explanations
> or extra prose, do not change the format. Produce ONLY the output this step asks
> for, in the exact shape shown. When unsure, prefer the example over your own idea.

# Romanian (ron) language conventions

## Codes

- `lang`: `ron`
- `script`: `latn`

## Transcription

Not needed. Romanian uses Latin script. Preserve special characters: `ă â î ș ț`.

## Vocabulary format

Field rules follow the injected **phraseforge-entry-format** skill. Romanian-specific rules:

- **Nouns:** Romanian has three genders (m/f/n) and a **postpositional definite article** (suffixed: `-ul`, `-a`, `-le`). Use the indefinite form as the dictionary/citation form; mark gender. `{N m}` / `{N f}` / `{N n}`.
- **Verbs:** infinitive (short form without `a`), tag `{V}`. Add `irreg` for irregular.
- **Adjectives:** masculine singular, tag `{Adj}`.

```
câine {N m} = pies
casă {N f} = dom
copil {N n} = dziecko

a vorbi {V} = mówić
a fi {V irreg} = być
a avea {V irreg} = mieć

mic {Adj} = mały
repede {Adv} = szybko
```

## Grammar notes (B1+)

Romanian has preserved the Latin vocative and some case distinctions (nominative/accusative vs. genitive/dative via article forms). Note case endings for nouns when relevant.

## Translation

Translate to Polish (`pol`).

## Cultural notes

- Romanian is the only major Romance language in Eastern Europe; note Slavic and Hungarian loanwords when they appear.
