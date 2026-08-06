---
name: phraseforge-lang-spa
description: Spanish (Español, ISO 639-3 spa) language conventions for PhraseForge lessons. Defines codes, transcription (none — Latin script), vocabulary entry shape (article + gender), verb conjugation patterns, and formality conventions. Load whenever a PhraseForge lesson targets Spanish.
---

> **HOW TO USE THIS SKILL — MANDATORY.** You may be a small model. Follow these
> conventions EXACTLY. Copy the tag shapes, dictionary/citation forms, and line formats from
> the examples below **literally** — do not invent tags, do not add explanations
> or extra prose, do not change the format. Produce ONLY the output this step asks
> for, in the exact shape shown. When unsure, prefer the example over your own idea.

# Spanish (spa) language conventions

## Codes

- `lang`: `spa`
- `script`: `latn`

## Transcription

Not needed. Spanish uses Latin script. Render `ñ`, accented vowels (`á é í ó ú`), inverted punctuation (`¿ ¡`), and `ü` (as in `pingüino`) as-is.

## Vocabulary format

Field rules follow the injected **phraseforge-entry-format** skill. Spanish-specific rules:

- **Nouns:** include the **definite article** in the dictionary/citation form, and mark gender. Use `{N m}` / `{N f}` for singular dictionary entries; add `pl` only when listing the plural form separately.
- **Verbs:** infinitive form. Optionally tag with verb class: `{V ar}`, `{V er}`, `{V ir}`. Irregular or stem-changing: add `irreg` (`{V ar irreg}`).
- **Adjectives:** masculine singular form (standard dictionary form), tag `{Adj}`.

```
el perro {N m} = pies
la gata {N f} = kotka
los niños {N m pl} = dzieci
las casas {N f pl} = domy

hablar {V ar} = mówić
comer {V er} = jeść
vivir {V ir} = żyć
ser {V irreg} = być
tener {V er irreg} = mieć

pequeño {Adj} = mały
feliz {Adj} = szczęśliwy
rápido {Adv} = szybko
```

**Multiple senses** in the Polish translation are separated by `; ` (semicolon + space):

```
bueno {Adj} = dobry; smaczny
casa {N f} = dom; mieszkanie
```

In the JSON this is the `translation` string: `"translation": "dobry; smaczny"`.

## Conjugation tables (optional, B1+)

For irregular verbs. Use a Markdown table — columns = subject pronouns (yo, tu, el/ella/usted, nosotros, vosotros, ellos/ellas/ustedes), rows = tense (presente, preterito indefinido, imperfecto, futuro…).

## Translation

Translate to Polish (`pol`). Handle formality:
- `tu` / `vosotros` — informal Polish (`ty` / `wy`).
- `usted` / `ustedes` — formal Polish (`Pan` / `Pani` / `Panstwo`).

## Regional variants

Default to peninsular Spanish (the `vosotros` form exists). If the source is clearly Latin American — uses `ustedes` for all 2nd-person plural, has voseo (`vos` instead of `tu`), or has regional vocabulary (`carro` for car instead of `coche`) — note the variant in the lesson description and adapt vocabulary accordingly.
