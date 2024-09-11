import { useEffect, useRef, useState, useContext, createContext } from "react";
import { useNavigate } from "react-router-dom";
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
import firebaseAuth from "../../../services/firebaseAuth";
import { fitAreaUtls } from "../../../utils/fitAreaUtls";
import { onAuthStateChanged } from "firebase/auth";
import {
  getDownloadUrl,
  getMeta,
  listChild,
  listChilds,
} from "../../../services/firebaseStorage";

// Assets
import categories from "../../../assets/images/categories.json";
import { interactMode, viewModeCons, SourceID } from "../../../constants";

// Components"
import SpeedDialCustom from "../../../components/SpeedDialCustom/SpeedDialCustom";
import LottieIcon from "../../../components/LottieIcon/LottieIcon";
import {
  SiteChosenContext,
  SiteDataContext,
} from "../../SiteSelection/SiteSelection";
import Landuse from "./Landuse/Landuse";
import Buildinguse from "./Buildinguse/Buildinguse";
import Activities from "./Activities/Activities";
import Interview from "./Interview/Interview";
import { ViewModeContext } from "../Details";

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
ChartJS.defaults.font.family = "Open Sauce One";
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
        backgroundColor: "#38812F",
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
          "#8F4700",
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
        backgroundColor: "#38812F",
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

export const InteractModeContext = createContext(null);
export const EditModeData = createContext(null);

const Interact = ({ siteIndex }) => {
  const { siteSelectionData, setProjectData } = useContext(SiteDataContext);
  const { siteChosen } = useContext(SiteChosenContext);
  const { viewMode, setViewMode } = useContext(ViewModeContext);

  const navigator = useNavigate();

  const { map } = useMap();
  const chartRef = useRef(null);

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterMode, setFilterMode] = useState(interactMode.activities);
  const [chartData, setChartData] = useState(data[siteIndex]);
  const [listScenarios, setListScenarios] = useState(null);
  const [scenarioChosen, setScenarioChosen] = useState("Base");

  // Handle Fitbounds to the selected area
  const fitArea = () => {
    if (viewMode === viewModeCons.edit) {
      fitAreaUtls(siteSelectionData.features[siteIndex].geometry, map, {
        padding: {
          top: 0,
          bottom: 0,
          left: 300,
          right: parseInt(window.screenX / 4) + 100,
        },
        duration: 400,
      });
    } else if (filterMode !== interactMode.interview)
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

  function loadingScenarios() {
    setIsLoading(true);

    listChild(`/nha_trang/scenarios/${siteChosen.properties.id}`).then(
      (res) => {
        let listScenarios = [],
          updated = [];

        res.prefixes.forEach((folderRef) => {
          if (folderRef.name.startsWith(firebaseAuth.auth.currentUser.email)) {
            listScenarios.push(folderRef);
          }
        });

        if (listScenarios.length > 0) {
          for (let scenario of listScenarios) {
            listChild(scenario.fullPath).then((res) => {
              getMeta(res.items[0])
                .then((meta) => {
                  updated.push({ date: meta.updated, parent: meta.ref.parent });
                })
                .then(() => {
                  updated.sort((a, b) =>
                    new Date(a.date) > new Date(b.date) ? -1 : 1
                  );
                  setListScenarios(updated);
                  // console.log(updated);
                  setScenarioChosen(updated[0].parent);
                })
                .catch((err) => {
                  console.log(err);
                })
                .finally(() => setIsLoading(false));
            });
          }
        } else {
          setIsLoading(false);
          setListScenarios(null);
          setScenarioChosen(null);
        }
      }
    );
  }

  async function getScenarioGeoJSON(scenario) {
    setIsLoading(true);
    if (scenario) {
      let scenarioData = {};
      const items = await listChilds(scenario);
      for (let item of items) {
        const name = item.name.split(".json")[0];
        const downloadURL = await getDownloadUrl(item);
        const res = await fetch(downloadURL);
        const data = await res.json();
        scenarioData[name] = data;
      }

      setProjectData((prev) => ({ ...prev, ...scenarioData }));
      map
        .getSource(SourceID[filterMode])
        .setData(scenarioData[filterMode][siteIndex]);
    } else {
      let baseData = JSON.parse(sessionStorage.getItem("geojson_source"));
      setProjectData(baseData);
      map
        .getSource(SourceID[filterMode])
        .setData(baseData[filterMode][siteIndex]);
    }

    setIsLoading(false);
  }

  useEffect(() => {
    if (viewMode === viewModeCons.edit) {
      if (typeof scenarioChosen === "string") getScenarioGeoJSON();
      else getScenarioGeoJSON(scenarioChosen);
    }
  }, [scenarioChosen]);

  useEffect(() => {
    if (viewMode === viewModeCons.edit) {
      // Loading scenarios and initial it
      loadingScenarios();
    }
  }, [viewMode, siteIndex]);

  useEffect(() => {
    onAuthStateChanged(firebaseAuth.auth, (user) => {
      if (user) {
        setUser(firebaseAuth.auth.currentUser);
      }
    });
  }, []);

  // Handle Fit Bounds When Change Site State (siteIndex, viewMode state)
  useEffect(() => {
    if (siteIndex && siteSelectionData) fitArea();
  }, [siteIndex, filterMode, siteSelectionData, viewMode]);

  useEffect(() => {
    setChartData(data[siteIndex]);
  }, [siteIndex]);

  return (
    <>
      <div className="sidebar">
        <div className="details__filter">
          <div
            className={`details__filter-tool ${
              filterMode === interactMode.landuse &&
              "details__filter-tool--active"
            }`}
            onClick={() => setFilterMode(interactMode.landuse)}
          >
            <p>Land Use</p>
          </div>
          <div
            className={`details__filter-tool ${
              filterMode === interactMode.buildinguse &&
              "details__filter-tool--active"
            }`}
            onClick={() => setFilterMode(interactMode.buildinguse)}
          >
            <p>Building Use</p>
          </div>
          <div
            className={`details__filter-tool ${
              filterMode === interactMode.activities &&
              "details__filter-tool--active"
            }`}
            onClick={() => setFilterMode(interactMode.activities)}
          >
            <p>Activities Point</p>
          </div>
          <div
            className={`details__filter-tool ${
              filterMode === interactMode.interview &&
              "details__filter-tool--active"
            }`}
            onClick={() => setFilterMode(interactMode.interview)}
          >
            <p>Interview Point</p>
          </div>
        </div>
      </div>
      {filterMode === interactMode.interview && chartData && (
        <div className="w-[500px] h-[350px] mt-6 fixed top-[300px] left-[30px]">
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

      <InteractModeContext.Provider value={{ interactMode: filterMode }}>
        <EditModeData.Provider
          value={{ listScenarios, scenarioChosen, setScenarioChosen }}
        >
          {filterMode === interactMode.landuse && siteIndex && (
            <Landuse site={siteIndex} />
          )}

          {filterMode === interactMode.buildinguse && siteIndex && (
            <Buildinguse site={siteIndex} />
          )}

          {filterMode === interactMode.activities && siteIndex && (
            <Activities site={siteIndex} />
          )}

          {filterMode === interactMode.interview && siteIndex && (
            <Interview site={siteIndex} />
          )}
        </EditModeData.Provider>
      </InteractModeContext.Provider>

      {viewMode !== viewModeCons.edit && (
        <div className="fixed top-6 right-6">
          <SpeedDialCustom
            direction="down"
            icon={
              <LottieIcon
                iconType={categories}
                size={30}
                color="black"
                isAnimateOnHover={true}
              />
            }
            actions={
              user
                ? [
                    {
                      name: user.email,
                      icon: <i className="fa-solid fa-user"></i>,
                      action: () => {},
                    },
                    {
                      name: "Edit Mode",
                      icon: <i className="fa-solid fa-pen-ruler"></i>,
                      action: () => {
                        setViewMode(viewModeCons.edit);
                      },
                    },
                    {
                      name: "Log out",
                      icon: (
                        <i className="text-white fa-solid fa-person-walking-dashed-line-arrow-right"></i>
                      ),
                      action: () => {
                        firebaseAuth.signOut().then(() => {
                          window.location.reload();
                        });
                      },
                      bg: "#ce2027",
                    },
                  ]
                : [
                    {
                      name: "Log in",
                      icon: <i className="fa-solid fa-user"></i>,
                      action: () => {
                        navigator("/auth");
                      },
                    },
                  ]
            }
          />
        </div>
      )}
      {isLoading && <loading />}
    </>
  );
};

export default Interact;
