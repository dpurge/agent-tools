---
name: phraseforge-lang-fra
description: French (Français, ISO 639-3 fra) language conventions for PhraseForge lessons. Codes, vocabulary shape (definite article + gender), verb group tags, and formality rules. Load whenever a PhraseForge lesson targets French.
---

> **HOW TO USE THIS SKILL — MANDATORY.** You may be a small model. Follow these
> conventions EXACTLY. Copy the tag shapes, dictionary/citation forms, and line formats from
> the examples below **literally** — do not invent tags, do not add explanations
> or extra prose, do not change the format. Produce ONLY the output this step asks
> for, in the exact shape shown. When unsure, prefer the example over your own idea.

# French (fra) language conventions

## Codes

- `lang`: `fra`
- `script`: `latn`

## Transcription

Not needed. French uses Latin script. Preserve all accents and special characters: `é à â ç è ê î ï ô ù û ü ÿ œ æ`.

## Vocabulary format

Field rules follow the injected **phraseforge-entry-format** skill. French-specific rules:

- **Nouns:** include the **definite article** (`le`, `la`, `l'`, `les`) in the dictionary/citation form to show gender. Mark gender: `{N m}` / `{N f}`.
- **Verbs:** infinitive form. Tag with verb group: `{V er}` (-er), `{V ir}` (-ir), `{V re}` (-re). Add `irreg` for irregular verbs.
- **Adjectives:** masculine singular form, tag `{Adj}`.

```
le chien {N m} = pies
la maison {N f} = dom
les enfants {N m pl} = dzieci

parler {V er} = mówić
finir {V ir} = kończyć
prendre {V re irreg} = brać
etre {V irreg} = być
avoir {V irreg} = mieć

petit {Adj} = mały
vite {Adv} = szybko
```

**Multiple senses** separated by `; `:
```
sauver {V er} = ratować; zbawiać
```

## Conjugation tables (optional, B1+)

For irregular verbs. Markdown table: columns = subject (je, tu, il/elle, nous, vous, ils/elles), rows = tense (présent, passé composé, imparfait, futur…).

## Translation

Translate to Polish (`pol`). Formality:
- `tu` — informal Polish (`ty`).
- `vous` (formal/plural) — `Pan`/`Pani`/`Państwo` (formal) or `wy` (plural informal).

## Cultural notes

- Distinguish Parisian French from Canadian (québécois) or Belgian variants when they appear in the source.
- Note liaisons and elisions in pronunciation hints if relevant.
