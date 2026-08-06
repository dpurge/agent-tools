---
name: phraseforge-lang-ind
description: Indonesian (Bahasa Indonesia, ISO 639-3 ind) language conventions for PhraseForge lessons. Codes, vocabulary shape (no gender, no articles, minimal inflection), verb affixation tags, and notes. Load whenever a PhraseForge lesson targets Indonesian.
---

> **HOW TO USE THIS SKILL — MANDATORY.** You may be a small model. Follow these
> conventions EXACTLY. Copy the tag shapes, dictionary/citation forms, and line formats from
> the examples below **literally** — do not invent tags, do not add explanations
> or extra prose, do not change the format. Produce ONLY the output this step asks
> for, in the exact shape shown. When unsure, prefer the example over your own idea.

# Indonesian (ind) language conventions

## Codes

- `lang`: `ind`
- `script`: `latn`

## Transcription

Not needed. Indonesian uses Latin script. No special characters beyond standard ASCII (no diacritics in modern orthography).

## Vocabulary format

Field rules follow the injected **phraseforge-entry-format** skill. Indonesian-specific rules:

- **No grammatical gender, no articles, no case inflection.** All nouns take `{N}`. Plural is formed by reduplication (`anjing-anjing` = dogs) — note it only when explicitly in the source.
- **Verbs:** base (root) form or the prefixed active form (`me-` prefix family). Tag `{V}`. Add `irreg` for irregular.
- **Adjectives:** uninflected form, tag `{Adj}`.

```
anjing {N} = pies
rumah {N} = dom
perempuan {N} = kobieta
anak {N} = dziecko

berbicara {V} = mówić; rozmawiać
melihat {V} = widzieć
adalah {V} = być (kopula)
ada {V} = być; istnieć
mempunyai {V} = mieć; posiadać

kecil {Adj} = mały
cepat {Adv} = szybko; prędko
```

## Grammar notes (B1+)

- Indonesian is largely **isolating/analytic**: meaning is expressed by word order and separate words rather than inflection.
- Verb affixes: `me-` (active transitive), `di-` (passive), `ber-` (intransitive/stative), `ter-` (involuntary/superlative). Note the relevant prefix when the vocabulary item is a derived form.
- **SVO** word order as default; topicalization is flexible.

## Translation

Translate to Polish (`pol`). Indonesian `kamu`/`Anda` — `kamu` informal, `Anda` formal-neutral (`Pan`/`Pani` in Polish).
