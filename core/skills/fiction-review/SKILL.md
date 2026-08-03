---
name: fiction-review
description: Adversarially review a fiction chapter — hunt predictability, thin characters, magic solutions, weak stakes, pacing sags, factual errors, and drift from the cast/plot — and return ranked, concrete improvements.
---

# Fiction Review (adversarial)

Read the chapter as a demanding editor trying to break it. Your job is to find
what makes it weaker than it should be and say exactly how to fix it. Be specific
and honest; praise is not the deliverable.

## What to attack

1. **Predictability** — Could a reader guess the turn? Is the twist telegraphed,
   clichéd, or the obvious choice? Flag anything foreseeable.
2. **Character depth & motivation** — Is anyone a cardboard cutout? Does the
   antagonist have a motivation the reader can relate to and understand? Do
   choices follow from established traits (`ACTORS.md`)?
3. **Magic solutions** — Did anyone escape via luck, coincidence, a
   just-in-time power, or a convenience the story didn't earn? The way out must
   come from hard work, self-improvement, or trading money/favors, at real cost.
   Flag every unearned resolution.
4. **Stakes & difficulty** — Is the obstacle a genuine threat? Are the costs real
   and paid?
5. **Pacing & scene function** — Does every scene have a goal, conflict, and
   shift? Where does it sag or rush?
6. **Factual grounding** — Are real-world details (places, crafts, history,
   industry, science, agriculture/husbandry, real events/people) accurate and
   fact-checked? Flag anything unverifiable or wrong; suggest checking or cutting.
7. **Consistency** — Does anything contradict `ACTORS.md` / `PLOT.md` (traits,
   timeline, geography, established facts)?
8. **Prose & voice** — telling instead of showing, flat dialogue, filter words,
   muddy blocking, repetition.

## Output

A ranked list, most damaging first. For each finding:

```md
- **[High|Medium|Low] <one-line problem>**
  - Where: <scene / paragraph / quote>
  - Why it weakens the chapter: <reason>
  - Fix: <concrete, actionable change>
```

End with the single most important change to make. If the chapter is genuinely
strong on a dimension, say so briefly — but lead with the problems.
