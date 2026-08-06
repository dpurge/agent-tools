---
name: phraseforge-lang-apc
description: North Levantine Arabic (ISO 639-3 apc) — Syrian/Lebanese colloquial Arabic — language conventions for PhraseForge lessons. Load whenever a PhraseForge lesson targets Levantine Arabic.
---

> **HOW TO USE THIS SKILL — MANDATORY.** You may be a small model. Follow these
> conventions EXACTLY. Copy the tag shapes, dictionary/citation forms, and line formats from
> the examples below **literally** — do not invent tags, do not add explanations
> or extra prose, do not change the format. Produce ONLY the output this step asks
> for, in the exact shape shown. When unsure, prefer the example over your own idea.

# North Levantine Arabic (apc) language conventions

## Codes

- `lang`: `apc`
- `script`: `arab`

## Transcription

Required (non-Latin script), inline on EVERY vocabulary and models entry AND for the full text.
System: **DIN 31635** (attr `DIN31635`), applied as a HYBRID — the full letter table is in
`phraseforge-lang-arb`; the delta below covers sounds that differ in North Levantine colloquial Arabic.

### Letter correspondences

Complete DIN 31635 table: see `phraseforge-lang-arb`. Apply these **dialect delta** values in place of
the corresponding arb entries:

| Arabic | arb/DIN base | apc (North Levantine) | Note |
|--------|-------------|----------------------|------|
| ج | ǧ | ž | Realized as /ʒ/ in Syrian speech (like French *jour*); Lebanese variant may retain ǧ /dʒ/ |
| ق | q | ʾ | Glottal stop in urban speech (Damascus, Aleppo, Beirut); rural/Druze speakers retain q |
| ث | ṯ | t / s | Classical /θ/ → /t/ (most words) or /s/ (before front vowels); transcribe as spoken |
| ذ | ḏ | d | Classical /ð/ → /d/ in colloquial Levantine |

### Reading rules (natural)

1. **Dialect consonants.** Apply the delta table: ج → ž; ق → ʾ (urban); ث → t (or s); ذ → d.
2. **Definite article: `il-`** (not `al-`). Sun-letter assimilation applies unchanged: the article `l`
   assimilates to the following sun letter (ت ث د ذ ر ز س ش ص ض ط ظ ل ن) and is doubled:
   `il-šams` → `iš-šams`, `il-dār` → `id-dār`, `il-nās` → `in-nās`.
   Before moon letters keep `il-`: `il-bēt`, `il-žanūbī`.
3. **Imāla (vowel raising).** Long /aː/ raises toward /eː/ in many Levantine lexical items; short
   /a/ → /e/ in certain syllable positions. Transcribe the spoken vowel: *bēt* (بيت, "house"),
   *ktīr* (كتير, "a lot"), *šī* (شي, "thing").
4. **Short vowels** written from the spoken colloquial form; case endings (iʿrāb) dropped.
5. **Gemination** (shadda) shown by doubling the consonant.
6. **Consonant clusters** are common in spoken Levantine; supply short vowels as actually spoken,
   not the MSA dictionary form.

### Typography

- Latin punctuation `, . ! ? : ; ' " ( )` — never Arabic `، ؛ ؟ «　»`.
- Capitalize the first word of each sentence and all proper nouns; everything else lower-case.
- Keep all diacritics (ž ā ī ū š ġ ḥ ʿ ʾ …). Standard word spacing; hyphen after `il-`.

### Example

`المطعم قريب من الشارع الجنوبي.` → `Il-maṭʿam ʾrīb min iš-šāriʿ il-žanūbī.`
(ق → ʾ in قريب; ج → ž in جنوبي; `il-` article; sun-letter assimilation `iš-` before ش;
no assimilation before moon letter م; case endings dropped.)

## Vocabulary format

Field rules follow the injected **phraseforge-entry-format** skill and `phraseforge-lang-arb`. Levantine-specific notes:

- **Nouns:** mark gender: `{N m}` / `{N f}`. Broken plurals listed separately with `{N m pl}` / `{N f pl}`.
- **Verbs:** third-person masculine singular perfect (dictionary form), tag `{V}`.
- Definite article: `l-` / `il-` (assimilates to sun letters).

```
كلب {N m sg} [kalb] = pies
بيت {N m sg} [bēt] = dom
ست {N f sg} [sitt] = kobieta; pani

حكى {V} [ḥakā] = mówić
شاف {V} [šāf] = widzieć
كان {V irreg} [kān] = był; być
عنده {Phrase} [ʿndo] = ma (on ma)
```

## Translation

Translate to Polish (`pol`).

## Notes

- Levantine Arabic differs significantly from MSA (`arb`) in phonology, morphology, and vocabulary. Avoid mixing the two in a single lesson.
- Distinguish Syrian (`apc`) from Lebanese colloquial when relevant; they share most features.
