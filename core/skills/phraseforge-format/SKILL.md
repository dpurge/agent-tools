---
name: phraseforge-format
description: Canonical field rules for the vocabulary and models entries a PhraseForge lesson step returns as JSON. Output-format-agnostic — the renderer turns each JSON object into a lesson line. Loaded into the vocabulary and models steps alongside the per-language skill.
---

> **HOW TO USE THIS SKILL — MANDATORY.** You may be a small model. You return each
> entry as a **JSON object with fields** — you do NOT write the final lesson line.
> The renderer adds the `{ }` around the grammar tag, the `[ ]` around the
> transcription, and the `( )` around a note. So put **only the content** in each
> field. Follow the GOOD/BAD examples below literally.

# Vocabulary & models entry fields

Each vocabulary entry is a JSON object:

```json
{"phrase": "...", "grammar": "...", "transcription": "...", "translation": "...", "notes": null}
```

Each models entry is the same minus `grammar`:

```json
{"phrase": "...", "translation": "...", "transcription": "...", "notes": null}
```

## `grammar` — tag CONTENT ONLY, no braces

Space-separated tokens (POS first, then optional modifiers). **Never** include curly
braces — the renderer adds them. Omit (null) if unsure.

- ✅ GOOD: `{"phrase": "发布", "grammar": "V", ...}`
- ✅ GOOD: `{"phrase": "der Hund", "grammar": "N m sg", ...}`
- ❌ BAD (braces in the field → renders as `{{V}}`): `{"grammar": "{V}", ...}`
- ❌ BAD (double braces): `{"grammar": "{{V}}", ...}`

## `transcription` — REQUIRED inline for non-Latin scripts

For a non-Latin script (`arab`, `hans`, `jpan`, `kore`, `hebr`, …) EVERY entry MUST
carry its own `transcription`. Never leave it null for those scripts; never collect
the transcriptions into a separate list or a trailing line. Use the romanization
system the language skill specifies. For Latin/Cyrillic/Greek scripts, leave it null.

- ✅ GOOD (hans): `{"phrase": "发布", "transcription": "fābù", "translation": "publikować"}`
- ❌ BAD (missing transcription on a hans entry): `{"phrase": "发布", "transcription": null, ...}`
- ✅ GOOD (Latin, none needed): `{"phrase": "laufen", "transcription": null, ...}`

## `notes` — almost always null

Leave `notes` null for the vast majority of entries. Add a short note **only** when the
entry is genuinely ambiguous or hard to understand without it — a false friend, a
non-obvious sense/usage, or an easily-confused homograph. Do **not** add level tags
(HSK…), literal glosses, or general commentary; unnecessary notes clutter the lesson.

**Important:** any parenthetical clarification that should render at the **end of the final
lesson line** belongs in `notes`, **not inside `translation`**. The renderer appends `notes`
as the final ` (...)` suffix. Therefore `translation` itself should stay parenthesis-free
unless the literal parentheses are genuinely part of the gloss.

- ✅ GOOD (ordinary word, no note): `{"phrase": "地址", "transcription": "dìzhǐ", "translation": "adres", "notes": null}`
- ✅ GOOD (note earns its place): `{"phrase": "克星", "transcription": "kèxīng", "translation": "pogromca", "notes": "dosł. „gwiazda zguby”; w nazwach = narzędzie do zwalczania czegoś"}`
- ✅ GOOD (qualifier belongs at line end, so keep it in `notes`): `{"phrase": "عَالَ", "grammar": "V", "transcription": "ʿāla", "translation": "utrzymywać; żywić", "notes": "rodzinę"}`
- ❌ BAD (parenthetical qualifier buried inside `translation`): `{"phrase": "عَالَ", "grammar": "V", "transcription": "ʿāla", "translation": "utrzymywać (rodzinę); żywić", "notes": null}`
- ❌ BAD (needless note on an easy word — everything else here is correct): `{"phrase": "地址", "grammar": "N", "transcription": "dìzhǐ", "translation": "adres", "notes": "rzeczownik oznaczający adres"}`

## `translation`

Gloss in the reader's language. Join multiple senses with `; ` (semicolon + space) —
e.g. `"polecać; rekomendować"`. Write it in that language's FULL native orthography: keep EVERY
diacritic and never ASCII-strip or substitute plain letters.

Keep `translation` as the **main gloss text only**. If you need a clarifying parenthetical that
should appear at the very end of the rendered line, put that content in `notes` instead.

- ✅ GOOD (Polish, diacritics intact): `{"phrase": "书", "transcription": "shū", "translation": "książka"}`
- ✅ GOOD (multiple senses, line-end qualifier kept in `notes`): `{"phrase": "عَالَ", "transcription": "ʿāla", "translation": "utrzymywać; żywić", "notes": "rodzinę"}`
- ❌ BAD (diacritics stripped): `{"phrase": "书", "transcription": "shū", "translation": "ksiazka"}`
- ❌ BAD (line-end note embedded into one sense): `{"phrase": "عَالَ", "transcription": "ʿāla", "translation": "utrzymywać (rodzinę); żywić", "notes": null}`

The per-language skill (`phraseforge-lang-<iso>`) adds language-specific rules
(phrase shape, the exact tag set, the transcription system and its typography).
When this skill and the language skill overlap, the language skill wins on specifics.
