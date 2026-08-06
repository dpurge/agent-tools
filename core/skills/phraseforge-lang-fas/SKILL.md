---
name: phraseforge-lang-fas
description: Persian/Farsi (Farsi, ISO 639-3 fas) language conventions for PhraseForge lessons. Codes, RTL Arabic script, DIN 31635 transcription, vocabulary shape (no grammatical gender, SOV order), and notes. Load whenever a PhraseForge lesson targets Persian.
---

> **HOW TO USE THIS SKILL — MANDATORY.** You may be a small model. Follow these
> conventions EXACTLY. Copy the tag shapes, dictionary/citation forms, and line formats from
> the examples below **literally** — do not invent tags, do not add explanations
> or extra prose, do not change the format. Produce ONLY the output this step asks
> for, in the exact shape shown. When unsure, prefer the example over your own idea.

# Persian / Farsi (fas) language conventions

## Codes

- `lang`: `fas`
- `script`: `arab`

## Transcription

Required (non-Latin script), inline on EVERY vocabulary and models entry AND for the full text.
System: **DIN 31635** (attr `DIN31635`), adapted for Persian — the letter values below are the
scientific base; the reading rules make it read the way a Persian speaker reads.

### Letter correspondences

**Consonants with Persian-adapted values (differ from arb DIN — always use the fas column):**

| Persian | Fas | Note — Persian phoneme / arb DIN value |
|---------|-----|-----------------------------------------|
| ث | s | /s/ — arb DIN: ṯ |
| ح | ḥ | grapheme kept (= arb DIN ḥ); pronounced /h/ in Persian, merges with ه |
| خ | x | /x/ — arb DIN: ḫ |
| ذ | z | /z/ — arb DIN: ḏ |
| ص | s | /s/ — arb DIN: ṣ |
| ض | z | /z/ — arb DIN: ḍ |
| ط | t | /t/ — arb DIN: ṭ |
| ظ | z | /z/ — arb DIN: ẓ |
| و | v | /v/ consonant — arb DIN: w |

Result: ث/س/ص → all `s`; ذ/ز/ض/ظ → all `z`; ط/ت → `t`; ح → `ḥ` (grapheme, read /h/); ه → `h`; خ → `x`; و → `v` (consonant).

**Persian-specific letters (not in Arabic alphabet):**

| Persian | Fas |
|---------|-----|
| پ | p |
| چ | č |
| ژ | ž |
| گ | g |

**Remaining consonants (same value as arb DIN):**

| Persian | Fas | | Persian | Fas | | Persian | Fas |
|---------|-----|-|---------|-----|-|---------|-----|
| ء | ʾ | | ر | r | | ف | f |
| ب | b | | ز | z | | ق | q |
| ت | t | | س | s | | ک / ك | k |
| ج | ǧ | | ش | š | | ل | l |
| د | d | | ع | ʿ | | م | m |
| | | | غ | ġ | | ن | n |
| | | | | | | ی / ي | y |

Note: ع is kept as grapheme marker ʿ; pronounced /ʔ/ or elided in Persian (not pharyngeal as in Arabic).

**Vowels and special glyphs:**

| Sign | Fas | Note |
|------|-----|----|
| ـَ (fatha) | a | short /æ/ |
| ـِ (kasra) | e | short /e/ — NOT i as in arb |
| ـُ (damma) | o | short /o/ — NOT u as in arb |
| آ / ـَا | ā | long /ɑː/ |
| ی / ـِی | i | long /iː/ (ی as vowel) |
| و / ـُو | u | long /uː/ (و as vowel) |
| ـه (word-final) | -e | final ه after consonant = vowel /e/, NOT h: خانه → xāne |
| ezāfe after consonant | -e | pedar-e bozorg (پدر بزرگ, "father's / big") |
| ezāfe after vowel or ـه | -ye | xāne-ye bozorg (خانه‌ی بزرگ, "the big house") |

### Reading rules (natural)

1. **Use the fas column, never the arb DIN value.** Letters ث ص → `s`; ذ ض ظ → `z`; ط → `t`;
   خ → `x`; و → `v` (consonant) take their Persian phoneme value. ح → `ḥ` is the ONE arb diacritic
   KEPT (as a grapheme marker; pronounced /h/, merging with ه → `h`). The other arb diacritics
   (ṯ ṣ ḏ ḍ ẓ ṭ ḫ) must not appear in Persian transcription.
2. **Short vowels: e and o (not i and u).** Kasra = `e`; damma = `o`. Long vowels: ā, i, u.
3. **Word-final ه.** After a consonant, final ه marks the vowel /e/ — transcribe as the vowel, not h:
   خانه → `xāne`, روزنامه → `ruznāme`. After a long vowel, final ه is consonant h: ماه → `māh`.
4. **Ezāfe construction.** The grammatical linker is written as a suffix: `-e` after a consonant,
   `-ye` after a vowel (including word-final ه): `ketāb-e kučak` ("small book"),
   `xāne-ye bozorg` ("big house").
5. **Short vowels always written** from the dictionary/standard pronunciation. Persian text is usually
   unvocalized; supply vowels from the standard reading (no guessing on rare or dialect forms).
6. **Gemination** (Arabic loanwords with shadda) shown by doubling: مسئله → `masʾale`.

### Typography

- Latin punctuation `, . ! ? : ; ' " ( )` — never Arabic/Persian `، ؛ ؟ «　»`.
- Capitalize the first word of each sentence and all proper nouns; everything else lower-case.
- Keep all diacritics (ā ī ū š ž č ġ ʿ ʾ …). Standard word spacing; hyphen in ezāfe constructions.

### Example

`دوست من به خانه رفت.` → `Dūst-e man be xāne raft.`
(خ → x in xāne; final ه = vowel -e in xāne; ezāfe -e after consonant in dūst-e man;
و as long vowel ū in dūst; short e in be; short a in man, raft; case endings dropped.)

## Vocabulary format

Field rules follow the injected **phraseforge-entry-format** skill. Persian-specific rules:

- **No grammatical gender.** All nouns take `{N}`.
- **Nouns:** bare dictionary/citation form, no articles. Plural formed by `ها-` (`-hā`) suffix.
- **Verbs:** infinitive form (ending in `-an`/`-dan`). Tag `{V}`. Add `irreg` for irregular stems.
- **Adjectives:** uninflected form, tag `{Adj}`.

```
سگ {N} [sag] = pies
خانه {N} [xāne] = dom
زن {N} [zan] = kobieta
بچه {N} [bačče] = dziecko

حرف زدن {V} [ḥarf zadan] = mówić
دیدن {V} [dīdan] = widzieć
بودن {V irreg} [budan] = być
داشتن {V irreg} [dāštan] = mieć

کوچک {Adj} [kūčak] = mały
سریع {Adv} [sarīʿ] = szybko
```

## Grammar notes (B1+)

- Persian word order is **SOV** (Subject–Object–Verb).
- The **ezafe** construction (`-e`) links nouns to modifiers: `خانه‌ی بزرگ` (`xāne-ye bozorg` = the big house).
- Verb conjugation is regular for most verbs; the present stem (vs. infinitive) must be learned.

## Translation

Translate to Polish (`pol`).

## Notes

- Persian script is **right-to-left**; inherits Arabic letters with 4 additional letters (پ چ ژ گ).
- Persian is not a Semitic language (it is Indo-Iranian); do not assume Arabic root morphology applies.
