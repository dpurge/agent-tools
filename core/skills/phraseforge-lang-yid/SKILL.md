---
name: phraseforge-lang-yid
description: Yiddish (Yidish, ISO 639-3 yid) language conventions for PhraseForge lessons. Codes, RTL Hebrew script, YIVO transcription, vocabulary shape (Germanic grammar in Hebrew letters, gender), and notes. Load whenever a PhraseForge lesson targets Yiddish.
---

> **HOW TO USE THIS SKILL — MANDATORY.** You may be a small model. Follow these
> conventions EXACTLY. Copy the tag shapes, dictionary/citation forms, and line formats from
> the examples below **literally** — do not invent tags, do not add explanations
> or extra prose, do not change the format. Produce ONLY the output this step asks
> for, in the exact shape shown. When unsure, prefer the example over your own idea.

# Yiddish (yid) language conventions

## Codes

- `lang`: `yid`
- `script`: `hebr`

## Transcription

Required (non-Latin script), inline on EVERY vocabulary and models entry AND for the full text.
System: **YIVO** (attr `YIVO`), phonemic — the letter values below directly represent standard
Eastern Yiddish pronunciation (YIVO standard).

### Letter correspondences

**Alef-beys — single letters:**

| Yiddish | Name | YIVO | | Yiddish | Name | YIVO |
|---------|------|------|-|---------|------|------|
| א | shtumer alef | (silent) | | ל | lamed | l |
| אַ | pasekh alef | a | | מ | mem | m |
| אָ | komets alef | o | | נ | nun | n |
| בּ | beys | b | | ס | samekh | s |
| ב | veys | v | | ע | ayen | e |
| ג | giml | g | | פּ | pey | p |
| ד | daled | d | | פ | fey | f |
| ה | hey | h | | צ | tsadek | ts |
| ו | vov | u | | ק | kuf | k |
| וּ | melupm vov | u | | ר | reysh | r |
| ז | zayen | z | | שׁ | shin | sh |
| ח | khes | kh | | שׂ | sin | s |
| ט | tes | t | | תּ | tof | t |
| י | yud | y / i | | ת | sof | s |
| כ | khof | kh | | כּ | kof | k |

**Final forms** (identical value to the non-final form — a model must recognize these):

| Final | Non-final | YIVO value |
|-------|-----------|------------|
| ם | מ | m |
| ן | נ | n |
| ף | פ | f |
| ץ | צ | ts |
| ך | כ | kh |

**Digraphs — check BEFORE applying single-letter rules:**

| Yiddish | Name | YIVO |
|---------|------|------|
| וו | tsvey vovn | v |
| וי | vov-yud | oy |
| יי | tsvey yudn | ey |
| ײַ | pasekh tsvey yudn | ay |
| זש | zayen-shin | zh |
| טש | tes-shin | tsh |
| דזש | daled-zayen-shin | dzh |

### Reading rules (natural)

1. **Digraphs first.** Before reading individual letters, identify any digraph above:
   וו → `v`; וי → `oy`; יי → `ey`; ײַ → `ay`; זש → `zh`; טש → `tsh`; דזש → `dzh`.
2. **Shtumer alef (א) is silent** — it is a vowel carrier. Romanize only the diacritic it
   holds: pasekh (אַ) → `a`, komets (אָ) → `o`; bare alef → nothing.
3. **Yud (י):** before a vowel letter → `y` (consonantal); as a vowel in other positions → `i`.
4. **Vov (ו):** as a standalone vowel → `u`; melupm vov (וּ) → `u`; in digraph וו → `v`.
5. **Hebrew/Aramaic-origin letters** [H]: these appear only in words of Hebrew/Aramaic origin —
   khes (ח)→`kh`; kof (כּ)→`k`; sin (שׂ)→`s`; tof (תּ)→`t`; sof (ת)→`s`.
6. **No double consonants** in YIVO transcription.
7. YIVO is phonemic — transcription reflects standard spoken Eastern Yiddish, not spelling.
8. Capitalize the first word of each sentence and all proper nouns; everything else lower-case.

### Typography

- Latin punctuation `, . ! ? : ; ' " ( )` — never Yiddish/Hebrew `„ " ״` or RTL marks.
- Keep standard YIVO romanization. Standard left-to-right word spacing in transcription.

### Example

`איך גיי אַהיים.` → `Ikh gey aheym.`
(shtumer alef + yud → i: *ikh*; tsvey yudn יי → ey: *gey*; pasekh alef + hey + יי + mem →
*aheym*; sentence-initial capital.)

## Vocabulary format

Field rules follow the injected **phraseforge-entry-format** skill. Yiddish-specific rules (grammar is Germanic, written in Hebrew letters):

- **Nouns:** Yiddish has 3 genders: `m`, `f`, `n`. Include the **definite article** (`דער`/`der` m., `די`/`di` f., `דאָס`/`dos` n.) in the dictionary/citation form. Mark gender: `{N m}` / `{N f}` / `{N n}`.
- **Verbs:** infinitive (ending `-n` or `-en`), tag `{V}`.
- **Adjectives:** uninflected predicative form, tag `{Adj}`.

```
דער הונט {N m} [der hunt] = pies
דאָס הויז {N n} [dos hoyz] = dom
די פרוי {N f} [di froy] = kobieta
דאָס קינד {N n} [dos kind] = dziecko

רעדן {V} [redn] = mówić
זען {V irreg} [zen] = widzieć
זיין {V irreg} [zayn] = być
האָבן {V irreg} [hobn] = mieć

קלײן {Adj} [kleyn] = mały
גיך {Adv} [gikh] = szybko
```

## Grammar notes (B1+)

- Yiddish grammar closely follows German; 4 cases (Nominative, Accusative, Dative, Genitive — genitive is archaic). Article and adjective endings follow German patterns.
- Extensive Hebrew/Aramaic component: many learned/religious terms come from Hebrew.

## Translation

Translate to Polish (`pol`). Yiddish `du` → informal; `ir` (formal/plural) → `Pan`/`Pani`/`wy`.

## Notes

- Yiddish script is **right-to-left** and uses Hebrew letters but represents a Germanic language.
- Two major dialect groups: Ashkenazic Eastern Yiddish (YIVO standard) and Western Yiddish (nearly extinct). Default to YIVO Eastern.
