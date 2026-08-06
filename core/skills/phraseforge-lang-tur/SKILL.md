---
name: phraseforge-lang-tur
description: Turkish (Turkce, ISO 639-3 tur) language conventions for PhraseForge lessons. Codes, vocabulary shape (agglutinative, no gender, vowel harmony), verb/noun tags, and notes. Load whenever a PhraseForge lesson targets Turkish.
---

> **HOW TO USE THIS SKILL — MANDATORY.** You may be a small model. Follow these
> conventions EXACTLY. Copy the tag shapes, dictionary/citation forms, and line formats from
> the examples below **literally** — do not invent tags, do not add explanations
> or extra prose, do not change the format. Produce ONLY the output this step asks
> for, in the exact shape shown. When unsure, prefer the example over your own idea.

# Turkish (tur) language conventions

## Codes

- `lang`: `tur`
- `script`: `latn`

## Transcription

Not needed. Turkish uses Latin script (reformed 1928). Preserve special characters: `ç ğ ı İ ö ş ü`. Note: `I` (capital ı) and `İ` (capital i) are distinct letters.

## Vocabulary format

Field rules follow the injected **phraseforge-entry-format** skill. Turkish-specific rules:

- **No grammatical gender, no articles.** All nouns take `{N}`. Mark plural when it appears in the source (suffix varies by vowel harmony: `-lar`/`-ler`).
- **Verbs:** infinitive form (ending `-mak`/`-mek`). Tag `{V}`. Add `irreg` for irregular.
- **Adjectives:** uninflected form, tag `{Adj}`.

```
köpek {N} = pies
ev {N} = dom
kadın {N} = kobieta
çocuk {N} = dziecko

konuşmak {V} = mówić
görmek {V} = widzieć
olmak {V} = być
sahip olmak {V} = mieć

küçük {Adj} = mały
hızlı {Adv} = szybko
```

(Actual dictionary/citation forms with Turkish characters: `köpek`, `ev`, `kadın`, `çocuk`, `konuşmak`, `görmek`, `olmak`, `küçük`, `hızlı`.)

## Grammar notes (B1+)

- **Agglutinative SOV** language: suffixes stack for case (`-ı/i/u/ü`, `-a/e`, `-da/de`, `-dan/den`, `-ın/in`), number, possessive, tense, person.
- **Vowel harmony**: front/back and rounded/unrounded vowels — suffixes must match the last vowel in the stem.
- No copula in present tense (`ben öğrenciyim` = I am a student).

## Translation

Translate to Polish (`pol`). Turkish `sen` → informal; `siz` (formal/plural) → `Pan`/`Pani`/`wy`.
