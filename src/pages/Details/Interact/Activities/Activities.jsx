import { useCallback, useEffect, useRef, useState } from "react";
import { Layer, Marker, Source, useMap } from "react-map-gl";
import $ from "jquery";

// Assets
import "./Activities.css";

// Data
import { activitiesData } from "../../../../assets/data/activities";
import AnnotationTable from "../../../../components/AnnotationTable/AnnotationTable";
import InfoTable from "../../../../components/InfoTable/InfoTable";

const CaseActivitiesValues = [
  "Entertainment",
  "#FB7A78",
  "F&B",
  "#FFDE03",
  "Market",
  "#8200D2",
  "misc.",
  "#560764",
  "Art & Craft",
  "#FF935C",
  "Mixed-use",
  "#E6B9DE",
  "Clothes & Fashion",
  "#95EFFF",
  "Wellness",
  "#3081D0",
];

const Activities = ({ site }) => {
  const tableMaxWidth = 200,
    tableMaxHeight = 250;

  const mouseDivRef = useRef();
  const { map } = useMap();

  const [filterActivities, setFilterActivities] = useState(null);
  const [infoTablePosition, setInfoTablePosition] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [infoTable, setInfoTable] = useState(null);

  useEffect(() => {
    map.on("click", "activities_point", (e) => {
      console.log(e.features[0]);
    });
  }, []);

  useEffect(() => {
    function controlInfoTable(e) {
      setShowTable(true);

      setInfoTable([
        {
          title: "Activity",
          content: e.features[0].properties.item_1,
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

    map.on("mouseenter", "activities_point", () => {
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mousemove", "activities_point", controlInfoTable);
    map.on("mouseleave", "activities_point", reset);
    // return () => {
    //   map.off("mousemove", "activities_point", controlInfoTable);
    //   map.off("mouseleave", "activities_point", reset);
    // };
  });

  const handleFilterTime = useCallback((e) => {
    if ($(e.target).parent("tr").hasClass("active")) {
      $(e.target).parent("tr").toggleClass("active");
      return;
    }
    $("tr.active").removeClass("active");
    $(e.target).parent("tr").addClass("active");
  }, []);

  return (
    <>
      <Source type="geojson" data={activitiesData[site]}>
        <Layer
          id="activities_point"
          type="circle"
          paint={{
            "circle-stroke-color": [
              "match",
              ["get", "item_1"],
              ...CaseActivitiesValues,
              // Other Values
              "rgba(255, 196, 54, 0.3)",
            ],
            "circle-stroke-width": 1,
            "circle-radius": 6.5,
            "circle-opacity": 0.7,
            "circle-color": [
              "match",
              ["get", "item_1"],
              ...CaseActivitiesValues,
              // Other Values
              "rgba(255, 196, 54, 0.3)",
            ],
            "circle-pitch-scale": "map",
            "circle-radius-transition": { duration: 0.2 },
          }}
          filter={
            filterActivities
              ? ["==", ["get", "item_1"], filterActivities]
              : ["!=", ["get", "item_1"], null]
          }
        />
      </Source>

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
        <div className="rounded-lg mb-4">
          <table className="time-table rounded-lg w-full bg-white/15 border-separate border-spacing-0">
            <thead>
              <tr>
                <th>Time</th>
                <th>Formal</th>
                <th>Informal</th>
              </tr>
            </thead>
            <tbody>
              <tr onClick={handleFilterTime}>
                <td>6 A.M - 6 P.M</td>
                <td>1</td>
                <td>i1</td>
              </tr>
              <tr onClick={handleFilterTime}>
                <td>10 P.M - 6 A.M</td>
                <td>2</td>
                <td>i2</td>
              </tr>
              <tr onClick={handleFilterTime}>
                <td>6 P.M - 10 P.M</td>
                <td>3</td>
                <td>i3</td>
              </tr>
            </tbody>
          </table>
        </div>
        <AnnotationTable
          items={CaseActivitiesValues}
          filter={filterActivities}
          setFilter={setFilterActivities}
        />
      </div>
    </>
  );
};

export default Activities;
