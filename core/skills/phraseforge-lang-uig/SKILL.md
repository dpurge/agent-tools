---
name: phraseforge-lang-uig
description: Uyghur (Uyghurche, ISO 639-3 uig) language conventions for PhraseForge lessons — Arabic script (Uyghur Perso-Arabic alphabet, standard in Xinjiang). Codes, RTL script, ULY/Chagatai-Latin transcription, agglutinative vocabulary shape, and notes. Load whenever a PhraseForge lesson targets Uyghur.
---

> **HOW TO USE THIS SKILL — MANDATORY.** You may be a small model. Follow these
> conventions EXACTLY. Copy the tag shapes, dictionary/citation forms, and line formats from
> the examples below **literally** — do not invent tags, do not add explanations
> or extra prose, do not change the format. Produce ONLY the output this step asks
> for, in the exact shape shown. When unsure, prefer the example over your own idea.

# Uyghur (uig) language conventions

## Codes

- `lang`: `uig`
- `script`: `arab`

Note: phraseforge-data stores Uyghur in `uig-cyrl` (Cyrillic); the canonical literary script and the script of this skill is the **Uyghur Arabic alphabet** (Perso-Arabic, RTL). If the source file uses Cyrillic, adapt accordingly and note the script in the lesson description.

## Transcription

Required (non-Latin script), inline on EVERY vocabulary and models entry AND for the full text.
System: **ULY** (Uyghur Latin Yëziqi, attr `ULY`) — the official standardized Latin orthography for
Uyghur, phonemic and Latin-target. Unlike Arabic proper, Uyghur Arabic script always marks all 8 vowels
explicitly, so no vowel-supply step is needed.

### Letter correspondences

**Vowels** (8; Uyghur Arabic vowel letters each map to a distinct ULY letter):

| Arabic | ULY | IPA |
|--------|-----|-----|
| ئا | a | /ɑ/ |
| ئە | e | /æ~ɛ/ |
| ئى | i | /ɪ~ɯ/ |
| ئې | ë | /e/ |
| ئو | o | /o/ |
| ئۇ | u | /u/ |
| ئۆ | ö | /ø/ |
| ئۈ | ü | /y/ |

**Consonants** (24):

| Arabic | ULY | | Arabic | ULY | | Arabic | ULY |
|--------|-----|-|--------|-----|-|--------|-----|
| ب | b | | ز | z | | گ | g |
| پ | p | | ژ | zh | | ڭ | ng |
| ت | t | | س | s | | ل | l |
| ج | j | | ش | sh | | م | m |
| چ | ch | | غ | gh | | ن | n |
| خ | x | | ف | f | | ھ | h |
| د | d | | ق | q | | ۋ | w |
| ر | r | | ك | k | | ي | y |

### Reading rules (natural)

1. **One-to-one mapping.** Each Uyghur Arabic letter corresponds to exactly one ULY letter or digraph
   per the table above. No additional conversion rules are required.
2. **Vowels always explicit.** Uyghur Arabic script marks all vowels; every vowel in the source has a
   direct ULY equivalent — transcribe it directly.
3. **Digraphs.** ch, sh, zh, gh, ng are ULY representations of single consonant phonemes. Treat each
   digraph as one unit; do not split (e.g., sh → sh, not s + h).
4. **Word-initial vowel onset.** Uyghur Arabic vowel letters carry a silent ئ (alif with hamza) at word
   beginning; this onset is not transcribed in ULY — only the vowel letter is rendered.
5. **Vowel harmony.** Uyghur is a vowel-harmony language: suffixes take their front-vowel (e/ë/i/ö/ü)
   or back-vowel (a/o/u) form based on the last stem vowel. Transcribe each suffix as written in the source.
6. **Gemination.** Doubled consonants written in the Arabic script are doubled in ULY.

### Typography

- Latin punctuation `, . ! ? : ; ' " ( )` — never Arabic `، ؛ ؟ «　»`.
- Capitalize the first word of each sentence and all proper nouns; everything else lower-case.
- Keep diacritics (ë ö ü). Standard word spacing.

### Example

`ئۆيدە كۆپ كىتاب بار.` → `Öyde köp kitab bar.`
(ئۆ→ö, ي→y, د→d, ە→e: öyde; ك→k, ۆ→ö, پ→p: köp; ك→k, ى→i, ت→t, ا→a, ب→b: kitab;
ب→b, ا→a, ر→r: bar; every vowel in the Arabic source has a direct ULY mapping; sentence-initial capital.)

## Vocabulary format

Field rules follow the injected **phraseforge-entry-format** skill. Uyghur-specific rules:

- **No grammatical gender.** All nouns take `{N}`. Plural is formed with `لار-` / `لەر-` (`-lar`/`-ler`) suffix (vowel harmony).
- **Verbs:** infinitive/dictionary form (verb stem + `-maq`/`-mek`), tag `{V}`.
- **Adjectives:** uninflected form, tag `{Adj}`.

```
ئىت {N} [it] = pies
öy {N} [öy] = dom
ئايال {N} [ayal] = kobieta
بالا {N} [bala] = dziecko

سۆزلىمەك {V} [sözlimek] = mówić
كۆرمەك {V} [körmek] = widzieć
بولماق {V} [bolmaq] = być
بارماق {V} [barmaq] = iść

كىچىك {Adj} [kichik] = mały
تېز {Adv} [tëz] = szybko
```

## Grammar notes (B1+)

- **Agglutinative SOV** language. Suffixes stack: case, plural, possessive, verb tense/aspect/person are all expressed by suffixes.
- **Vowel harmony**: suffixes alternate based on the last vowel of the stem (front/back).
- Verb tenses: present-future (`-idu`), past definite (`-di`), past evidential (`-ptiman`), etc.

## Translation

Translate to Polish (`pol`).

## Notes

- Uyghur is a Turkic language closely related to Uzbek. It uses the Perso-Arabic script (RTL) in China and Central Asia; a Cyrillic variant exists in former Soviet states.
- The Arabic-script Uyghur alphabet uses a full set of vowel letters (unlike Arabic proper, where short vowels are often omitted).
