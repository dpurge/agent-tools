---
name: phraseforge-lang-ell
description: Modern Greek (Neoelliniki, ISO 639-3 ell) language conventions for PhraseForge lessons. Codes, Greek script (no transcription needed), vocabulary shape (gender + articles), verb conjugation class tags, and notes. Load whenever a PhraseForge lesson targets Modern Greek.
---

> **HOW TO USE THIS SKILL — MANDATORY.** You may be a small model. Follow these
> conventions EXACTLY. Copy the tag shapes, dictionary/citation forms, and line formats from
> the examples below **literally** — do not invent tags, do not add explanations
> or extra prose, do not change the format. Produce ONLY the output this step asks
> for, in the exact shape shown. When unsure, prefer the example over your own idea.

# Modern Greek (ell) language conventions

## Codes

- `lang`: `ell`
- `script`: `grek`

## Transcription

Not required. Greek script is excluded from transcription block per `phraseforge-web` convention. Preserve polytonic characters if the source uses them (modern Greek is monotonic — single accent mark).

## Vocabulary format

Field rules follow the injected **phraseforge-entry-format** skill. Modern Greek-specific rules:

- **Nouns:** include the **definite article** (`ο`/`m`, `η`/`f`, `το`/`n`) in the dictionary/citation form. Mark gender: `{N m}` / `{N f}` / `{N n}`.
- **Verbs:** first-person singular present (dictionary form). Tag `{V}`. Two conjugation classes: `-ω` (type A) and `-άω`/`-ώ` (type B): `{V A}` / `{V B}`. Add `irreg` for irregular.
- **Adjectives:** masculine singular nominative, tag `{Adj}`.

```
ο σκύλος {N m} = pies
το σπίτι {N n} = dom
η γυναίκα {N f} = kobieta
το παιδί {N n} = dziecko

μιλώ {V B} = mówić
βλέπω {V A} = widzieć
είμαι {V irreg} = być
έχω {V A} = mieć

μικρός {Adj} = mały
γρήγορα {Adv} = szybko
```

## Declension tables (B1+)

Modern Greek has 4 cases (nominative, genitive, accusative, vocative). Show paradigms for difficult nouns.

## Translation

Translate to Polish (`pol`). Modern Greek `εσύ` → informal; `εσείς` (formal/plural) → `Pan`/`Pani`/`wy`.

## Notes

- Modern Greek (Demotic/Dhimotiki) is the standard. Distinguish from Katharevousa (archaic formal) if it appears in the source.
