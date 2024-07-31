import * as turf from "@turf/turf";

export default function generateActivities(site) {
  let res = [],
    activitiesData;
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
