import * as turf from "@turf/turf";

import { buildinguseData } from "../assets/data/buildinguse";
import { activitiesData } from "../assets/data/activities";
import { landuseData } from "../assets/data/landuse";
import { siteSelectionData } from "../assets/data/site";

export default function generateActivities(site) {
  let res = [];
  console.log(activitiesData[site].features.length, activitiesData[site].name);
  activitiesData[site].features.forEach((point) => {
    if (point.properties.Time === null) {
      let status = null;
      let arr = [];
      if (point.properties.Informal === "0") {
        arr = [1, 2, 12];
        status = Math.floor(Math.random() * arr.length);
      } else {
        arr = [1, 2, 3, 12, 13, 23, 123];
        status = Math.floor(Math.random() * arr.length);
      }
      point.properties.Time = arr[status];
    }
    res.push(point);
  });
  console.log(res);
}
