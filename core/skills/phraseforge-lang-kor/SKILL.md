---
name: phraseforge-lang-kor
description: Korean (Hangugeo, ISO 639-3 kor) language conventions for PhraseForge lessons. Codes, Hangul script, Revised Romanization transcription, vocabulary shape (no gender/articles, honorific levels), and notes. Load whenever a PhraseForge lesson targets Korean.
---

> **HOW TO USE THIS SKILL — MANDATORY.** You may be a small model. Follow these
> conventions EXACTLY. Copy the tag shapes, dictionary/citation forms, and line formats from
> the examples below **literally** — do not invent tags, do not add explanations
> or extra prose, do not change the format. Produce ONLY the output this step asks
> for, in the exact shape shown. When unsure, prefer the example over your own idea.

# Korean (kor) language conventions

## Codes

- `lang`: `kor`
- `script`: `kore`

## Transcription

Required (non-Latin script), inline on EVERY vocabulary and models entry AND for the full text.
System: **Revised Romanization of Korean** (attr `RR`), applied as a HYBRID — the letter values
below are the scientific base; the reading rules reflect pronunciation (natural reading).

### Letter correspondences

Initial consonants (choseong), 19 total:

| Jamo | ㄱ | ㄲ | ㄴ | ㄷ | ㄸ | ㄹ | ㅁ | ㅂ | ㅃ | ㅅ | ㅆ | ㅇ | ㅈ | ㅉ | ㅊ | ㅋ | ㅌ | ㅍ | ㅎ |
|------|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|
| RR | g | kk | n | d | tt | r | m | b | pp | s | ss | — | j | jj | ch | k | t | p | h |

Vowels (jungseong), 21 total:

| Jamo | ㅏ | ㅐ | ㅑ | ㅒ | ㅓ | ㅔ | ㅕ | ㅖ | ㅗ | ㅘ | ㅙ | ㅚ | ㅛ | ㅜ | ㅝ | ㅞ | ㅟ | ㅠ | ㅡ | ㅢ | ㅣ |
|------|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|
| RR | a | ae | ya | yae | eo | e | yeo | ye | o | wa | wae | oe | yo | u | wo | we | wi | yu | eu | ui | i |

Final consonants — batchim (jongseong), pre-consonant or word-final value:

| Jamo | ㄱ | ㄲ | ㄴ | ㄷ | ㄹ | ㅁ | ㅂ | ㅅ | ㅆ | ㅇ | ㅈ | ㅊ | ㅋ | ㅌ | ㅍ | ㅎ |
|------|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|
| RR | k | k | n | t | l | m | p | t | t | ng | t | t | k | t | p | t |

Cluster batchim (ㄳ ㄵ ㄶ ㄺ ㄻ ㄼ ㄽ ㄾ ㄿ ㅀ ㅄ): one consonant surfaces depending on what
follows — apply rule (c) liaison before a vowel; otherwise the first (or phonologically dominant)
consonant sounds: ㄺ → k (닭 → *dak*), ㄻ → m (삶 → *sam*), ㄼ → l (여덟 → *yeodeol*).

### Reading rules (natural)

RR reflects pronunciation — apply these rules in order:

**(a) Nasalization.** A batchim stop assimilates to place of the following nasal (ㄴ or ㅁ):
- ㄱ-class (ㄱ ㄲ ㄺ) + ㄴ/ㅁ → ng: 국물 → *gungmul*, 학년 → *hangnyeon*
- ㄷ-class (ㄷ ㅅ ㅆ ㅈ ㅊ ㅌ ㅎ) + ㄴ/ㅁ → n: 닫는 → *danneun*
- ㅂ-class (ㅂ ㅍ ㄼ ㄿ ㅄ) + ㄴ/ㅁ → m: 입니다 → *imnida*, 감사합니다 → *gamsahamnida*

**(b) Lateralization.** ㄴ + ㄹ and ㄹ + ㄴ both → ll:
전라도 → *Jeollado*, 설날 → *Seollal*.

**(c) Batchim liaison.** A batchim followed by a vowel-initial syllable (ㅇ onset) moves to that
onset; for cluster batchim the rightmost consonant moves:
먹어요 → *meogeoyo*, 한국어 → *Hangugeo*, 닭을 → *dalgeul*.

**(d) ㅢ distribution.** Syllable-initially (ㅇ silent onset): → *ui*: 의자 → *uija*.
Elsewhere (consonant onset or mid-word): → *i*: 무늬 → *muni*, 희망 → *himang*.

**(e) Aspiration.** ㄱ/ㄷ/ㅂ/ㅈ adjacent to ㅎ merge into the aspirated form:
- ㄱ+ㅎ or ㅎ+ㄱ → k (aspirated, written k): 북한 → *Bukhan*
- ㄷ+ㅎ or ㅎ+ㄷ → t (aspirated, written t): 맏형 → *matyeong*
- ㅂ+ㅎ or ㅎ+ㅂ → p (aspirated, written p): 입학 → *iphak*
- ㅈ+ㅎ or ㅎ+ㅈ → ch: 좋지 → *jochi*

**(f) Palatalization.** ㄷ/ㅌ before 이 (or 히) → j/ch:
해돋이 → *haedoji*, 굳히다 → *guchida*.

ㄹ distribution: initial position → r; batchim or pre-consonant → l; doubled (ㄹㄹ) → ll.

### Typography

- Latin punctuation `, . ! ? : ; ' " ( )` — never source-script punctuation.
- Capitalize the first word of each sentence and all proper nouns; everything else lower-case.
- No diacritics needed (RR is ASCII). Standard word spacing.

### Example

`감사합니다.` → `Gamsahamnida.`
(nasalization rule a: batchim ㅂ of 합 + onset ㄴ of 니 → m, giving *ham-ni-da*; sentence-initial capital.)

## Vocabulary format

Field rules follow the injected **phraseforge-entry-format** skill. Korean-specific rules:

- **No grammatical gender, no articles.** All nouns take `{N}`. Sino-Korean (`{N sino}`) vs. native Korean (`{N native}`) origin can be noted.
- **Verbs:** dictionary form (ending `-다`), tag `{V}`. Mark formality if the source is specifically formal/informal: `{V formal}` / `{V informal}`.
- **Adjectives:** dictionary form (ending `-다`), tag `{Adj}`.

```
개 {N native} [gae] = pies
집 {N native} [jip] = dom
여자 {N sino} [yeoja] = kobieta
아이 {N native} [ai] = dziecko

말하다 {V} [malhada] = mówić
보다 {V} [boda] = widzieć
이다 {V} [ida] = być (kopula)
있다 {V} [itda] = mieć; być; istnieć

작다 {Adj} [jakda] = być małym
빠르다 {Adj} [ppareuda] = być szybkim
```

## Grammar notes (B1+)

- Korean word order is **SOV**. Postpositions (subject marker `-이/가`, object marker `-을/를`, topic marker `-은/는`, etc.) mark grammatical roles.
- **Speech levels** (honorifics) are grammatically encoded; verbs change form based on the relationship between speaker and listener. Standard polite: `-아요/어요`; formal polite: `-(스)ㅂ니다`.
- Sino-Korean vocabulary (from Chinese) coexists with native Korean; Sino-Korean numbers vs. native Korean numbers are used in different contexts.

## Translation

Translate to Polish (`pol`). Korean `너` (`neo`) → informal; `당신` (`dangsin`) or honorific forms → `Pan`/`Pani`.

## Notes

- Hangul is a phonemic alphabet arranged in syllabic blocks — it is relatively easy to learn to read (~1–2 days for the alphabet).
- TOPIK vocabulary levels (1–6) can be noted in the `notes` field.
