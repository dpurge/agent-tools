---
name: phraseforge-lang-eng
description: English (ISO 639-3 eng) language conventions for PhraseForge lessons. Codes, vocabulary shape (no articles/gender in dictionary/citation forms), verb and noun tags. Load whenever a PhraseForge lesson targets English.
---

> **HOW TO USE THIS SKILL — MANDATORY.** You may be a small model. Follow these
> conventions EXACTLY. Copy the tag shapes, dictionary/citation forms, and line formats from
> the examples below **literally** — do not invent tags, do not add explanations
> or extra prose, do not change the format. Produce ONLY the output this step asks
> for, in the exact shape shown. When unsure, prefer the example over your own idea.

# English (eng) language conventions

## Codes

- `lang`: `eng`
- `script`: `latn`

## Transcription

Not needed. English uses Latin script.

## Vocabulary format

Field rules follow the injected **phraseforge-entry-format** skill. English-specific rules:

- **Nouns:** no articles in the dictionary/citation form; no grammatical gender. Use `{N}`. Mark `pl` for plural-only nouns.
- **Verbs:** base (infinitive) form without `to`; tag `{V}`. Add `irreg` for irregular past tense.
- **Adjectives:** uninflected form, tag `{Adj}`.
- **Phrasal verbs:** include particle(s) in the dictionary/citation form: `give up {V}`, `look after {V}`.

```
dog {N} = pies
house {N} = dom
children {N pl} = dzieci

run {V} = biec; biegać
take {V irreg} = brać
give up {V} = rezygnować

small {Adj} = mały
quickly {Adv} = szybko
```

## Grammar notes

English has no case inflection, no grammatical gender, and minimal agreement. Grammar tags are intentionally minimal.

## Translation

Translate to Polish (`pol`). English does not distinguish formality via pronouns (`you` covers both). Render as informal Polish by default unless the source register is clearly formal.
