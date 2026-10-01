---
name: Unlabeled OpenStreetMap quiz maps
description: The project's durable map-data choice and attribution requirements.
---

Use locally bundled OpenStreetMap geometry for quiz maps, with geographic coordinates for markers. Show nearby street names and curated landmark names for both question types, but omit all answer-choice names from every map-label layer and suppress the marked target by location.

**Why:** Nearby names provide useful map-reading context, but labeling any offered choice can reveal the answer before grading. The correct-answer key remains server-held, and key-gated or live tile services can make map rendering depend on credentials or network availability.

**How to apply:** When adding a city or map layer, bundle real OSM geometry and a curated set of notable landmarks; filter all public answer-choice labels and the target feature without consulting the answer key. Show water blue and parks/gardens green, and keep a visible OpenStreetMap attribution link.