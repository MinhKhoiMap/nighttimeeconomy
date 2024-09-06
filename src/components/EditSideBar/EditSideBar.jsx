import React, { useContext, useEffect, useRef, useState } from "react";
import {
  SiteChosenContext,
  SiteDataContext,
} from "../../pages/SiteSelection/SiteSelection";
import firebaseAuth from "../../services/firebaseAuth";
import LottieIcon from "../LottieIcon/LottieIcon";

import account_icon from "../../assets/images/account.json";
import {
  getDownloadUrl,
  getMeta,
  listChild,
  listChilds,
} from "../../services/firebaseStorage";
import { Menu, MenuItem } from "@mui/material";
import { useMap } from "react-map-gl";
import { SourceID } from "../../constants";
import TextFieldCustom from "../TextFieldCustom/TextFieldCustom";
import { InteractModeContext } from "../../pages/Details/Interact/Interact";

const EditSideBar = ({ site, submitForm, children }) => {
  const { siteChosen } = useContext(SiteChosenContext);
  const { setProjectData } = useContext(SiteDataContext);
  const { interactMode } = useContext(InteractModeContext);

  const { map } = useMap();

  const editSideBar = useRef(null);
  const resizerBtn = useRef(null);

  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const [scenarioChosen, setScenarioChosen] = useState(null);
  const [listScenarios, setListScenarios] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showEditName, setShowEditName] = useState(true);

  function initResizeableHanlder(resizer, siderbar) {
    var x, w;

    function mouseDownHandler(e) {
      x = e.clientX;
      let sWidth = window.getComputedStyle(siderbar).width;
      w = parseInt(sWidth, 10);

      document.addEventListener("mousemove", mouseMoveHandler);
      document.addEventListener("mouseup", mouseUpHandler);
    }

    function mouseUpHandler() {
      document.removeEventListener("mouseup", mouseUpHandler);
      document.removeEventListener("mousemove", mouseMoveHandler);
    }

    function mouseMoveHandler(e) {
      let dx = x - e.clientX;
      let cw = w + dx;

      siderbar.style.width = `${cw}px`;
    }

    resizer.addEventListener("mousedown", mouseDownHandler);
  }

  useEffect(() => {
    initResizeableHanlder(resizerBtn.current, editSideBar.current);

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
                  console.log(updated);
                  setScenarioChosen(updated[0].parent.name.split("-")[1]);
                  loadScenario(updated[0].parent);
                  setShowEditName(false);
                });
            });
          }
        } else {
          setIsLoading(false);
          setScenarioChosen(null);
          setShowEditName(true);
        }
      }
    );
  }, [site]);

  async function loadScenario(scenario) {
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
        .getSource(SourceID[interactMode])
        .setData(scenarioData[interactMode][site]);
    } else {
      let baseData = JSON.parse(sessionStorage.getItem("geojson_source"));
      setProjectData(baseData);
      map
        .getSource(SourceID[interactMode])
        .setData(baseData[interactMode][site]);
    }
    setIsLoading(false);
  }

  function handleCloseMenu(e) {
    setAnchorEl(null);
  }

  return (
    <div
      className="fixed w-[40%] min-w-[35%] max-w-[52%] right-0 top-0 bottom-0 z-[9999] bg-[#121212] flex flex-row-reverse"
      ref={editSideBar}
    >
      <div className="sidebar__edit overflow-x-hidden overflow-y-auto h-full w-full border-l border-[#5e5e5f]">
        <header className="flex justify-between p-4 border border-l-0 bg-black/70 border-[#2f2f2f] text-white">
          <div className="flex gap-3 w-[50%] ">
            <p className="capitalize font-bold 2xl:text-2xl text-xl">
              {siteChosen.properties.id}
            </p>
            <button
              className="w-full text-sm hover:bg-white/20 rounded-md px-2 flex items-center gap-3"
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              <span className="w-[80%] truncate">{scenarioChosen}</span>
              <span>
                <i className="fa-regular fa-square-caret-down"></i>
              </span>
            </button>
            <Menu
              style={{ zIndex: 999999 }}
              id="scenarios-menu"
              open={openMenu}
              onClose={handleCloseMenu}
              anchorEl={anchorEl}
              className="w-[20%]"
            >
              <MenuItem
                className="truncate w-full flex gap-3"
                style={{ borderBottom: "1px solid #5e5e5f" }}
                title="Base"
                onClick={() => {
                  setScenarioChosen("Base");
                  loadScenario();
                  handleCloseMenu();
                }}
              >
                <span className="text-sm">Base</span>
              </MenuItem>
              {listScenarios &&
                listScenarios.map((scenario) => (
                  <MenuItem
                    key={scenario.parent.name}
                    className="truncate w-full flex gap-3"
                    title={
                      scenario.parent.name.split("-")[1] +
                      " " +
                      new Date(scenario.date).toUTCString()
                    }
                    onClick={() => {
                      console.log(scenario.parent);
                      loadScenario(scenario.parent);
                      setScenarioChosen(scenario.parent.name.split("-")[1]);
                      handleCloseMenu();
                    }}
                  >
                    <span className="text-sm">
                      {scenario.parent.name.split("-")[1]}
                    </span>
                    <span className="text-xs text-gray-600 w-full truncate">
                      {new Date(scenario.date).toUTCString()}
                    </span>
                  </MenuItem>
                ))}
              <MenuItem style={{ borderTop: "1px solid #5e5e5f" }}>
                <i className="fa-solid fa-plus mr-2"></i>
                New
              </MenuItem>
            </Menu>
          </div>
          <div className="flex items-center justify-end gap-1 w-full">
            <p
              className="text-sm flex items-center justify-end w-[48%] hover:bg-black/60"
              title={`Hello ${firebaseAuth.auth?.currentUser.email}!`}
            >
              Hello
              <span className="inline-block mx-1 truncate">
                {firebaseAuth.auth.currentUser &&
                  firebaseAuth.auth?.currentUser.email}
              </span>
              !
            </p>
            <LottieIcon
              iconType={account_icon}
              size={30}
              isAnimateOnHover={true}
              style={{ cursor: "pointer" }}
            />
          </div>
        </header>
        <section className="px-3 py-4 w-full">
          <form onSubmit={submitForm}>
            {showEditName && (
              <div className="flex items-center gap-4 pr-3">
                <span className="text-xl text-white">Scenario:</span>
                <TextFieldCustom
                  fieldName="scenario-name"
                  label="Name"
                  variant="outlined"
                  type="text"
                  isRequired={true}
                  showHelper={true}
                  value={scenarioChosen}
                  triggers={(e) => {
                    setScenarioChosen(e.target.value);
                  }}
                  helperText={
                    "You can't rename the scenario after it has been uploaded!"
                  }
                />
              </div>
            )}
            {children}
          </form>
        </section>
      </div>
      <button
        className="resize__button bg-black/20 cursor-w-resize px-[6px]"
        ref={resizerBtn}
      >
        <i className="ti-split-h text-white text-base"></i>
      </button>
      {isLoading && <loading />}
    </div>
  );
};

export default EditSideBar;
