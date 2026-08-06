---
name: phraseforge-lang-bul
description: Bulgarian (Bulgarski, ISO 639-3 bul) language conventions for PhraseForge lessons. Codes, vocabulary shape (no inflectional case + postpositional article + gender), verb tags, and notes. Load whenever a PhraseForge lesson targets Bulgarian.
---

> **HOW TO USE THIS SKILL — MANDATORY.** You may be a small model. Follow these
> conventions EXACTLY. Copy the tag shapes, dictionary/citation forms, and line formats from
> the examples below **literally** — do not invent tags, do not add explanations
> or extra prose, do not change the format. Produce ONLY the output this step asks
> for, in the exact shape shown. When unsure, prefer the example over your own idea.

# Bulgarian (bul) language conventions

## Codes

- `lang`: `bul`
- `script`: `cyrl`

## Transcription

Not required by default (Cyrillic excluded from transcription block).

## Vocabulary format

Field rules follow the injected **phraseforge-entry-format** skill. Bulgarian-specific rules:

- **Nouns:** Bulgarian has **lost case inflection** (like Romanian and Macedonian among Slavic languages) but retains gender and a **postpositional definite article** (suffixed). Use the indefinite (bare) form as the dictionary/citation form; mark gender: `{N m}` / `{N f}` / `{N n}`.
- **Verbs:** first-person singular present as the dictionary/citation form. Tag `{V}`. Mark aspect: `{V impf}` / `{V pf}`. Add `irreg` for irregular.
- **Adjectives:** masculine singular short form, tag `{Adj}`.

```
куче {N n} = pies
сграда {N f} = dom; budynek
жена {N f} = kobieta
дете {N n} = dziecko

говоря {V impf} = mówić
видя {V pf} = zobaczyć
съм {V irreg} = być
имам {V irreg} = mieć

малък {Adj} = mały
бързо {Adv} = szybko
```

## Translation

Translate to Polish (`pol`). Bulgarian `ти` → informal; `вие` (formal/plural) → `Pan`/`Pani`/`wy`.

## Notes

- Bulgarian uses a definite postpositional article: `куче` (dog) → `кучето` (the dog).
- Bulgarian has re-developed a future tense particle `ще` and compound past. Note these constructions in models.
