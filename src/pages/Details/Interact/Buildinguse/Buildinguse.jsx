import { useState, useEffect, useRef, useCallback } from "react";
import { Layer, Source, useMap } from "react-map-gl";
import * as turf from "@turf/turf";

// Data
import { buildinguseData } from "../../../../assets/data/buildinguse";
import { siteSelectionData } from "../../../../assets/data/site";

// Components
import InfoTable from "../../../../components/InfoTable/InfoTable";
import AnnotationTable from "../../../../components/AnnotationTable/AnnotationTable";

const CaseBuildinguseValues = [
  "Housing",
  "#FF9844",
  "Office",
  "#87A7FC",
  "Hotel",
  "#37B5B6",
  "Mixed-use",
  "#E6B9DE",
  "Administrative Buildings",
  "#92197F",
  "School/Institute",
  "#F6ECA9",
  "Tourist/Attraction Point",
  "#D71313",
];

const Buildinguse = ({ site }) => {
  const tableMaxWidth = 200,
    tableMaxHeight = 250;

  const mouseDivRef = useRef();
  const { map } = useMap();

  const [infoTablePosition, setInfoTablePosition] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [infoTable, setInfoTable] = useState([]);
  const [buildingIntersection, setBuildingIntersection] = useState([]);

  const [filterBuilding, setFilterBuilding] = useState(null);

  useEffect(() => {
    // Like the function in landuse component
    function controlInfoTable(e) {
      setShowTable(true);

      setInfoTable([
        {
          title: "Building use",
          content: e.features[0].properties.Buildsused,
        },
      ]);

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

    function reset() {
      setShowTable(false);
      setInfoTablePosition(null);
      map.getCanvas().style.cursor = "grab";
    }

    map.on("mouseenter", "buildinguse_selection", () => {
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mousemove", "buildinguse_selection", controlInfoTable);
    map.on("mouseleave", "buildinguse_selection", reset);
    // return () => {
    //   map.off("mousemove", "buildinguse_selection", controlInfoTable);
    //   map.off("mouseleave", "buildinguse_selection", reset);
    // };
  });

  // Before drawing building, filtering all building outside the selected area boundary
  useEffect(() => {
    let intersectBuildingGeos = buildinguseData[site].features.filter(
      (buildingGeo) => {
        return turf.booleanIntersects(
          turf.polygon(buildingGeo.geometry.coordinates),
          turf.polygon(siteSelectionData.features[site].geometry.coordinates)
        );
      }
    );

    setBuildingIntersection({
      type: "FeatureCollection",
      name: "",
      features: intersectBuildingGeos,
    });
  }, [site]);

  return (
    <>
      {buildingIntersection && (
        <Source type="geojson" data={buildingIntersection}>
          {/* Paint and Filter logic are the same in landuse */}
          <Layer
            id="buildinguse_selection"
            type="fill"
            paint={{
              "fill-outline-color": "pink",
              "fill-color": [
                "match",
                ["get", "Buildsused"],
                ...CaseBuildinguseValues,
                // Other Values
                "rgba(255, 196, 54, 0.3)",
              ],
            }}
            filter={
              filterBuilding
                ? ["==", ["get", "Buildsused"], filterBuilding]
                : ["!=", ["get", "Buildsused"], null]
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
          items={CaseBuildinguseValues}
          filter={filterBuilding}
          setFilter={setFilterBuilding}
        />
      </div>
    </>
  );
};

export default Buildinguse;
