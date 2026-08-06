---
name: phraseforge-lang-por
description: Portuguese (Português, ISO 639-3 por) language conventions for PhraseForge lessons. Codes, vocabulary shape (definite article + gender), verb group tags, and formality rules. Load whenever a PhraseForge lesson targets Portuguese.
---

> **HOW TO USE THIS SKILL — MANDATORY.** You may be a small model. Follow these
> conventions EXACTLY. Copy the tag shapes, dictionary/citation forms, and line formats from
> the examples below **literally** — do not invent tags, do not add explanations
> or extra prose, do not change the format. Produce ONLY the output this step asks
> for, in the exact shape shown. When unsure, prefer the example over your own idea.

# Portuguese (por) language conventions

## Codes

- `lang`: `por`
- `script`: `latn`

## Transcription

Not needed. Portuguese uses Latin script. Preserve accents and special characters: `á â ã à é ê í ó ô õ ú ç`.

## Vocabulary format

Field rules follow the injected **phraseforge-entry-format** skill. Portuguese-specific rules:

- **Nouns:** include the **definite article** (`o`, `a`, `os`, `as`) in the dictionary/citation form. Mark gender: `{N m}` / `{N f}`.
- **Verbs:** infinitive form. Tag with verb class: `{V ar}`, `{V er}`, `{V ir}`. Add `irreg` for irregular verbs.
- **Adjectives:** masculine singular form, tag `{Adj}`.

```
o cachorro {N m} = pies
a casa {N f} = dom
os amigos {N m pl} = przyjaciele

falar {V ar} = mówić
comer {V er} = jeść
partir {V ir} = odchodzić
ser {V irreg} = być
ter {V irreg} = mieć

pequeno {Adj} = mały
rápido {Adj} = szybki
```

## Conjugation tables (optional, B1+)

For irregular verbs. Markdown table: columns = subject (eu, tu, ele/ela/você, nós, vós, eles/elas), rows = tense (presente, pretérito perfeito, imperfeito, futuro…).

## Translation

Translate to Polish (`pol`). Formality: `você` (European formal or Brazilian standard) → `Pan`/`Pani`; `tu` (European informal / Brazilian informal) → `ty`.

## Regional variants

Note whether the source is European Portuguese (EP) or Brazilian Portuguese (BP) — vocabulary, spelling, and pronunciation differ. Default to EP unless context indicates BP.
