---
name: phraseforge-lang-vie
description: Vietnamese (Tieng Viet, ISO 639-3 vie) language conventions for PhraseForge lessons. Codes, vocabulary shape (tonal, no gender, no articles, isolating), tone marks, and notes. Load whenever a PhraseForge lesson targets Vietnamese.
---

> **HOW TO USE THIS SKILL — MANDATORY.** You may be a small model. Follow these
> conventions EXACTLY. Copy the tag shapes, dictionary/citation forms, and line formats from
> the examples below **literally** — do not invent tags, do not add explanations
> or extra prose, do not change the format. Produce ONLY the output this step asks
> for, in the exact shape shown. When unsure, prefer the example over your own idea.

# Vietnamese (vie) language conventions

## Codes

- `lang`: `vie`
- `script`: `latn`

## Transcription

Not needed. Vietnamese uses the **Chu Quoc Ngu** Latin-based alphabet with diacritics that indicate both vowel quality and tone. All diacritics are part of the orthography and must be preserved.

Preserve: `à á ả ã ạ ă ắ ằ ẳ ẵ ặ â ấ ầ ẩ ẫ ậ è é ẻ ẽ ẹ ê ế ề ể ễ ệ ì í ỉ ĩ ị ò ó ỏ õ ọ ô ố ồ ổ ỗ ộ ơ ớ ờ ở ỡ ợ ù ú ủ ũ ụ ư ứ ừ ử ữ ự ỳ ý ỷ ỹ ỵ đ`.

**Six tones** (for reference):
1. Level (ngang): no mark — `a`
2. Falling (huyền): grave — `à`
3. Rising-broken (sắc): acute — `á`
4. Broken (hỏi): hook — `ả`
5. Rising-creaky (ngã): tilde — `ã`
6. Heavy (nặng): dot below — `ạ`

## Vocabulary format

Field rules follow the injected **phraseforge-entry-format** skill. Vietnamese-specific rules:

- **No grammatical gender, no articles, no case inflection.** All nouns take `{N}`.
- **Classifiers (loại từ):** similar to Chinese/Japanese measure words. Note the primary classifier when relevant: `{N cl con}` (animals), `{N cl cái}` (objects), `{N cl người}` (persons), etc.
- **Verbs:** uninflected form, tag `{V}`. Tense and aspect are expressed by adverbs/particles (`đã` past, `đang` present progressive, `sẽ` future).
- **Adjectives:** uninflected form, tag `{Adj}`.

```
chó {N cl con} = pies
nhà {N cl cái} = dom
người phụ nữ {N cl người} = kobieta
đứa trẻ {N cl đứa} = dziecko

nói chuyện {V} = mówić; rozmawiać
nhìn thấy {V} = widzieć
là {V} = być (kopula)
có {V} = mieć; być (posiadanie i istnienie)

nhỏ {Adj} = mały
nhanh {Adv} = szybko
```

## Grammar notes (B1+)

- Vietnamese is **strictly SVO** and isolating — all grammatical meaning is expressed by separate words.
- Classifiers are mandatory between a numeral/demonstrative and a noun.
- Personal pronouns encode the social relationship (age, status): `tôi` (I, neutral), `anh` (I/you, male elder), `chị` (I/you, female elder), `em` (I/you, younger), `ông` (sir, elderly male), etc.

## Translation

Translate to Polish (`pol`). Pronoun choice depends on relationship — translate using `ty` for peers/informal and `Pan`/`Pani` for respectful address.
