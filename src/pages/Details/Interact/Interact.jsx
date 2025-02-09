import { useEffect, useState, useContext, createContext } from "react";
import { useNavigate } from "react-router-dom";
import { useMap } from "react-map-gl";

// Utils
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
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
import {
  SiteChosenContext,
  SiteDataContext,
} from "../../SiteSelection/SiteSelection";
import { ViewModeContext } from "../Details";

// Components"
import SpeedDialCustom from "../../../components/SpeedDialCustom/SpeedDialCustom";
import LottieIcon from "../../../components/LottieIcon/LottieIcon";
import Landuse from "./Landuse/Landuse";
import Buildinguse from "./Buildinguse/Buildinguse";
import Activities from "./Activities/Activities";
import Interview from "./Interview/Interview";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const InteractModeContext = createContext(null);
export const EditModeData = createContext(null);

const Interact = ({ siteIndex }) => {
  const { siteSelectionData, setProjectData } = useContext(SiteDataContext);
  const { siteChosen } = useContext(SiteChosenContext);
  const { viewMode, setViewMode } = useContext(ViewModeContext);

  const navigator = useNavigate();

  const { map } = useMap();

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterMode, setFilterMode] = useState(interactMode.landuse);
  const [listScenarios, setListScenarios] = useState(null);
  const [scenarioChosen, setScenarioChosen] = useState("Base");

  // Handle Fitbounds to the selected area
  const fitArea = () => {
    if (viewMode === viewModeCons.edit) {
      fitAreaUtls(siteSelectionData.features[siteIndex].geometry, map, {
        padding: {
          top: 20,
          bottom: 20,
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

  async function loadingScenarios() {
    setIsLoading(true);

    try {
      let res = await listChild(
        `/nha_trang/scenarios/${siteChosen.properties.id}`
      );

      let listScenarios = [],
        updated = [];

      if (viewMode === viewModeCons.edit) {
        res.prefixes.forEach((folderRef) => {
          if (folderRef.name.startsWith(firebaseAuth.auth.currentUser.email)) {
            listScenarios.push(folderRef);
          }
        });
      } else {
        res.prefixes.forEach((folderRef) => {
          listScenarios.push(folderRef);
        });
      }

      if (listScenarios.length > 0) {
        for (let scenario of listScenarios) {
          let res = await listChild(scenario.fullPath);
          let meta = await getMeta(res.items[0]);
          updated.push({ date: meta.updated, parent: meta.ref.parent });
        }
        updated.sort((a, b) => (new Date(a.date) > new Date(b.date) ? -1 : 1));
        setListScenarios(updated);
        if (viewMode === viewModeCons.edit)
          setScenarioChosen(updated[0].parent);
      } else {
        setListScenarios(null);
        if (viewMode === viewModeCons.edit) setScenarioChosen("Base");
      }
    } catch (error) {
      console.log(error, "Error at Loading Scenarios");
    }

    setIsLoading(false);
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
        ?.setData(baseData[filterMode][siteIndex]);
    }

    setIsLoading(false);
  }

  useEffect(() => {
    if (typeof scenarioChosen === "string") getScenarioGeoJSON();
    else getScenarioGeoJSON(scenarioChosen);
  }, [scenarioChosen]);

  useEffect(() => {
    // Loading scenarios and initial it
    loadingScenarios();
  }, [viewMode, siteIndex]);

  // useEffect(() => {
  //   if (!map.hasControl(draw)) {
  //     console.log("draw control");
  //     // Add the Draw control to your map
  //     map.addControl(draw);
  //   }
  // }, [viewMode]);

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
            <p className="text-xl">Land Use</p>
          </div>
          <div
            className={`details__filter-tool ${
              filterMode === interactMode.buildinguse &&
              "details__filter-tool--active"
            }`}
            onClick={() => setFilterMode(interactMode.buildinguse)}
          >
            <p className="text-xl">Building Use</p>
          </div>
          <div
            className={`details__filter-tool ${
              filterMode === interactMode.activities &&
              "details__filter-tool--active"
            }`}
            onClick={() => setFilterMode(interactMode.activities)}
          >
            <p className="text-xl">Activities Point</p>
          </div>
          <div
            className={`details__filter-tool ${
              filterMode === interactMode.interview &&
              "details__filter-tool--active"
            }`}
            onClick={() => setFilterMode(interactMode.interview)}
          >
            <p className="text-xl">Interview Point</p>
          </div>
        </div>

        {!(viewMode === viewModeCons.edit) && (
          <div className="mt-4 ml-2">
            <Select
              onValueChange={(val) => {
                val === "base"
                  ? setScenarioChosen("Base")
                  : setScenarioChosen(val);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue
                  placeholder="Select a scenario"
                  className="bg-black"
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem className="cursor-pointer" value="base">
                    Base
                  </SelectItem>
                  {listScenarios &&
                    listScenarios.map((scenario) => (
                      <SelectItem
                        key={scenario.parent}
                        className="cursor-pointer"
                        value={scenario.parent}
                      >
                        {scenario.parent.name}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

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
        <div className="fixed top-6 right-6 flex flex-row-reverse">
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
