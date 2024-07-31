import mapboxgl from "mapbox-gl";
import { useCallback, useEffect, useState } from "react";
import * as turf from "@turf/turf";
import DocumentViewer from "../../components/DocumentViewer/DocumentViewer";
const Test = () => {
  return (
    <div className="z-[99999] h-fit overflow-auto fixed top-0 bottom-0 left-0 right-0">
      <DocumentViewer file={"/src/assets/pdf/team 1 ppt.pdf"} />
    </div>
  );
};

export default Test;
