---
name: phraseforge-lang-srp
description: Serbian (Srpski, ISO 639-3 srp) language conventions for PhraseForge lessons. Codes (Cyrillic script as used in phraseforge-data), vocabulary shape (no article + gender/animate), verb aspect tags. Load whenever a PhraseForge lesson targets Serbian.
---

> **HOW TO USE THIS SKILL — MANDATORY.** You may be a small model. Follow these
> conventions EXACTLY. Copy the tag shapes, dictionary/citation forms, and line formats from
> the examples below **literally** — do not invent tags, do not add explanations
> or extra prose, do not change the format. Produce ONLY the output this step asks
> for, in the exact shape shown. When unsure, prefer the example over your own idea.

# Serbian (srp) language conventions

## Codes

- `lang`: `srp`
- `script`: `cyrl`

## Transcription

Not required by default (Cyrillic excluded from transcription block). Serbian also has an official Latin alphabet (Gaj's Latin script); note which script the source uses.

## Vocabulary format

Field rules follow the injected **phraseforge-entry-format** skill. Serbian-specific rules:

- **Nouns:** no articles; mark gender and animate/inanimate: `{N m an}`, `{N m in}`, `{N f}`, `{N n}`.
- **Verbs:** infinitive form. Mark aspect: `{V impf}` / `{V pf}`. Add `irreg` for irregular.
- **Adjectives:** masculine singular nominative long form, tag `{Adj}`.

```
пас {N m an} = pies
кућа {N f} = dom
жена {N f} = kobieta
дете {N n} = dziecko

говорити {V impf} = mówić
видети {V pf} = zobaczyć
бити {V irreg} = być
имати {V irreg} = mieć

мали {Adj} = mały
брзо {Adv} = szybko
```

## Declension tables (B1+)

Serbian has 7 cases. Show paradigms when relevant. Serbian retains pitch accent (rising/falling × long/short); note for advanced learners.

## Translation

Translate to Polish (`pol`). Serbian `ти` → informal; `ви` (formal/plural) → `Pan`/`Pani`/`wy`.

## Notes

- Serbian and Croatian are largely mutually intelligible (Serbo-Croatian continuum). The main difference in this context is script (Serbian prefers Cyrillic, Croatian uses Latin only) and some vocabulary choices.
