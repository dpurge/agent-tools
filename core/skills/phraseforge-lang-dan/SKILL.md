---
name: phraseforge-lang-dan
description: Danish (Dansk, ISO 639-3 dan) language conventions for PhraseForge lessons. Codes, vocabulary shape (indefinite article + gender), verb tags, and notes. Load whenever a PhraseForge lesson targets Danish.
---

> **HOW TO USE THIS SKILL — MANDATORY.** You may be a small model. Follow these
> conventions EXACTLY. Copy the tag shapes, dictionary/citation forms, and line formats from
> the examples below **literally** — do not invent tags, do not add explanations
> or extra prose, do not change the format. Produce ONLY the output this step asks
> for, in the exact shape shown. When unsure, prefer the example over your own idea.

# Danish (dan) language conventions

## Codes

- `lang`: `dan`
- `script`: `latn`

## Transcription

Not needed. Danish uses Latin script. Preserve: `æ ø å`.

## Vocabulary format

Field rules follow the injected **phraseforge-entry-format** skill. Danish-specific rules:

- **Nouns:** Danish has two genders: common (`c`) and neuter (`n`). Include the **indefinite article** (`en` for common, `et` for neuter) in the dictionary/citation form. Mark gender: `{N c}` / `{N n}`.
- **Verbs:** infinitive form (bare, without `at`), tag `{V}`.
- **Adjectives:** uninflected form, tag `{Adj}`.

```
en hund {N c} = pies
et hus {N n} = dom
børnen {N c pl} = dzieci

tale {V} = mówić
være {V irreg} = być
have {V irreg} = mieć

lille {Adj} = mały
hurtigt {Adv} = szybko
```

## Grammar notes

- Definite article is **postpositional** (suffixed): `hunden` (the dog), `huset` (the house).
- Nouns take `-er` or `-e` plural endings (often irregular).

## Translation

Translate to Polish (`pol`). Danish `du` → informal Polish; `De` (archaic formal) → `Pan`/`Pani` if encountered.
