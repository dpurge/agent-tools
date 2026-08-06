---
name: phraseforge-lang-nld
description: Dutch (Nederlands, ISO 639-3 nld) language conventions for PhraseForge lessons. Codes, vocabulary shape (de/het article + gender), verb tags, and notes. Load whenever a PhraseForge lesson targets Dutch.
---

> **HOW TO USE THIS SKILL — MANDATORY.** You may be a small model. Follow these
> conventions EXACTLY. Copy the tag shapes, dictionary/citation forms, and line formats from
> the examples below **literally** — do not invent tags, do not add explanations
> or extra prose, do not change the format. Produce ONLY the output this step asks
> for, in the exact shape shown. When unsure, prefer the example over your own idea.

# Dutch (nld) language conventions

## Codes

- `lang`: `nld`
- `script`: `latn`

## Transcription

Not needed. Dutch uses Latin script. Preserve: `é è ë ij/ij`. Note that `ij` is a digraph treated as a single letter.

## Vocabulary format

Field rules follow the injected **phraseforge-entry-format** skill. Dutch-specific rules:

- **Nouns:** Dutch has two article types — `de` (common gender, covering former masculine and feminine) and `het` (neuter). Include the article in the dictionary/citation form. Mark: `{N de}` / `{N het}`.
- **Verbs:** infinitive form, tag `{V}`. Separable verbs: `{V sep}`. Add `irreg` for irregular.
- **Adjectives:** uninflected stem form, tag `{Adj}`.

```
de hond {N de} = pies
het huis {N het} = dom
de kinderen {N de pl} = dzieci

praten {V} = mówić
zien {V irreg} = widzieć
opstaan {V sep} = wstawać
zijn {V irreg} = być
hebben {V irreg} = mieć

klein {Adj} = mały
snel {Adv} = szybko
```

## Grammar notes

- `de`/`het` must be learned per word — there is no simple gender rule.
- Diminutives always take `het`: `het hondje` (the little dog).

## Translation

Translate to Polish (`pol`). Dutch `jij`/`je` → informal; `u` → formal (`Pan`/`Pani`).
