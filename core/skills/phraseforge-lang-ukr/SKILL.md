---
name: phraseforge-lang-ukr
description: Ukrainian (Ukrainska, ISO 639-3 ukr) language conventions for PhraseForge lessons. Codes, vocabulary shape (no article + gender/animate), verb aspect tags, and notes. Load whenever a PhraseForge lesson targets Ukrainian.
---

> **HOW TO USE THIS SKILL — MANDATORY.** You may be a small model. Follow these
> conventions EXACTLY. Copy the tag shapes, dictionary/citation forms, and line formats from
> the examples below **literally** — do not invent tags, do not add explanations
> or extra prose, do not change the format. Produce ONLY the output this step asks
> for, in the exact shape shown. When unsure, prefer the example over your own idea.

# Ukrainian (ukr) language conventions

## Codes

- `lang`: `ukr`
- `script`: `cyrl`

## Transcription

Not required by default (Cyrillic excluded from transcription block). Phonetic hints can be added inline for learners unfamiliar with Ukrainian Cyrillic.

## Vocabulary format

Field rules follow the injected **phraseforge-entry-format** skill. Ukrainian-specific rules:

- **Nouns:** no articles; mark gender: `{N m}` / `{N f}` / `{N n}`. Add `an` for animate masculines: `{N m an}`.
- **Verbs:** infinitive form. Mark aspect: `{V impf}` / `{V pf}`. Add `irreg` for irregular.
- **Adjectives:** masculine singular nominative long form, tag `{Adj}`.

Dictionary/citation forms must be in Ukrainian Cyrillic: includes letters `і`, `ї`, `є`, `ґ` absent from Russian.

```
собака {N f} = pies
будинок {N m} = dom
жінка {N f} = kobieta
дитина {N f} = dziecko

говорити {V impf} = mówić
побачити {V pf} = zobaczyć
бути {V irreg} = być
мати {V irreg} = mieć

маленький {Adj} = mały
швидко {Adv} = szybko
```

## Declension tables (B1+)

Ukrainian has 7 cases (adds vocative). Show paradigms when relevant.

## Translation

Translate to Polish (`pol`). Ukrainian `ти` → informal; `ви` (formal/plural) → `Pan`/`Pani`/`wy`.

## Notes

- Ukrainian is closely related to Polish — many roots are shared but sound changes differ. Flag false friends.
- Vocative case is actively used in everyday speech; note it in vocabulary entries for nouns commonly used in address.
