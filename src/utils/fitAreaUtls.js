import * as turf from "@turf/turf";
import mapboxgl from "mapbox-gl";

export function fitAreaUtls(
  geometry,
  mapRef,
  opts = { padding: { top: 60, bottom: 60, left: 60, right: 60 } }
) {
  let coordinates;
  switch (new String(geometry.type).toLowerCase()) {
    case "polygon":
      coordinates = turf.polygon(geometry.coordinates);
      break;
    case "multipolygon":
      coordinates = turf.multiPolygon(geometry.coordinates);
      break;
    default:
      throw new Error("Invalid geometry type");
  }

  // let bbox = new mapboxgl.LngLatBounds(turf.bbox(coordinates));
  mapRef.fitBounds(turf.bbox(coordinates), opts);
}
