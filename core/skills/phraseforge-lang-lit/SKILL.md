---
name: phraseforge-lang-lit
description: Lithuanian (Lietuviu, ISO 639-3 lit) language conventions for PhraseForge lessons. Codes, vocabulary shape (no article + gender), verb class tags, and notes. Load whenever a PhraseForge lesson targets Lithuanian.
---

> **HOW TO USE THIS SKILL — MANDATORY.** You may be a small model. Follow these
> conventions EXACTLY. Copy the tag shapes, dictionary/citation forms, and line formats from
> the examples below **literally** — do not invent tags, do not add explanations
> or extra prose, do not change the format. Produce ONLY the output this step asks
> for, in the exact shape shown. When unsure, prefer the example over your own idea.

# Lithuanian (lit) language conventions

## Codes

- `lang`: `lit`
- `script`: `latn`

## Transcription

Not needed. Lithuanian uses Latin script. Preserve diacritics: `ą č ę ė į š ų ū ž`.

## Vocabulary format

Field rules follow the injected **phraseforge-entry-format** skill. Lithuanian-specific rules:

- **Nouns:** no articles; mark gender: `{N m}` / `{N f}`. Lithuanian has 5 noun declension classes — note the class when relevant: `{N m 1}` … `{N m 5}`.
- **Verbs:** infinitive (ending in `-ti`), tag `{V}`. Mark conjugation class optionally: `{V 1}` (I-class), `{V 2}` (II-class), `{V 3}` (III-class). Add `irreg` for irregular.
- **Adjectives:** masculine singular nominative, tag `{Adj}`.

```
suo {N m} = pies
namas {N m} = dom
moteris {N f} = kobieta
vaikas {N m} = dziecko

kalbeti {V 2} = mówić
matyti {V 2} = widzieć
buti {V irreg} = być
tureti {V 2} = mieć

mazas {Adj} = mały
greitai {Adv} = szybko
```

## Declension tables (B1+)

Lithuanian has 7 cases. Show paradigms when relevant. Lithuanian preserves pitch accent — note for advanced learners.

## Translation

Translate to Polish (`pol`). Lithuanian `tu` → informal; `jus` (formal/plural) → `Pan`/`Pani`/`wy`.

## Notes

- Lithuanian is one of the most archaic living Indo-European languages; vocabulary contains many Baltic cognates with no Slavic equivalent. Explain loanword sources when helpful.
