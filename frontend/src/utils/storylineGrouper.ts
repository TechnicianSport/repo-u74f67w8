import type { NewsPackage, Storyline } from "../types/news.types";

function makeStorylineId(
  cityEn: string,
  countryIso3: string,
  category: string
): string {
  const normalized = `${cityEn}_${countryIso3}_${category}`
    .toLowerCase()
    .replace(/\s+/g, "_");
  return normalized;
}

export function groupPackagesIntoStorylines(
  packages: NewsPackage[]
): Map<string, Storyline> {
  const storylines = new Map<string, Storyline>();

  const sorted = [...packages].sort(
    (a, b) =>
      new Date(a.published_at).getTime() - new Date(b.published_at).getTime()
  );

  for (const pkg of sorted) {
    const id = makeStorylineId(
      pkg.geo.city_en,
      pkg.geo.country_iso3,
      pkg.classification.category
    );

    const existing = storylines.get(id);

    if (existing) {
      existing.packages.push(pkg);
      existing.latest_package = pkg;
      existing.total_count = existing.packages.length;
      existing.importance_peak = Math.max(
        existing.importance_peak,
        pkg.scores.importance
      );
      const sentimentSum = existing.packages.reduce(
        (sum, p) => sum + p.scores.sentiment,
        0
      );
      existing.dominant_sentiment = sentimentSum / existing.packages.length;
      existing.has_media = existing.has_media || pkg.media.has_media;
      existing.last_updated = pkg.published_at;
      existing.is_breaking =
        existing.is_breaking || pkg.classification.is_breaking;
    } else {
      storylines.set(id, {
        id,
        city: pkg.geo.city,
        city_en: pkg.geo.city_en,
        country_en: pkg.geo.country_en,
        country_iso3: pkg.geo.country_iso3,
        category: pkg.classification.category,
        coordinates: { ...pkg.geo.coordinates },
        packages: [pkg],
        latest_package: pkg,
        total_count: 1,
        importance_peak: pkg.scores.importance,
        dominant_sentiment: pkg.scores.sentiment,
        has_media: pkg.media.has_media,
        last_updated: pkg.published_at,
        is_breaking: pkg.classification.is_breaking,
      });
    }
  }

  return storylines;
}
