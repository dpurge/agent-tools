---
name: phraseforge-lang-hin
description: Hindi (Hindi, ISO 639-3 hin) language conventions for PhraseForge lessons. Codes, Devanagari script, IAST transcription, vocabulary shape (gender, postpositions, verb forms), and notes. Load whenever a PhraseForge lesson targets Hindi.
---

> **HOW TO USE THIS SKILL — MANDATORY.** You may be a small model. Follow these
> conventions EXACTLY. Copy the tag shapes, dictionary/citation forms, and line formats from
> the examples below **literally** — do not invent tags, do not add explanations
> or extra prose, do not change the format. Produce ONLY the output this step asks
> for, in the exact shape shown. When unsure, prefer the example over your own idea.

# Hindi (hin) language conventions

## Codes

- `lang`: `hin`
- `script`: `deva`

## Transcription

Required (non-Latin script), inline on EVERY vocabulary and models entry AND for the full text.
System: **IAST** (International Alphabet of Sanskrit Transliteration) (attr `IAST`), applied as a HYBRID —
the letter values below are the scientific base; the reading rules make it read the way a Hindi speaker
reads aloud.

### Letter correspondences

Consonants (velar → palatal → retroflex → dental → labial → semivowels → sibilants → aspirate):
| Deva | IAST | | Deva | IAST | | Deva | IAST |
|------|------|-|------|------|-|------|------|
| क | k  | | ख | kh | | ग | g  |
| घ | gh | | ङ | ṅ  | | च | c  |
| छ | ch | | ज | j  | | झ | jh |
| ञ | ñ  | | ट | ṭ  | | ठ | ṭh |
| ड | ḍ  | | ढ | ḍh | | ण | ṇ  |
| त | t  | | थ | th | | द | d  |
| ध | dh | | न | n  | | प | p  |
| फ | ph | | ब | b  | | भ | bh |
| म | m  | | य | y  | | र | r  |
| ल | l  | | व | v  | | श | ś  |
| ष | ṣ  | | स | s  | | ह | h  |

Nukta forms (borrowed sounds — ISO 15919 extension, not in strict IAST):
| Deva | IAST | Note |
|------|------|------|
| क़ | q   | uvular stop /q/ — Urdu/Arabic loans |
| ख़ | x   | velar fricative /x/ — Persian loans (ISO 15919 writes ḵh; x is the practical convention) |
| ग़ | ġ   | voiced velar fricative /ɣ/ — Urdu/Arabic loans |
| ज़ | z   | /z/ — Persian/Arabic loans |
| ड़ | ṛ   | retroflex flap /ɽ/ — native Hindi words (ISO 15919 value; see ṛ-collision note below) |
| ढ़ | ṛh  | aspirated retroflex flap /ɽʰ/ |
| फ़ | f   | /f/ — Persian/English loans |

Independent vowels:
| Deva | IAST | | Deva | IAST | | Deva | IAST |
|------|------|-|------|------|-|------|------|
| अ | a  | | आ | ā  | | इ | i  |
| ई | ī  | | उ | u  | | ऊ | ū  |
| ऋ | ṛ  | | ए | e  | | ऐ | ai |
| ओ | o  | | औ | au | |   |    |

*ṛ-collision note:* In strict IAST, ṛ represents ऋ (vocalic r). ISO 15919 also assigns ṛ to ड़ (retroflex
flap). Context always disambiguates: ऋ/ृ appears only in vowel position; ड़ only in consonant position.

Dependent vowel signs (mātrā) and special marks:
| Sign | IAST | Name | Example |
|------|------|------|---------|
| (inherent) | a | inherent vowel | क = ka |
| ा | ā | ā mātrā | का = kā |
| ि | i | i mātrā | कि = ki |
| ी | ī | ī mātrā | की = kī |
| ु | u | u mātrā | कु = ku |
| ू | ū | ū mātrā | कू = kū |
| ृ | ṛ | ṛ mātrā | कृ = kṛ |
| े | e | e mātrā | के = ke |
| ै | ai | ai mātrā | कै = kai |
| ो | o | o mātrā | को = ko |
| ौ | au | au mātrā | कौ = kau |
| ् | — | virāma / halant (no vowel) | क् = k |
| ं | ṃ | anusvāra | assimilates — see rules |
| ँ | m̐ | candrabindu | nasalized vowel |
| ः | ḥ | visarga | voiceless breath release |

### Reading rules (natural)

1. **Inherent vowel `a`:** Every consonant carries an inherent `a` unless followed by a virāma ् or a
   mātrā sign. Always write this `a` in the transcription.

2. **Schwa deletion:** Delete the inherent `a`:
   - **(a) Word-finally before a pause:** राम → rām, भारत → bhārat, देश → deś.
   - **(b) Where the next onset naturally absorbs the syllable without the schwa:** विद्यालय → vidyālay
     (the final syllable ya loses its a → y; but preceding la retains its a because removing it would
     yield unpronounceable word-final -ly).
   - **NEVER** delete where deletion creates an unpronounceable cluster: कमल → kamal (medial and final
     a both retained — removing either yields unpronounceable km- or ml-).
   - **Retain** when the final letter carries an explicit mātrā (not inherent a): नमस्ते → namaste
     (final ते = te, an e mātrā — not inherent a, no deletion).

3. **Anusvāra assimilation:** Before a stop, anusvāra → homorganic class nasal:
   - Before velars (k kh g gh): ṃ → ṅ — संग → saṅg
   - Before palatals (c ch j jh): ṃ → ñ — पंचायत → pañcāyat
   - Before retroflexes (ṭ ṭh ḍ ḍh): ṃ → ṇ — घंटा → ghaṇṭā
   - Before dentals (t th d dh n): ṃ → n — संत → sant, हिंदी → hindī
   - Before labials (p ph b bh m): ṃ → m — संभव → sambhav
   - Before a sibilant or word-finally: keep ṃ — संस्कृत → saṃskṛt.

4. **Candrabindu (ँ):** Marks nasalization of the preceding vowel; write m̐ after the vowel: माँ → mām̐.

5. **Gemination:** Conjuncts of identical consonants → doubled in transcription: पक्का → pakkā,
   बच्चा → baccā.

6. **Conjunct consonants:** Write all constituent consonants in sequence with no intervening vowel:
   क्ष → kṣ, त्र → tr, ज्ञ → jñ, प्र → pr.

### Typography

- Latin punctuation `. , ! ? : ; ' " ( )` — never Devanagari danda `।` or double danda `॥`.
- Capitalize the first word of each sentence and all proper nouns; everything else lower-case.
- Keep all IAST diacritics: ā ī ū ṛ ṅ ñ ṭ ḍ ṇ ś ṣ ḥ ṃ m̐. Standard word spacing.

### Example

`भारत एक बड़ा देश है।` → `Bhārat ek baṛā deś hai.`

(Schwa deletion: bhārat not bhārata, ek not eka, deś not deśa; nukta ड़ → ṛ in baṛā; ā mātrā;
ai diphthong in hai; ś sibilant; sentence-initial capital; Latin period.)

## Vocabulary format

Field rules follow the injected **phraseforge-entry-format** skill. Hindi-specific rules:

- **Nouns:** mark gender: `{N m}` / `{N f}`. No definite/indefinite articles. Plural and case are formed by suffixes and postpositions.
- **Verbs:** infinitive form (ending `-nā`). Tag `{V}`. Add `irreg` for irregular.
- **Adjectives:** masculine direct case (uninflected `-ā` form), tag `{Adj}`. Note: adjectives ending in `-ā` inflect; those ending in a consonant do not.

```
कुत्ता {N m} [kuttā] = pies
घर {N m} [ghar] = dom
औरत {N f} [aurat] = kobieta
बच्चा {N m} [baccā] = dziecko

बोलना {V} [bolnā] = mówić
देखना {V} [dekhnā] = widzieć
होना {V irreg} [honā] = być
रखना {V} [rakhnā] = mieć; trzymać

छोटा {Adj} [choṭā] = mały
जल्दी {Adv} [jaldī] = szybko
```

## Grammar notes (B1+)

- Hindi word order is **SOV**. Postpositions follow nouns (unlike European prepositions).
- Verb agreement is primarily with the object (in perfective aspect) or subject; depends on tense/aspect.
- Oblique case: nouns change form before postpositions.

## Translation

Translate to Polish (`pol`). Hindi `तुम` (`tum`) → informal; `आप` (`āp`) → formal (`Pan`/`Pani`).

## Notes

- Hindi and Urdu are mutually intelligible at the colloquial level but diverge in formal/literary vocabulary (Hindi draws on Sanskrit, Urdu on Persian/Arabic).
- Devanagari is written left-to-right.
