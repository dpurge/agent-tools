---
name: phraseforge-lang-tgk
description: Tajik (Tojiki, ISO 639-3 tgk) language conventions for PhraseForge lessons — Cyrillic script as in phraseforge-data. Codes, vocabulary shape (no gender, SOV, Persian-related), verb/noun tags, and notes. Load whenever a PhraseForge lesson targets Tajik.
---

> **HOW TO USE THIS SKILL — MANDATORY.** You may be a small model. Follow these
> conventions EXACTLY. Copy the tag shapes, dictionary/citation forms, and line formats from
> the examples below **literally** — do not invent tags, do not add explanations
> or extra prose, do not change the format. Produce ONLY the output this step asks
> for, in the exact shape shown. When unsure, prefer the example over your own idea.

# Tajik (tgk) language conventions

## Codes

- `lang`: `tgk`
- `script`: `cyrl`

Note: Tajik uses Cyrillic script in Tajikistan (since the Soviet era). It is closely related to Persian (fas) but uses a different script and has Uzbek/Russian loanwords.

## Transcription

Not required by default (Cyrillic excluded from transcription block).

## Vocabulary format

Field rules follow the injected **phraseforge-entry-format** skill. Tajik-specific rules:

- **No grammatical gender, no articles.** All nouns take `{N}`. Plural formed by suffix `-ҳо` (`-ho`) or `-он` (`-on`).
- **Verbs:** infinitive (ending `-ан`/`-idан`). Tag `{V}`. Add `irreg` for irregular.
- **Adjectives:** uninflected form, tag `{Adj}`.

```
саг {N} = pies
хона {N} = dom
зан {N} = kobieta
бача {N} = dziecko

гап задан {V} = mówić; rozmawiać
дидан {V} = widzieć
будан {V irreg} = być
доштан {V irreg} = mieć

хурд {Adj} = mały
тез {Adv} = szybko
```

## Grammar notes (B1+)

- **SOV** word order with Persian grammar; postpositions.
- Tajik Cyrillic has extra characters: `ғ` (gh), `қ` (q), `ҳ` (h), `ҷ` (j), `ӣ` (i), `ӯ` (u).
- Verb tenses: present, simple past, compound past, subjunctive, imperative.

## Translation

Translate to Polish (`pol`). Tajik `ту` → informal; `шумо` → formal/plural (`Pan`/`Pani`/`wy`).

## Notes

- Tajik is mutually intelligible with Persian and Dari to a large degree; the main differences are script, some phonology, and Turkic loanwords.
