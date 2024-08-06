import { useContext, useEffect, useRef, useState } from "react";
import { Layer, Source, useMap } from "react-map-gl";
import $ from "jquery";

// Assets
import "./Activities.css";

import { SiteDataContext } from "../../../SiteSelection/SiteSelection";

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
  const { activitiesData } = useContext(SiteDataContext);

  const tableMaxWidth = 200,
    tableMaxHeight = 250;

  const mouseDivRef = useRef();
  const { map } = useMap();

  const [pointData, setPointData] = useState(null);
  const [filterActivities, setFilterActivities] = useState(null);
  const [filterTime, setFilterTime] = useState(null);
  const [infoTablePosition, setInfoTablePosition] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [infoTable, setInfoTable] = useState(null);

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

  // Highlighting the row in time table which is selected by clicking
  const handleFilterTime = (e, time) => {
    if ($(e.target).hasClass("active")) {
      $(e.target).toggleClass("active");
      setFilterTime(null);
      return;
    }
    $("td.active").removeClass("active");
    $(e.target).addClass("active");
    setFilterTime(time);
  };

  function handleOnFilterData() {
    let f = activitiesData[site].features.filter(({ properties }) => {
      return (
        (filterActivities
          ? properties.item_1 == filterActivities
          : properties.item_1 != null) &&
        (filterTime
          ? String(properties.Time).indexOf(filterTime.time) >= 0
          : properties.Time != null) &&
        (filterTime
          ? properties.Informal == filterTime.informal
          : properties.Informal != null)
      );
    });
    setPointData({ ...activitiesData[site], features: f });
  }

  useEffect(() => {
    handleOnFilterData();
  }, [filterTime, filterActivities]);

  useEffect(() => {
    handleOnFilterData();
  }, [site]);

  useEffect(() => {
    map.on("click", "cluster-point", (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ["cluster-point"],
      });
      const clusterId = features[0].properties.cluster_id;

      map
        .getSource("activities-point")
        .getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) throw new Error(err);

          map.easeTo({
            center: features[0].geometry.coordinates,
            zoom,
          });
        });
    });
  });

  return (
    <>
      <Source
        id="activities-point"
        type="geojson"
        data={pointData}
        cluster={true}
        clusterMaxZoom={15}
        clusterRadius={50}
      >
        <Layer
          id="cluster-point"
          type="circle"
          paint={{
            "circle-color": [
              "step",
              ["get", "point_count"],
              "#51bbd6",
              80,
              "#f1f075",
              110,
              "#f28cb1",
            ],
            "circle-opacity": 0.7,
            "circle-radius": [
              "step",
              ["get", "point_count"],
              20,
              80,
              28,
              110,
              35,
            ],
            "circle-stroke-color": [
              "step",
              ["get", "point_count"],
              "#51bbd6",
              80,
              "#f1f075",
              110,
              "#f28cb1",
            ],
            "circle-stroke-width": 1,
          }}
          filter={["has", "point_count"]}
        />
        {/* Label cluster count */}
        <Layer
          type="symbol"
          layout={{
            "text-field": ["get", "point_count_abbreviated"],
            "text-size": 16,
            "text-anchor": "center",
            "text-allow-overlap": false,
          }}
          paint={{
            "text-color": "#000",
          }}
          filter={["has", "point_count"]}
        />
        {/* Activities Point */}
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
            "circle-opacity": 0.8,
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
          filter={["all", ["!", ["has", "point_count"]]]}
        />

        {/* Labels Time for Uncluster Point */}
        {/* <Layer
          type="symbol"
          layout={{
            "text-field": [
              "match",
              ["get", "Informal"],
              "1",
              ["concat", "i", ["get", "Time"]],
              ["get", "Time"],
            ],
            "text-size": 16,
            "text-anchor": "bottom-right",
            "text-allow-overlap": false,
          }}
          paint={{
            "text-color": "#fff",
          }}
          filter={[
            "all",
            ["!", ["has", "point_count"]],
            filterActivities
              ? ["==", ["get", "item_1"], filterActivities]
              : ["!=", ["get", "item_1"], null],
            filterTime
              ? [
                  ">=",
                  ["index-of", filterTime.time, ["to-string", ["get", "Time"]]],
                  0,
                ]
              : ["!=", ["get", "Time"], null],
            filterTime
              ? ["==", ["get", "Informal"], filterTime.informal]
              : ["!=", ["get", "Informal"], null],
          ]}
        /> */}
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
              <tr>
                <td>6 A.M - 6 P.M</td>
                <td
                  className="time_filter"
                  onClick={(e) =>
                    handleFilterTime(e, { time: "1", informal: "0" })
                  }
                >
                  1
                </td>
                <td
                  className="time_filter"
                  onClick={(e) =>
                    handleFilterTime(e, { time: "1", informal: "1" })
                  }
                >
                  i1
                </td>
              </tr>
              <tr>
                <td>6 P.M - 10 P.M</td>
                <td
                  className="time_filter"
                  onClick={(e) =>
                    handleFilterTime(e, { time: "2", informal: "0" })
                  }
                >
                  2
                </td>
                <td
                  className="time_filter"
                  onClick={(e) =>
                    handleFilterTime(e, { time: "2", informal: "1" })
                  }
                >
                  i2
                </td>
              </tr>
              <tr>
                <td>10 P.M - 6 A.M</td>
                <td
                  className="time_filter"
                  onClick={(e) =>
                    handleFilterTime(e, { time: "3", informal: "0" })
                  }
                >
                  3
                </td>
                <td
                  className="time_filter"
                  onClick={(e) =>
                    handleFilterTime(e, { time: "3", informal: "1" })
                  }
                >
                  i3
                </td>
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
