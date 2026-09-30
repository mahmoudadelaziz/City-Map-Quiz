---
name: Unlabeled OpenStreetMap quiz maps
description: The project's durable map-data choice and attribution requirements.
---

Use locally bundled OpenStreetMap road geometry for quiz maps, with geographic coordinates for markers and no road-name tags in the answer view.

**Why:** Labeled maps reveal quiz answers, while key-gated or live tile services can make the map depend on credentials or network availability.

**How to apply:** When adding another city, include its real road data and map bounds, geocode each target to its actual location, keep names out of the quiz map layer, and show a visible OpenStreetMap attribution link.