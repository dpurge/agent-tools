---
name: phraseforge-lang-arz
description: Egyptian Arabic (ISO 639-3 arz) — colloquial Egyptian Arabic — language conventions for PhraseForge lessons. Load whenever a PhraseForge lesson targets Egyptian Arabic.
---

> **HOW TO USE THIS SKILL — MANDATORY.** You may be a small model. Follow these
> conventions EXACTLY. Copy the tag shapes, dictionary/citation forms, and line formats from
> the examples below **literally** — do not invent tags, do not add explanations
> or extra prose, do not change the format. Produce ONLY the output this step asks
> for, in the exact shape shown. When unsure, prefer the example over your own idea.

# Egyptian Arabic (arz) language conventions

## Codes

- `lang`: `arz`
- `script`: `arab`

## Transcription

Required (non-Latin script), inline on EVERY vocabulary and models entry AND for the full text.
System: **DIN 31635** (attr `DIN31635`), applied as a HYBRID — the full letter table is in
`phraseforge-lang-arb`; the delta below covers sounds that differ in Egyptian colloquial Arabic.

### Letter correspondences

Complete DIN 31635 table: see `phraseforge-lang-arb`. Apply these **dialect delta** values in place of
the corresponding arb entries:

| Arabic | arb/DIN base | arz (Egyptian) | Note |
|--------|-------------|----------------|------|
| ج | ǧ | g | Hard /g/ — always; the most distinctive Egyptian feature (never /dʒ/ or /ʒ/) |
| ق | q | ʾ | Glottal stop in urban Cairo speech; Upper-Egyptian speakers retain q |
| ث | ṯ | s | Classical /θ/ → /s/ in Egyptian (occasionally /t/ in some inherited forms) |
| ذ | ḏ | z | Classical /ð/ → /z/ in Egyptian (occasionally /d/) |

### Reading rules (natural)

1. **Dialect consonants.** Apply the delta table: ج → g (always); ق → ʾ (urban Cairo); ث → s; ذ → z.
2. **Definite article: `il-`** (variant `el-`). Sun-letter assimilation applies unchanged:
   `il-` + sun letter → the sun letter is doubled: `il-šams` → `iš-šams`, `il-nīl` → `in-nīl`,
   `il-tagriba` → `it-tagriba`. Before moon letters keep `il-`/`el-`: `il-gēš`, `el-bēt`.
3. **Imāla.** Long /aː/ raises toward /eː/ in certain lexical items. Transcribe the spoken vowel:
   *bēt* (بيت, "house"), *gēš* (جيش, "army").
4. **Short vowels** written from the spoken colloquial form; case endings dropped.
5. **Gemination** (shadda) shown by doubling the consonant.
6. **Habitual-present prefix `b-`/`bi-`** is written as part of the verb: بيتكلم → `biyitkallim`.

### Typography

- Latin punctuation `, . ! ? : ; ' " ( )` — never Arabic `، ؛ ؟ «　»`.
- Capitalize the first word of each sentence and all proper nouns; everything else lower-case.
- Keep all diacritics (ā ī ū š ġ ḥ ʿ ʾ …). Standard word spacing; hyphen after `il-`/`el-`.

### Example

`الجو جميل النهارده.` → `Il-gaww gamīl in-nahārda.`
(ج → g in both الجو and جميل; `il-` article; sun-letter assimilation `in-` before ن;
short vowels from spoken form; case endings dropped.)

## Vocabulary format

Field rules follow the injected **phraseforge-entry-format** skill and `phraseforge-lang-arb`. Egyptian-specific notes:

- **Nouns:** mark gender: `{N m}` / `{N f}`. Broken plurals listed separately.
- **Verbs:** third-person masculine singular perfect, tag `{V}`.
- Definite article: `il-` / `el-` (assimilates to sun letters).
- Egyptian uses `b-` prefix for habitual present: `بيتكلم` (he speaks regularly).

```
كلب {N m sg} [kalb] = pies
بيت {N m sg} [bēt] = dom
ست {N f sg} [sitt] = kobieta; pani

اتكلم {V impf} [itkallim] = mówić
شاف {V} [šāf] = widzieć
كان {V irreg} [kān] = był; być
عنده {Phrase} [ʿandu] = ma

كبير {Adj} [kibīr] = duży
صغير {Adj} [ṣuġīr] = mały
```

## Translation

Translate to Polish (`pol`).

## Notes

- Egyptian Arabic is the most widely understood Arabic dialect due to Egyptian cinema and television.
- Avoid mixing with MSA (`arb`) or other dialects in a single lesson.
