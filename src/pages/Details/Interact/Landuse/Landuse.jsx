import { useContext, useEffect, useRef, useState } from "react";
import { Layer, Source, useMap } from "react-map-gl";
import * as turf from "@turf/turf";

import { SiteDataContext } from "../../../SiteSelection/SiteSelection";

// Data
// import { landuseData } from "../../../../assets/data/landuse";

// Components
import InfoTable from "../../../../components/InfoTable/InfoTable";
import AnnotationTable from "../../../../components/AnnotationTable/AnnotationTable";

const CaseLanduseValues = [
  "Housing Land",
  "#F6D776",
  "Office",
  "#87A7FC",
  "Public Infrastructure Land",
  "#FFD4D4",
  "Commercial buildings",
  "#30D05D",
  "Water",
  "#51E5FF",
  "Administrative BL",
  "#A8A196",
];

const Landuse = ({ site }) => {
  const { landuseData } = useContext(SiteDataContext);

  const tableMaxWidth = 300,
    tableMaxHeight = 350;

  const mouseDivRef = useRef();
  const { map } = useMap();

  const [infoTablePosition, setInfoTablePosition] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [infoTable, setInfoTable] = useState([]);

  const [filterLand, setFilterLand] = useState(null);

  useEffect(() => {
    // Handling show info tag when hover on layer (land polygon)
    function controlInfoTable(e) {
      setShowTable(true);

      let hoveredPolygonId = e.features[0].id;

      let polygon =
        e.features[0].geometry.type === "Polygon"
          ? turf.polygon(e.features[0].geometry.coordinates)
          : turf.multiPolygon(e.features[0].geometry.coordinates);

      setInfoTable([
        { title: "Landuse", content: e.features[0].properties.Landuse },
        {
          title: "Area",
          content: <div>{turf.round(turf.area(polygon), 5)} m&sup2;</div>,
        },
      ]);

      // Calculate the info tag position following client's mouse
      const screenX = screen.width,
        screenY = screen.height;

      let clientX = e.originalEvent.clientX,
        clientY = e.originalEvent.clientY,
        positionX = "left",
        positionY = "top",
        valueX = 20,
        valueY = 20;

      if (clientY + tableMaxHeight + 50 > screenY) {
        positionY = "bottom";
        valueY = 0;
      }

      if (clientX + tableMaxWidth + 50 > screenX) {
        positionX = "right";
        valueY = 0;
      }

      if (mouseDivRef.current) {
        mouseDivRef.current.style.top = clientY + "px";
        mouseDivRef.current.style.left = clientX + "px";
      }

      setInfoTablePosition({
        px: { position: positionX, value: valueX + "px" },
        py: { position: positionY, value: valueY + "px" },
      });
    }

    // Hide tag
    function reset() {
      setShowTable(false);
      setInfoTablePosition(null);
    }

    map.on("mousemove", "landuse_selection", controlInfoTable);
    map.on("mouseleave", "landuse_selection", reset);

    return () => {
      map.off("mousemove", "landuse_selection", controlInfoTable);
      map.off("mouseleave", "landuse_selection", reset);
    };
  }, []);

  return (
    <>
      {site && (
        <Source type="geojson" data={landuseData[site]} id="landuse">
          <Layer
            id="landuse_selection"
            type="fill"
            paint={{
              "fill-outline-color": "black",
              // color the polygon based on Landuse value
              "fill-color": [
                "match",
                ["get", "Landuse"],
                ...CaseLanduseValues,
                // Other Values
                "rgba(255, 196, 54, 0.3)",
              ],
            }}
            // filter the polygon based on Landuse value
            filter={
              filterLand
                ? ["==", ["get", "Landuse"], filterLand]
                : ["!=", ["get", "Landuse"], null]
            }
          />
        </Source>
      )}

      <div className="fixed" ref={mouseDivRef}>
        {showTable && (
          <InfoTable
            infoList={infoTable}
            cx={infoTablePosition.px}
            cy={infoTablePosition.py}
            maxWidth={tableMaxWidth}
            maxHeight={tableMaxHeight}
          />
        )}
      </div>

      <div className="fixed bottom-24 right-6">
        <AnnotationTable
          items={CaseLanduseValues}
          filter={filterLand}
          setFilter={setFilterLand}
        />
      </div>
    </>
  );
};

export default Landuse;
