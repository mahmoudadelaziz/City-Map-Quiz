---
name: Unlabeled OpenStreetMap quiz maps
description: The project's durable map-data choice and attribution requirements.
---

Use locally bundled OpenStreetMap geometry for quiz maps, with geographic coordinates for markers. Keep street names hidden for street questions and show them for landmark questions.

**Why:** Street-name labels would reveal street-question answers, while landmark questions benefit from that local context. Key-gated or live tile services can make the map depend on credentials or network availability.

**How to apply:** When adding a city or map layer, bundle real OSM geometry and geographic targets, show water blue and parks/gardens green, and keep a visible OpenStreetMap attribution link.