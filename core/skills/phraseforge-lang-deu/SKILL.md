---
name: phraseforge-lang-deu
description: German (Deutsch, ISO 639-3 deu) language conventions for PhraseForge lessons. Defines codes, transcription (none — Latin script), vocabulary entry shape (article + gender/number), verb/adjective format, and inflection table conventions. Load whenever a PhraseForge lesson targets German.
---

> **HOW TO USE THIS SKILL — MANDATORY.** You may be a small model. Follow these
> conventions EXACTLY. Copy the tag shapes, dictionary/citation forms, and line formats from
> the examples below **literally** — do not invent tags, do not add explanations
> or extra prose, do not change the format. Produce ONLY the output this step asks
> for, in the exact shape shown. When unsure, prefer the example over your own idea.

# German (deu) language conventions

## Codes

- `lang`: `deu`
- `script`: `latn`

## Transcription

Not needed. German uses Latin script. Render `ä`, `ö`, `ü`, `ß` as-is; do **not** transliterate to `ae`, `oe`, `ue`, `ss` unless the source explicitly does.

## Vocabulary format

Field rules follow the injected **phraseforge-entry-format** skill. German-specific rules:

- **Nouns:** include the **definite article** in the dictionary/citation form, and mark gender and number. Use `{N m}` / `{N f}` / `{N n}` for singular dictionary entries; add `pl` only when listing the plural form separately.
- **Verbs:** bare infinitive (no `zu`), tag `{V}`. Separable verbs: `{V sep}`. Reflexive: `{V refl}`.
- **Adjectives:** uninflected (predicate) form, tag `{Adj}`.

```
der Hund {N m} = pies
die Katze {N f} = kot
das Kind {N n} = dziecko
die Bücher {N n pl} = książki

gehen {V} = iść
fahren {V} = jechać
sein {V} = być
aufstehen {V sep} = wstawać
sich freuen {V refl} = cieszyć się

klein {Adj} = mały
gut {Adj} = dobry
schnell {Adv} = szybko
```

**Multiple senses** in the Polish translation are separated by `; ` (semicolon + space):

```
alle {Pron} = wszyscy; wszystkie
angenehm {Adj} = miły; przyjemny
```

In the JSON this is the `translation` string: `"translation": "wszyscy; wszystkie"`.

## Inflection tables (optional, B1+)

Use for irregular verbs and strong/mixed noun declensions. Use a Markdown table — columns = case (Nom, Akk, Dat, Gen), rows = number (sg, pl) or person (ich/du/er…).

## Translation

Translate to Polish (`pol`). Match register: `Sie` → formal Polish; `du` → informal. Default to `Sie` unless the source is clearly informal (children's text, casual dialogue).

## Cultural / dialectal notes

- Default to standard high German (Hochdeutsch). Note Austrian / Swiss variants only if they appear in the source.
