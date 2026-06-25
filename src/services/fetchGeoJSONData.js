import { ref } from "firebase/storage";
import { getDownloadUrl, getRef } from "./firebaseStorage";

async function getBaseGeoJSONData(fileName) {
  let path = window.location.pathname.split("/");
  const folderStorageRef = getRef(`${path[1]}/geojson`);

  try {
    const geojson = ref(folderStorageRef, `${fileName}.json`);
    const url = await getDownloadUrl(geojson);
    const res = await fetch(url);
    const data = res.json();
    return new Promise((resolve) => resolve(data));
  } catch (err) {
    console.log(err, `Error fetching ${fileName} data`);
  }
}

export default getBaseGeoJSONData;
