export function computeScore(site) {
  return (
    site.pedestrianRating * 2 +
    site.obstructionRating +
    site.trafficRating +
    site.positionRatingCorner +
    site.ratingLHRH +
    site.positionRatingDU * 2 +
    site.acRating +
    site.aadtRating * 2 +
    (site.pedestrianRatingNew || 0)
  );
}
