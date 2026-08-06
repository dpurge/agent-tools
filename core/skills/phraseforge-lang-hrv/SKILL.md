---
name: phraseforge-lang-hrv
description: Croatian (Hrvatski, ISO 639-3 hrv) language conventions for PhraseForge lessons. Codes, vocabulary shape (no article + gender/animate), verb aspect tags, and notes. Load whenever a PhraseForge lesson targets Croatian.
---

> **HOW TO USE THIS SKILL — MANDATORY.** You may be a small model. Follow these
> conventions EXACTLY. Copy the tag shapes, dictionary/citation forms, and line formats from
> the examples below **literally** — do not invent tags, do not add explanations
> or extra prose, do not change the format. Produce ONLY the output this step asks
> for, in the exact shape shown. When unsure, prefer the example over your own idea.

# Croatian (hrv) language conventions

## Codes

- `lang`: `hrv`
- `script`: `latn`

## Transcription

Not needed. Croatian uses Latin script. Preserve diacritics: `č c d s z` with caron and the digraph `dz`: `č ć dž đ š ž`.

## Vocabulary format

Field rules follow the injected **phraseforge-entry-format** skill. Croatian-specific rules:

- **Nouns:** no articles; mark gender and animate/inanimate for masculines: `{N m an}`, `{N m in}`, `{N f}`, `{N n}`.
- **Verbs:** infinitive form. Mark aspect: `{V impf}` / `{V pf}`. Add `irreg` for irregular.
- **Adjectives:** masculine singular nominative, tag `{Adj}`.

```
pas {N m an} = pies
kuca {N f} = dom
grad {N m in} = miasto
dijete {N n} = dziecko

govoriti {V impf} = mowić
vidjeti {V impf irreg} = widzieć
biti {V irreg} = być
imati {V irreg} = mieć

mali {Adj} = mały
brzo {Adv} = szybko
```

## Declension tables (B1+)

Croatian has 7 cases. Show paradigms when relevant. Stress accent (pitch accent) can be noted for advanced learners.

## Translation

Translate to Polish (`pol`). Croatian `ti` → informal; `vi` (formal address) → `Pan`/`Pani`.
