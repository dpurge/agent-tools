---
name: phraseforge-lang-jpn
description: Japanese (Nihongo, ISO 639-3 jpn) language conventions for PhraseForge lessons. Codes, mixed Japn script, Hepburn transcription, vocabulary shape (no gender/articles, JLPT levels as notes), politeness levels, and notes. Load whenever a PhraseForge lesson targets Japanese.
---

> **HOW TO USE THIS SKILL — MANDATORY.** You may be a small model. Follow these
> conventions EXACTLY. Copy the tag shapes, dictionary/citation forms, and line formats from
> the examples below **literally** — do not invent tags, do not add explanations
> or extra prose, do not change the format. Produce ONLY the output this step asks
> for, in the exact shape shown. When unsure, prefer the example over your own idea.

# Japanese (jpn) language conventions

## Codes

- `lang`: `jpn`
- `script`: `japn`

## Transcription

Required (non-Latin script), inline on EVERY vocabulary and models entry AND for the full text.
System: **Hepburn** (attr `Hepburn`), applied as a HYBRID — the letter values below are the
scientific base; the reading rules make it read the way a native reads.

### Letter correspondences

Gojūon — hiragana / katakana → rōmaji (irregular forms in **bold**):

| | a | i | u | e | o |
|---|---|---|---|---|---|
| — | あ/ア a | い/イ i | う/ウ u | え/エ e | お/オ o |
| k | か/カ ka | き/キ ki | く/ク ku | け/ケ ke | こ/コ ko |
| s | さ/サ sa | し/シ **shi** | す/ス su | せ/セ se | そ/ソ so |
| t | た/タ ta | ち/チ **chi** | つ/ツ **tsu** | て/テ te | と/ト to |
| n | な/ナ na | に/ニ ni | ぬ/ヌ nu | ね/ネ ne | の/ノ no |
| h | は/ハ ha | ひ/ヒ hi | ふ/フ **fu** | へ/ヘ he | ほ/ホ ho |
| m | ま/マ ma | み/ミ mi | む/ム mu | め/メ me | も/モ mo |
| y | や/ヤ ya | — | ゆ/ユ yu | — | よ/ヨ yo |
| r | ら/ラ ra | り/リ ri | る/ル ru | れ/レ re | ろ/ロ ro |
| w | わ/ワ wa | — | — | — | を/ヲ **o** *(particle only)* |
| — | ん/ン **n** (see rules) | | | | |

Dakuten — voiced (add ゛):

| | a | i | u | e | o |
|---|---|---|---|---|---|
| g | が/ガ ga | ぎ/ギ gi | ぐ/グ gu | げ/ゲ ge | ご/ゴ go |
| z | ざ/ザ za | じ/ジ **ji** | ず/ズ zu | ぜ/ゼ ze | ぞ/ゾ zo |
| d | だ/ダ da | ぢ/ヂ **ji** | づ/ヅ **zu** | で/デ de | ど/ド do |
| b | ば/バ ba | び/ビ bi | ぶ/ブ bu | べ/ベ be | ぼ/ボ bo |

Handakuten — semi-voiced (add ゜):

| | a | i | u | e | o |
|---|---|---|---|---|---|
| p | ぱ/パ pa | ぴ/ピ pi | ぷ/プ pu | ぺ/ペ pe | ぽ/ポ po |

Yōon — palatalized combinations (small ゃ/ゅ/ょ):

| Base | ya | yu | yo |
|---|---|---|---|
| ki きゃ/キャ | kya | kyu | kyo |
| shi しゃ/シャ | sha | shu | sho |
| chi ちゃ/チャ | cha | chu | cho |
| ni にゃ/ニャ | nya | nyu | nyo |
| hi ひゃ/ヒャ | hya | hyu | hyo |
| mi みゃ/ミャ | mya | myu | myo |
| ri りゃ/リャ | rya | ryu | ryo |
| gi ぎゃ/ギャ | gya | gyu | gyo |
| ji じゃ/ジャ | ja | ju | jo |
| bi びゃ/ビャ | bya | byu | byo |
| pi ぴゃ/ピャ | pya | pyu | pyo |

### Reading rules (natural)

1. **Sokuon っ/ッ → doubled consonant.** Double the first letter of the following syllable:
   きって → *kitte*, ざっし → *zasshi*. Exception: before *chi*, use *tch*: まっちゃ → *matcha*.
2. **ん/ン → `n`; `m` before b, p, m:** しんぶん → *shimbun*, さんぽ → *sampo*,
   あんまり → *ammari*. Before a vowel or y, separate with apostrophe: しんよう → *shin'yō*.
3. **Long vowels — MACRONS ONLY.** Write the macron; never write doubled vowels (aa/uu/oo):
   - おう / おお → ō: とうきょう → *Tōkyō*, おおきい → *ōkii*
   - うう → ū: くうき → *kūki*
   - ああ → ā: おかあさん → *okāsan*
   - えい / ええ → ē: せんせい → *sensē*
   - いい → ī within a single morpheme (e.g. the adjective いい "good" → *ī*); keep two vowels *ii*
     ONLY across a morpheme boundary (じいさん → *jiisan*, おにいさん → *oniisan*)
4. **Particles は, へ, を** take their particle pronunciation: は → *wa*, へ → *e*, を → *o*.
5. **ぢ/ヂ → ji; づ/ヅ → zu** (homophonous with じ/ジ, ず/ズ in modern Japanese).

### Typography

- Latin punctuation `, . ! ? : ; ' " ( )` — never Japanese 。、！？…「」.
- Capitalize the first word of each sentence and all proper nouns; everything else lower-case.
- Keep macrons ā ī ū ē ō. Standard word spacing.

### Example

`切符を買って東京に行く。` → `Kippu o katte Tōkyō ni iku.`
(sokuon doubles p in *kippu*, doubles t in *katte*; particle を → *o*; long vowel ō in *Tōkyō*; proper noun and sentence-initial capitalized.)

## Vocabulary format

Field rules follow the injected **phraseforge-entry-format** skill. Japanese-specific rules:

- **No grammatical gender, no articles, minimal inflection** (for nouns). All nouns take `{N}`.
- **Verbs:** dictionary form (plain non-past). Tag `{V}`. Mark verb group: `{V 1}` (Group 1 / godan, end in u-row consonant), `{V 2}` (Group 2 / ichidan, end in -iru/-eru), `{V irreg}` (する, くる).
- **Adjectives:** two classes — i-adjectives (`{Adj i}`) and na-adjectives (`{Adj na}`).
- **JLPT level** can be noted in `notes` field (e.g. `N5`, `N4`, …).

```
犬 {N} [inu] = pies
家 {N} [ie] = dom
女性 {N} [josei] = kobieta
子供 {N} [kodomo] = dziecko

話す {V 1} [hanasu] = mówić
見る {V 2} [miru] = widzieć
だ {V irreg} [da] = być (kopula, styl nieformalny)
ある {V 1} [aru] = być; istnieć (rzeczy nieożywione)
いる {V 2} [iru] = być; istnieć (rzeczy ożywione)

小さい {Adj i} [chiisai] = mały
速い {Adj i} [hayai] = szybki
きれいな {Adj na} [kirei na] = ładny; czysty
```

## Grammar notes (B1+)

- Japanese word order is **SOV**. Postpositions (particles) mark grammatical roles.
- Verb conjugation distinguishes politeness level (plain vs. masu-form). Default to masu-form in lesson examples unless the source is colloquial.
- Honorific speech (keigo): sonkeigo, kenjōgo, teineigo — note level in advanced lessons.

## Translation

Translate to Polish (`pol`). Japanese `あなた` (`anata`) → general "you"; polite register defaults to `Pan`/`Pani` in Polish.

## Notes

- Japanese uses three writing systems simultaneously: **hiragana** (syllabary, native grammar), **katakana** (loanwords, emphasis), **kanji** (Chinese-derived ideographs).
- Furigana (small hiragana above kanji) can be included for A1–B1 learners; write as `漢字[かんじ]` in the source text if the MDX parser supports it, otherwise transcribe.
