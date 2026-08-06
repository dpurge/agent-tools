---
name: phraseforge-lang-ces
description: Czech (Cestina, ISO 639-3 ces) language conventions for PhraseForge lessons. Codes, vocabulary shape (no article + gender/animate), verb aspect tags, and notes. Load whenever a PhraseForge lesson targets Czech.
---

> **HOW TO USE THIS SKILL — MANDATORY.** You may be a small model. Follow these
> conventions EXACTLY. Copy the tag shapes, dictionary/citation forms, and line formats from
> the examples below **literally** — do not invent tags, do not add explanations
> or extra prose, do not change the format. Produce ONLY the output this step asks
> for, in the exact shape shown. When unsure, prefer the example over your own idea.

# Czech (ces) language conventions

## Codes

- `lang`: `ces`
- `script`: `latn`

## Transcription

Not needed. Czech uses Latin script. Preserve diacritics: `á c d e é i n o r s t u y z` with háček or čárka: `á č ď é ě í ň ó ř š ť ú ů ý ž`.

## Vocabulary format

Field rules follow the injected **phraseforge-entry-format** skill. Czech-specific rules:

- **Nouns:** no articles; mark gender and animate/inanimate for masculines: `{N m an}` (masculine animate), `{N m in}` (masculine inanimate), `{N f}`, `{N n}`.
- **Verbs:** infinitive form. Czech verbs have **aspect pairs** (imperfective/perfective); list both when relevant: `dělat {V impf}` / `udělat {V pf}`. Tag `irreg` if irregular.
- **Adjectives:** masculine singular nominative, tag `{Adj}`.

```
pes {N m an} = pies
dům {N m in} = dom
žena {N f} = kobieta
město {N n} = miasto

mluvit {V impf} = mówić
vidět {V impf irreg} = widzieć
být {V irreg} = być
mít {V irreg} = mieć

malý {Adj} = mały
rychle {Adv} = szybko
```

## Declension tables (B1+)

Czech has 7 cases. Show declension paradigms for nouns/adjectives when relevant.

## Translation

Translate to Polish (`pol`). Czech `ty` → informal; `vy` (capital `Vy` when formal address) → formal Polish (`Pan`/`Pani`).

## Notes

- Czech and Polish are mutually intelligible to a fair degree; note false friends when they appear.
