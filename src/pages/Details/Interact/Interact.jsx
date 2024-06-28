import { useEffect, useState } from "react";
import { useMap } from "react-map-gl";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Utils
import "./Interact.css";
import { fitAreaUtls } from "../../../utils/fitAreaUtls";
import { siteSelectionData } from "../../../assets/data/site";

import Landuse from "./Landuse/Landuse";
import Buildinguse from "./Buildinguse/Buildinguse";
import Activities from "./Activities/Activities";
import Interview from "./Interview/Interview";

const filterModeArr = ["interview", "landuse", "buildinguse", "activities"];
const data = [
  {
    label: "Foreign",
    backgroundColor: "#ce2027",
    categoryPercentage: 1,
    barPercentage: 0.8,
    data: [1, null, 2, null, 1, null, 1],
  },
  {
    label: "Resident",
    backgroundColor: "#ffc436",
    categoryPercentage: 1,
    barPercentage: 0.8,
    data: [1, 5, 2, 2, null, null, null],
  },
  {
    label: "Local",
    backgroundColor: "#c5fff8",
    categoryPercentage: 1,
    barPercentage: 0.8,
    data: [null, null, null, null, null, 2, null],
  },
];

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

ChartJS.defaults.color = "#fff";
ChartJS.defaults.font.family = "Barlow";
ChartJS.defaults.font.weight = "700";
ChartJS.defaults.scale.grid.display = false;

const Interact = ({ siteIndex }) => {
  const { map } = useMap();

  const [filterMode, setFilterMode] = useState(filterModeArr[1]);

  // Handle Fitbounds to the selected area
  const fitArea = () => {
    if (filterMode !== filterModeArr[0])
      fitAreaUtls(siteSelectionData.features[siteIndex]?.geometry, map, {
        padding: { top: 60, bottom: 60, left: 60, right: 60 },
        duration: 400,
      });
    else
      fitAreaUtls(siteSelectionData.features[siteIndex].geometry, map, {
        padding: { top: 60, bottom: 60, left: 600, right: 50 },
        duration: 400,
      });
  };

  // Handle Fit Bounds When Change Site State (siteIndex, viewMode state)
  useEffect(() => {
    fitArea();
  }, [siteIndex, filterMode]);

  return (
    <>
      <div className="sidebar">
        <div>
          <div className="details__filter w-fit">
            <div
              className={`details__filter-tool ${
                filterMode === filterModeArr[1] &&
                "details__filter-tool--active"
              }`}
              onClick={() => setFilterMode(filterModeArr[1])}
            >
              <p>Land Use</p>
            </div>
            <div
              className={`details__filter-tool ${
                filterMode === filterModeArr[2] &&
                "details__filter-tool--active"
              }`}
              onClick={() => setFilterMode(filterModeArr[2])}
            >
              <p>Building Use</p>
            </div>
            <div
              className={`details__filter-tool ${
                filterMode === filterModeArr[3] &&
                "details__filter-tool--active"
              }`}
              onClick={() => setFilterMode(filterModeArr[3])}
            >
              <p>Activities Point</p>
            </div>
            <div
              className={`details__filter-tool ${
                filterMode === filterModeArr[0] &&
                "details__filter-tool--active"
              }`}
              onClick={() => setFilterMode(filterModeArr[0])}
            >
              <p>Interview Point</p>
            </div>
          </div>
        </div>
        {filterMode === filterModeArr[0] && (
          <div className="w-[500px] mt-6">
            <Bar
              options={{
                color: "#FFFFFF",
                responsive: true,
                skipNull: true,
                plugins: {
                  legend: {
                    labels: {
                      font: {
                        size: 12,
                        family: "Barlow",
                      },
                      padding: 20,
                    },
                  },
                  title: {
                    display: true,
                    color: "#FFFFFF",
                    text: "Demand of Resident And Tourist",
                    font: {
                      size: 16,
                    },
                  },
                },
              }}
              data={{
                labels: [
                  "Bar Club",
                  "Festival",
                  "FnB",
                  "Market",
                  "Pavement",
                  "Shop",
                  "Transportation",
                ],
                datasets: data,
              }}
            />
          </div>
        )}
      </div>
      {filterMode === filterModeArr[1] && siteIndex && (
        <Landuse site={siteIndex} />
      )}

      {filterMode === filterModeArr[2] && siteIndex && (
        <Buildinguse site={siteIndex} />
      )}

      {filterMode === filterModeArr[3] && siteIndex && (
        <Activities site={siteIndex} />
      )}

      {filterMode === filterModeArr[0] && siteIndex && (
        <Interview site={siteIndex} />
      )}
    </>
  );
};

export default Interact;
