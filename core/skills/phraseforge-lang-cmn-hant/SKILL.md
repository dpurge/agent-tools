---
name: phraseforge-lang-cmn-hant
description: Mandarin Chinese Traditional (Putonghua, ISO 639-3 cmn, Traditional script hant) language conventions for PhraseForge lessons. Codes, Pinyin transcription, vocabulary shape (measure words, no gender/articles), and notes. Load whenever a PhraseForge lesson targets Mandarin in Traditional Chinese.
---

> **HOW TO USE THIS SKILL — MANDATORY.** You may be a small model. Follow these
> conventions EXACTLY. Copy the tag shapes, dictionary/citation forms, and line formats from
> the examples below **literally** — do not invent tags, do not add explanations
> or extra prose, do not change the format. Produce ONLY the output this step asks
> for, in the exact shape shown. When unsure, prefer the example over your own idea.

# Mandarin Chinese — Traditional (cmn, hant) language conventions

## Codes

- `lang`: `cmn`
- `script`: `hant`

## Transcription

Required (non-Latin script), inline on EVERY vocabulary and models entry AND for the full text.
System: **Pinyin** (attr `Pinyin`), applied as a HYBRID — the letter values below are the
scientific base; the reading rules make it read the way a Mandarin native reads aloud.

### Letter correspondences

**Initials (21):**

| Group | Initials |
|-------|----------|
| Bilabial | b, p, m |
| Labio-dental | f |
| Alveolar | d, t, n, l |
| Velar | g, k, h |
| Palatal | j, q, x |
| Retroflex | zh, ch, sh, r |
| Alveolar sibilant | z, c, s |
| Zero-initial spellings | y (before i/ü finals), w (before u finals) |

*y and w are orthographic conventions, not separate initials: 魚 yú, 我 wǒ, 月 yuè.*

**Finals:**

| Group | Finals |
|-------|--------|
| Simple | a, o, e, i, u, ü, er |
| Compound — no medial | ai, ei, ao, ou, an, en, ang, eng, ong |
| i-medial | ia, ie, iao, iu, ian, in, iang, ing, iong |
| u-medial | ua, uo, uai, ui, uan, un, uang, ueng |
| ü-medial | üe, üan, ün |

*iu = iou, ui = uei, un = uen in full form; ü dots dropped after j/q/x (ju, qu, xu — ü implied).*

**Tone marks (diacritic on the main vowel of the syllable):**

| Tone | Diacritic | Example |
|------|-----------|---------|
| 1st — level | ā | māo 貓 |
| 2nd — rising | á | máo 毛 |
| 3rd — falling-rising | ǎ | mǎo 卯 |
| 4th — falling | à | mào 帽 |
| Neutral — unstressed | (none) | ma 嗎 |

Placement rule: mark on a or e if present; on o in -ou; otherwise on the last vowel of the syllable.

### Reading rules (natural)

1. **Syllable word-grouping (詞連寫):** syllables belonging to one word are written together;
   separate words get a space. 北京大學 → *Běijīng Dàxué* (not *Běi Jīng Dà Xué*).
2. **Tone marks kept** on every syllable, including inside compound words.
3. **Neutral tone:** short, unstressed, no diacritic. Common in particles (的 *de*, 嗎 *ma*,
   了 *le*, 著 *zhe*, 過 *guo*) and the second syllable of reduplicates/common nouns (爸爸 *bàba*).
4. **Er-hua (兒化):** when 兒 reduces to a rhyme suffix, append *r* directly to the preceding
   syllable — NOT as a separate syllable: 哪兒 → *nǎr*, 這兒 → *zhèr*.
5. **Apostrophe rule:** when a syllable starting with a vowel (a/o/e) follows another syllable,
   insert `'` to prevent mis-parsing: 西安 → *Xī'ān*, 皮襖 → *pí'ǎo*.

### Typography (MANDATORY)

Pinyin is written in the **Latin script**, so it uses Latin-script typography — NEVER Chinese
punctuation, and it IS capitalized:

- **Punctuation:** use `, . ! ? : ; ' " ( )`. Convert every Chinese mark to its Latin equivalent
  (`，` and `、` → `,`; `。` → `.`; `：` → `:`; `？` → `?`; `！` → `!`; `；` → `;`; `""` → `"`;
  `（）` → `()`). Do NOT leave any of `，。、：？！；""（）` in the Pinyin.
- **Capitalization:** capitalize the first word of each sentence and all proper nouns (人名, 地名,
  brand/product names). Everything else lower-case.
- **Tone marks:** keep them. **Spacing:** standard Pinyin word grouping (a word's syllables joined,
  spaces between words).

### Example

```
你大概有過這種體驗：本來只想裝個輸入法。
Nǐ dàgài yǒu guò zhè zhǒng tǐyàn: běnlái zhǐ xiǎng zhuāng ge shūrùfǎ.
```

WRONG — Chinese punctuation left in, no capital: `nǐ dàgài yǒu guò zhè zhǒng tǐyàn：běnlái ... shūrùfǎ。`

## Vocabulary format

Field rules follow the injected **phraseforge-entry-format** skill. You return each entry as a JSON
object; the examples below show the RENDERED line. In the JSON you return, put the `grammar` content
WITHOUT `{ }` and the `transcription` WITHOUT `[ ]` — the renderer adds them. Mandarin-specific rules:

- **No grammatical gender, no articles, no inflection.** All nouns take `{N}`.
- **Measure words (classifiers):** mark a countable noun's measure word with its **Traditional
  Chinese character** in the tag — `{N 個}`, `{N 本}`, `{N 隻}`. If you are not sure of the correct
  measure word, use just `{N}`. NEVER romanize it (never `cl ge`, `cl ben`, `cl zhi`). In JSON that
  is `"grammar": "N 隻"`.
- **Verbs:** uninflected stem, tag `{V}` (add `irreg` for the few irregular forms).
- **Adjectives:** uninflected form, tag `{Adj}`.
- **Transcription is MANDATORY inline on EVERY entry** — the `[pinyin]` between the tag and the `=`.
  Never drop it; never move the pinyin to a separate line or list.
- Write all dictionary/citation forms in **Traditional** characters.

Rendered lines (Pinyin follows the typography rules above; Polish keeps its diacritics):

```
狗 {N 隻} [gǒu] = pies
書 {N 本} [shū] = książka
房子 {N} [fángzi] = dom
孩子 {N} [háizi] = dziecko

說話 {V} [shuōhuà] = mówić
看見 {V} [kànjiàn] = widzieć
是 {V} [shì] = być
有 {V} [yǒu] = mieć

小 {Adj} [xiǎo] = mały
快 {Adv} [kuài] = szybko
```

The JSON for the first line (no braces/brackets in the fields, `notes` null):

```json
{"phrase": "狗", "grammar": "N 隻", "transcription": "gǒu", "translation": "pies", "notes": null}
```

## Grammar notes (B1+)

- Chinese is **tonal** (4 tones + neutral); tone is part of the pronunciation of every syllable.
- **Topic-prominent** and **SOV/SVO** word order depending on construction.
- Aspect particles (了 *le*, 過 *guò*, 著 *zhe*) mark perfectivity, experience, ongoing state — not tense.
- Measure words are mandatory between a numeral and a noun.

## Translation

Translate to Polish (`pol`). Chinese `你` (`nǐ`) → informal; `您` (`nín`) → formal (`Pan`/`Pani`).

## Notes

- Traditional Chinese is used in Taiwan, Hong Kong, and Macau. The spoken language is the same as
  Simplified; only the written characters differ. For Simplified, see `phraseforge-lang-cmn-hans`.
- Most characters are identical between Simplified and Traditional; differences concentrate in a few
  hundred high-frequency characters (e.g., 说 → 說, 见 → 見, 个 → 個, 只 → 隻).
- In Taiwan, Zhuyin (bopomofo) is the standard in primary education, but Pinyin is widely understood
  and used here.
- Keep the `notes` field null for almost every entry (see the format skill). Add a note ONLY when an
  entry is genuinely ambiguous or hard to understand — a false friend, a non-obvious sense/usage, or
  an easily-confused word. Do NOT add TOCFL levels or literal glosses; TOCFL level is metadata, not a
  lesson note, and needless notes make the lesson harder to read.
