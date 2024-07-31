import { ref } from "firebase/storage";
import { getDownloadUrl, getRef, listChilds, storage } from "./firebaseStorage";

const folderStorageRef = getRef("/nha_trang/geojson");

async function getGeoJSONData(fileName) {
  try {
    const geojson = ref(folderStorageRef, `${fileName}.json`);
    const url = await getDownloadUrl(geojson);
    const res = await fetch(url);
    const data = res.json();
    return new Promise((resolve, _) => resolve(data));
  } catch (err) {
    console.log(err, `Error fetching ${fileName} data`);
  }
}

export default getGeoJSONData;
