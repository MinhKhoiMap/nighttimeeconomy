import * as turf from "@turf/turf";

import { buildinguseData } from "../assets/data/buildinguse";
import { activitiesData } from "../assets/data/activities";
import { landuseData } from "../assets/data/landuse";
import { siteSelectionData } from "../assets/data/site";

export default function generateActivities(site) {
  let res = [];
  console.log(activitiesData[site].features.length, activitiesData[site].name)
  activitiesData[site].features.forEach((point) => {
    if (point.properties.Time === null) {
      let arr = [1, 2, 3, 12, 13, 23, 123];
      let status = Math.floor(Math.random() * arr.length);
      point.properties.Time = arr[status];
    }
    res.push(point);
  });
  console.log(res)
}
