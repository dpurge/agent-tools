---
name: phraseforge-lang-arb
description: Modern Standard Arabic (al-arabiyya al-fusha, ISO 639-3 arb) language conventions for PhraseForge lessons. Codes, RTL script, DIN 31635 transcription, vocabulary shape (root-pattern morphology, gender, nunation), and notes. Load whenever a PhraseForge lesson targets Modern Standard Arabic.
---

> **HOW TO USE THIS SKILL — MANDATORY.** You may be a small model. Follow these
> conventions EXACTLY. Copy the tag shapes, dictionary/citation forms, and line formats from
> the examples below **literally** — do not invent tags, do not add explanations
> or extra prose, do not change the format. Produce ONLY the output this step asks
> for, in the exact shape shown. When unsure, prefer the example over your own idea.

# Modern Standard Arabic (arb) language conventions

## Codes

- `lang`: `arb`
- `script`: `arab`

## Transcription

Required (non-Latin script), inline on EVERY vocabulary and models entry AND for the full text.
System: **DIN 31635** (attr `DIN31635`), applied as a HYBRID — the letter values below are the
scientific base; the reading rules make it read the way an Arab reads aloud.

### Letter correspondences

Consonants:
| Arabic | DIN |
|--------|-----|
| ء | ʾ |
| ب | b |
| ت | t |
| ث | ṯ |
| ج | ǧ |
| ح | ḥ |
| خ | ḫ |
| د | d |
| ذ | ḏ |
| ر | r |
| ز | z |
| س | s |
| ش | š |
| ص | ṣ |
| ض | ḍ |
| ط | ṭ |
| ظ | ẓ |
| ع | ʿ |
| غ | ġ |
| ف | f |
| ق | q |
| ك | k |
| ل | l |
| م | m |
| ن | n |
| ه | h |
| و | w |
| ي | y |

Vowels & special glyphs:
| Sign | DIN | Note |
|------|-----|------|
| ـَ fatḥa | a | short |
| ـِ kasra | i | short |
| ـُ ḍamma | u | short |
| ا / ى | ā | long a (ى = alif maqṣūra) |
| و | ū | long u (else consonant w) |
| ي | ī | long i (else consonant y) |
| آ | ʾā | alif madda |
| ة | a / at | tāʾ marbūṭa: `a` in pause, `at` in construct (iḍāfa) |
| ـً ـٍ ـٌ | an / in / un | tanwīn — normally dropped (see rules); adverbial ـً `-an` IS read |
| ّ shadda | (double) | double the consonant: مدرّس → mudarris |
| ال | al- / (assim.) | definite article — see sun/moon rule |

### Reading rules (natural)

1. **Short vowels are written** from the vocalized/dictionary reading. If the source is unpointed and a
   vowel is genuinely ambiguous, write consonants + long vowels only and omit the uncertain short vowel;
   do not guess rare or dialectal forms.
2. **Sun-letter assimilation.** The article's `l` assimilates before the 14 sun letters
   (ت ث د ذ ر ز س ش ص ض ط ظ ل ن) → double that letter: الشمس → *aš-šams*, الرجل → *ar-raǧul*. Before moon
   letters keep `al-`: القمر → *al-qamar*.
3. **Hamzat al-waṣl elides** after a preceding vowel in connected reading: في المدرسة → *fī l-madrasa*;
   إلى البيت → *ilā l-bayt*.
4. **Case endings (iʿrāb) dropped by default** everywhere — including iḍāfa chains and vocative — kept
   only if the source is explicitly vocalized and marks them. Adverbial ـً is read: شكراً → *šukran*.
5. **tāʾ marbūṭa** → `a` in pause, `at` in construct: مدينة → *madīna*, but مدينة القاهرة → *madīnat
   al-Qāhira*.
6. Capitalize the first word of each sentence and all proper nouns; everything else lower-case.

### Typography

- Latin punctuation `, . ! ? : ; ' " ( )` — never Arabic `، ؛ ؟ «　»`.
- Keep all diacritics (ḥ ṣ ṭ ḍ ā ī ū š ġ ḫ ʿ ʾ …). Standard word spacing; hyphen after a kept `al-`.

### Example

`ذهب الطالب إلى المدرسة في الصباح.` → `Ḏahaba ṭ-ṭālib ilā l-madrasa fī ṣ-ṣabāḥ.`
(sun-letter assimilation aṭ-/aṣ-, waṣl elision after vowels, case endings dropped, tāʾ marbūṭa → `a`,
sentence-initial capital.)

*(Dialects `apc`/`arz` reuse this table with a short pronunciation delta in their own skills; Persian
`fas` uses Persian letter values — see its skill.)*

## Vocabulary format

Field rules follow the injected **phraseforge-entry-format** skill. Arabic-specific rules:

- **Nouns:** mark gender: `{N m}` / `{N f}`. For paradigm pairs (singular + broken plural), list both with `sg`/`pl`: `{N m sg}` / `{N m pl}`.
- **Verbs:** third-person masculine singular perfect (dictionary form). Tag `{V}`.
- **Adjectives:** masculine singular indefinite, tag `{Adj}`.
- Short vowels (harakat) should be included in dictionary/citation forms for learners at A1–B1.
- **Important for `transcription`: drop case endings / tanwīn by default** in vocabulary and models, even when the Arabic phrase itself is written with final nunation for learner clarity. Use the paused/native reading: `مَجَرَّةٌ` → `maǧarra`, `كَلْبٌ` → `kalb`, `كَبِيرٌ` → `kabīr`. Keep a final `-an` only for genuinely read adverbial accusatives such as `شكراً` → `šukran`, per the transcription rules above.

```
كَلْبٌ {N m sg} [kalb] = pies
كِلَابٌ {N m pl} [kilāb] = psy
بَيْتٌ {N m sg} [bayt] = dom
اِمْرَأَةٌ {N f sg} [imraʾa] = kobieta
مَجَرَّةٌ {N f sg} [maǧarra] = galaktyka

كَتَبَ {V} [kataba] = pisał; napisać
كَانَ {V irreg} [kāna] = był; być
رَأَى {V irreg} [raʾā] = widzieć

كَبِيرٌ {Adj} [kabīr] = duży; wielki
صَغِيرٌ {Adj} [ṣaġīr] = mały
```

## Grammar notes (B1+)

- Root-pattern (trilateral root) morphology: note the 3-letter root for each verb and key derived nouns.
- Dual and plural agreement rules differ from European languages; note broken plural patterns.
- Verbs agree in gender and number with subject.

## Translation

Translate to Polish (`pol`).

## Notes

- Modern Standard Arabic (fusha) is used in formal writing and media. Distinguish from spoken dialects (apc — Levantine, arz — Egyptian) when the source uses colloquial forms.
- Arabic script is **right-to-left**; vocabulary and dialog entries are RTL.
