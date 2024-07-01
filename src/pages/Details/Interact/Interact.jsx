import { useEffect, useRef, useState } from "react";
import { useMap } from "react-map-gl";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  BarController,
  LineController,
  PolarAreaController,
  PieController,
  RadarController,
  BubbleController,
  ScatterController,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";

// Utils
import "./Interact.css";
import { fitAreaUtls } from "../../../utils/fitAreaUtls";
import { siteSelectionData } from "../../../assets/data/site";

import Landuse from "./Landuse/Landuse";
import Buildinguse from "./Buildinguse/Buildinguse";
import Activities from "./Activities/Activities";
import Interview from "./Interview/Interview";

const filterModeArr = ["interview", "landuse", "buildinguse", "activities"];
ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  BarController,
  LineController,
  PolarAreaController,
  PieController,
  RadarController,
  BubbleController,
  ScatterController,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

ChartJS.defaults.color = "#fff";
ChartJS.defaults.font.family = "Barlow";
ChartJS.defaults.font.weight = "700";
ChartJS.defaults.scale.grid.display = false;

const data = [
  {
    typeChart: "bar",
    opts: {
      indexAxis: "y",
    },
    title: "WHAT DO YOU THINK ARE THE BENEFITS OF THE NIGHT ECONOMY?",
    labels: [
      "Place to gather after work",
      "Reduce unemployment rate",
      "Shopping",
      "Relax",
      "Culture entertainment",
      "Diversity",
      "Crowd",
    ],
    dataset: [
      {
        label: "Business owners",
        backgroundColor: "#4285F4",
        categoryPercentage: 1,
        barPercentage: 0.8,
        data: [0, 3, 2, 0, 2, 3, 3],
      },
      {
        label: "Researchers",
        backgroundColor: "#EA4335",
        categoryPercentage: 1,
        barPercentage: 0.8,
        data: [0, 5, 1, 0, 1, 5, 1],
      },
      {
        label: "Residents",
        backgroundColor: "#FBBC25",
        categoryPercentage: 1,
        barPercentage: 0.8,
        data: [3, 3, 3, 4, 3, 3, 2],
      },
    ],
  },
  {
    typeChart: "pie",
    legend: {
      labels: {
        pointStyle: "circle",
        usePointStyle: true,
        boxWidth: 8,
        boxHeight: 8,
      },
      opts: {
        position: "right",
      },
    },
    title: "How was real spend in the trip?",
    labels: [
      "0 ~ 300 (USD)",
      "300 ~ 600 (USD)",
      "600 ~ 900 (USD)",
      "900 ~ 1200 (USD)",
      "1200 ~ 1500 (USD)",
      "more than 1500 (USD)",
    ],
    dataset: [
      {
        backgroundColor: [
          "#3266CC",
          "#DC3912",
          "#FF991C",
          "#12961B",
          "#991499",
          "#0099C6",
        ],
        data: [2, 0, 0, 1, 1, 2],
      },
    ],
  },
  {
    typeChart: "bar",
    opts: {
      indexAxis: "y",
    },
    title: "Demand of Resident And Tourist",
    labels: [
      "Bar Club",
      "Festival",
      "FnB",
      "Market",
      "Pavement",
      "Shop",
      "Transportation",
    ],
    dataset: [
      {
        label: "Foreign",
        backgroundColor: "#ce2027",
        categoryPercentage: 1,
        barPercentage: 0.8,
        data: [1, 0, 2, 0, 1, 0, 1],
      },
      {
        label: "Resident",
        backgroundColor: "#ffc436",
        categoryPercentage: 1,
        barPercentage: 0.8,
        data: [1, 5, 2, 2, 0, 0, 0],
      },
      {
        label: "Local",
        backgroundColor: "#c5fff8",
        categoryPercentage: 1,
        barPercentage: 0.8,
        data: [0, 0, 0, 0, 0, 2, 0],
      },
    ],
  },
];

const Interact = ({ siteIndex }) => {
  const { map } = useMap();
  const chartRef = useRef(null);

  const [filterMode, setFilterMode] = useState(filterModeArr[1]);
  const [chartData, setChartData] = useState(data[siteIndex]);

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

  useEffect(() => {
    setChartData(data[siteIndex]);
  }, [siteIndex]);

  return (
    <>
      <div className="sidebar">
        <div className="details__filter">
          <div
            className={`details__filter-tool ${
              filterMode === filterModeArr[1] && "details__filter-tool--active"
            }`}
            onClick={() => setFilterMode(filterModeArr[1])}
          >
            <p>Land Use</p>
          </div>
          <div
            className={`details__filter-tool ${
              filterMode === filterModeArr[2] && "details__filter-tool--active"
            }`}
            onClick={() => setFilterMode(filterModeArr[2])}
          >
            <p>Building Use</p>
          </div>
          <div
            className={`details__filter-tool ${
              filterMode === filterModeArr[3] && "details__filter-tool--active"
            }`}
            onClick={() => setFilterMode(filterModeArr[3])}
          >
            <p>Activities Point</p>
          </div>
          <div
            className={`details__filter-tool ${
              filterMode === filterModeArr[0] && "details__filter-tool--active"
            }`}
            onClick={() => setFilterMode(filterModeArr[0])}
          >
            <p>Interview Point</p>
          </div>
        </div>
      </div>
      {filterMode === filterModeArr[0] && chartData && (
        <div className="w-[500px] h-[350px] mt-6 fixed bottom-[55px] left-[30px]">
          <Chart
            ref={chartRef}
            type={chartData.typeChart}
            options={{
              indexAxis: "x",
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
                    boxPadding: 15,
                    ...chartData?.legend?.labels,
                  },
                  position: "top",
                  ...chartData?.legend?.opts,
                },
                title: {
                  display: true,
                  color: "#FFFFFF",
                  text: chartData.title,
                  font: {
                    size: 16,
                  },
                },
                datalabels: {
                  formatter: (value, context) => {
                    const dataPoints = context.chart.data.datasets[0].data;
                    const totalValue = dataPoints.reduce(
                      (total, dataPoint) => total + dataPoint,
                      0
                    );
                    const percentageVal = ((value / totalValue) * 100).toFixed(
                      1
                    );
                    const display =
                      percentageVal > 0 ? `${percentageVal}%` : null;

                    return display;
                  },
                  display: chartData.typeChart.toLowerCase() == "pie",
                },
              },
              ...chartData?.opts,
            }}
            plugins={[ChartDataLabels]}
            data={{
              labels: chartData.labels,
              datasets: chartData.dataset,
            }}
          />
        </div>
      )}
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
