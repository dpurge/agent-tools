---
name: phraseforge-lang-heb
description: Hebrew (Ivrit, ISO 639-3 heb) language conventions for PhraseForge lessons. Codes, RTL Hebrew script, SBL transcription, vocabulary shape (gender, no indefinite article, definite ha-), and notes. Load whenever a PhraseForge lesson targets Hebrew.
---

> **HOW TO USE THIS SKILL — MANDATORY.** You may be a small model. Follow these
> conventions EXACTLY. Copy the tag shapes, dictionary/citation forms, and line formats from
> the examples below **literally** — do not invent tags, do not add explanations
> or extra prose, do not change the format. Produce ONLY the output this step asks
> for, in the exact shape shown. When unsure, prefer the example over your own idea.

# Hebrew (heb) language conventions

## Codes

- `lang`: `heb`
- `script`: `hebr`

## Transcription

Required (non-Latin script), inline on EVERY vocabulary and models entry AND for the full text.
System: **SBL Hebrew** (attr `SBL`), applied as a HYBRID — the letter values below are the
scientific base; the reading rules reflect Modern Hebrew pronunciation.

### Letter correspondences

**Consonants (22 letters):**

| Hebrew | SBL |
|--------|-----|
| א | ʾ |
| ב | b / v |
| ג | g |
| ד | d |
| ה | h |
| ו | v |
| ז | z |
| ח | ḥ |
| ט | ṭ |
| י | y |
| כ | k / kh |
| ל | l |
| מ | m |
| נ | n |
| ס | s |
| ע | ʿ |
| פ | p / f |
| צ | ṣ |
| ק | q |
| ר | r |
| שׁ | š |
| שׂ | ś |
| ת | t |

**Final forms** (same consonant value, different glyph):

| Final | Base | SBL |
|-------|------|-----|
| ך | כ | kh |
| ם | מ | m |
| ן | נ | n |
| ף | פ | f |
| ץ | צ | ṣ |

**Dagesh lene** (ב כ פ only in Modern Hebrew — hard/soft alternation):

| With dagesh | Value | Without dagesh | Value |
|-------------|-------|----------------|-------|
| בּ | b | ב | v |
| כּ | k | כ / ך | kh |
| פּ | p | פ / ף | f |

**Dagesh forte** (any letter) → double that consonant: שַׁבָּת → šabbat.

**Matres lectionis** (consonant letters used to anchor vowels):

| Mater | Role |
|-------|------|
| א | anchors a/e vowel position (phonetically silent in modern) |
| ה | marks final a/e vowel (silent in modern unless carrying niqqud) |
| ו (with holam dot) | anchors o |
| ו (with shureq dot) | anchors u |
| י | anchors i/e |

**Vowels (niqqud) — Modern Hebrew values; no historical length grading:**

| Sign | Name | Value | | Sign | Name | Value |
|------|------|-------|-|------|------|-------|
| ַ | patah | a | | ֹ / וֹ | holam / vav-holam | o |
| ָ | qamats | a | | ֻ | qibbuts | u |
| ֶ | segol | e | | וּ | shureq | u |
| ֵ | tsere | e | | ְ (vocal) | sheva na | ĕ |
| ִ | hiriq | i | | ְ (silent) | sheva nach | (silent) |
| ֲ | hatef-patah | ă | | ֱ | hatef-segol | ĕ |
| ֳ | hatef-qamats | ŏ | | | | |

**Shin / sin dot:**

| Sign | Value |
|------|-------|
| שׁ (dot right — shin) | š |
| שׂ (dot left — sin) | ś |

### Reading rules (natural)

1. **Supply vowels from the pointed text.** Read each niqqud sign from the vowel table above.
   When the source is unpointed and a vowel is ambiguous, transcribe consonants and matres
   lectionis only; do not guess uncertain short vowels.
2. **Modern Hebrew simplifications** — do not apply Biblical length distinctions:
   - Qamats always → `a`; no qamats-qatan grading.
   - Patah = qamats = `a`; segol = tsere = `e`; hiriq = `i`; holam = `o`; qibbuts = shureq = `u`.
   - Sheva na → `ĕ`; sheva nach → silent (write nothing).
   - Hatef-patah → `ă`; hatef-segol → `ĕ`; hatef-qamats → `ŏ`.
3. **Dagesh forte doubles the consonant:** שַׁבָּת → *šabbat*; חֲנֻכָּה → *ḥanukka*.
4. **Silent consonants in Modern Hebrew.** א and ע are phonetically silent; romanize ʾ/ʿ in
   pointed text (SBL convention) but do not treat them as audible stops. Final ה is silent
   unless it carries a niqqud vowel.
5. **Consonantal vav → `v`** in modern pronunciation. Do not use Classical SBL `w`.
6. **Definite article** הַ/הָ → `ha-` before most consonants; stays `ha-` before gutturals.
7. Capitalize the first word of each sentence and all proper nouns; everything else lower-case.

### Typography

- Latin punctuation `, . ! ? : ; ' " ( )` — never Hebrew `״ ׳` or RTL punctuation marks.
- Keep all SBL diacritics (ʾ ʿ ḥ ṭ ṣ š ś ĕ ă ŏ). Standard left-to-right word spacing.

### Example

`שַׁבָּת שָׁלוֹם` → `Šabbat šalom`
(dagesh forte doubles b → *šabb-*; qamats → a; holam → o; sentence-initial capital.)

## Vocabulary format

Field rules follow the injected **phraseforge-entry-format** skill. Hebrew-specific rules:

- **Nouns:** mark gender: `{N m}` / `{N f}`. No indefinite article in Hebrew; the definite article is the prefix `ה` (`ha-`). Use the bare form as the dictionary/citation form.
- **Verbs:** infinitive (with `ל`-prefix: `לכתוב`), or root form. Tag `{V}`. Mark binyan (verb pattern) when helpful: `{V qal}`, `{V piel}`, `{V hifil}`, etc.
- **Adjectives:** masculine singular form, tag `{Adj}`.

```
כלב {N m} [kelev] = pies
בית {N m} [bayit] = dom
אישה {N f} [ʾiššāh] = kobieta
ילד {N m} [yeled] = dziecko

לדבר {V piel} [ledaber] = mówić
לראות {V qal} [lirʾot] = widzieć
להיות {V qal irreg} [lihyot] = być
להיות ל {Phrase} [lihyot le] = mieć

קטן {Adj} [qaṭan] = mały
מהר {Adv} [maher] = szybko
```

## Grammar notes (B1+)

- Hebrew root (shoresh) system: 3-letter roots generate families of related words via binyanim (verb patterns) and mishkalim (noun patterns). Note the 3-letter root for each verb.
- Gender agreement: adjectives and verbs agree with the subject in gender and number.

## Translation

Translate to Polish (`pol`). Modern Hebrew has informal `אתה`/`את` (you m./f.) and no formal T-V distinction.

## Notes

- Hebrew script is **right-to-left**. Pointed text (with nikud vowel marks) is used in textbooks and recommended for A1–B1 learners.
- Biblical Hebrew vs. Modern Hebrew differ significantly; note which register the source uses.
