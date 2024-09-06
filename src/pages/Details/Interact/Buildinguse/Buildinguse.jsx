import { useState, useEffect, useRef, useCallback, useContext } from "react";
import { Layer, Source, useMap } from "react-map-gl";
import * as turf from "@turf/turf";

import { SiteDataContext } from "../../../SiteSelection/SiteSelection";

// Data
// import { buildinguseData } from "../../../../assets/data/buildinguse";
// import { siteSelectionData } from "../../../../assets/data/site";

// Components
import InfoTable from "../../../../components/InfoTable/InfoTable";
import AnnotationTable from "../../../../components/AnnotationTable/AnnotationTable";
import { SourceID } from "../../../../constants";

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
  const { buildinguseData, siteSelectionData } = useContext(SiteDataContext);

  const tableMaxWidth = 200,
    tableMaxHeight = 250;

  const mouseDivRef = useRef();
  const { map } = useMap();

  const [infoTablePosition, setInfoTablePosition] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [infoTable, setInfoTable] = useState([]);
  const [buildingIntersection, setBuildingIntersection] = useState(null);
  const [showGrid, setShowGrid] = useState(false);

  const [filterBuilding, setFilterBuilding] = useState(null);
  const [chosedBuilding, setChosedBuilding] = useState(null);

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

    function changePointer() {
      map.getCanvas().style.cursor = "pointer";
    }

    map.on("mouseenter", "buildinguse_selection", changePointer);
    map.on("mousemove", "buildinguse_selection", controlInfoTable);
    map.on("mouseleave", "buildinguse_selection", reset);

    return () => {
      map.off("mousemove", "buildinguse_selection", controlInfoTable);
      map.off("mouseleave", "buildinguse_selection", reset);
      map.off("mouseenter", "buildinguse_selection", changePointer);
    };
  }, [map]);

  // Before drawing building, filtering all building outside the selected area boundary
  useEffect(() => {
    if (site) {
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
    }
  }, [site]);

  useEffect(() => {
    function handleChooseBuilding(e) {
      if (chosedBuilding === e.features[0].id) {
        map.setFeatureState(
          { source: "buildinguse", id: chosedBuilding },
          { chosedID: null }
        );

        setChosedBuilding(null);
        setShowGrid(false);
      } else {
        setChosedBuilding(e.features[0].id);
        map.setFeatureState(
          { source: "buildinguse", id: e.features[0].id },
          { chosedID: e.features[0].id }
        );
        setShowGrid(true);
      }
    }

    map.on("click", "buildinguse_selection", handleChooseBuilding);

    return () =>
      map.off("click", "buildinguse_selection", handleChooseBuilding);
  }, [chosedBuilding]);

  return (
    <>
      {buildingIntersection && (
        <Source
          type="geojson"
          data={buildingIntersection}
          generateId={true}
          id={SourceID.buildinguse}
        >
          {
            <Layer
              id="grid"
              type="fill"
              paint={{
                "fill-outline-color": "black",
                "fill-outline-color-transition": { duration: 300 },
                "fill-color": "transparent",
              }}
              filter={
                filterBuilding
                  ? ["==", ["get", "Buildsused"], filterBuilding]
                  : ["!=", ["get", "Buildsused"], null]
              }
            />
          }
          <Layer
            beforeId={"grid"}
            id="buildinguse_selection"
            type="fill-extrusion"
            paint={{
              "fill-extrusion-color": [
                "match",
                ["get", "Buildsused"],
                ...CaseBuildinguseValues,
                // Other Values
                "rgba(255, 196, 54, 0.3)",
              ],
              "fill-extrusion-height": [
                "case",
                ["==", ["id"], chosedBuilding],
                10,
                0,
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
