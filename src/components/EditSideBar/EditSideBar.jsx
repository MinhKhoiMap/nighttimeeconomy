import React, { useContext, useEffect, useRef, useState } from "react";
import firebaseAuth from "../../services/firebaseAuth";
import LottieIcon from "../LottieIcon/LottieIcon";
import { Menu, MenuItem } from "@mui/material";
import { useMap } from "react-map-gl";
import {
  SiteChosenContext,
  SiteDataContext,
} from "../../pages/SiteSelection/SiteSelection";
import { ViewModeContext } from "../../pages/Details/Details";

// Assets
import account_icon from "../../assets/images/account.json";

// Utils
import { EditModeData } from "../../pages/Details/Interact/Interact";

// Components
import TextFieldCustom from "../TextFieldCustom/TextFieldCustom";
import { viewModeCons } from "../../constants";

const EditSideBar = ({ site, submitForm, children }) => {
  const { siteChosen } = useContext(SiteChosenContext);
  const { listScenarios, scenarioChosen, setScenarioChosen } =
    useContext(EditModeData);
  const { setViewMode } = useContext(ViewModeContext);

  const editSideBar = useRef(null);
  const resizerBtn = useRef(null);

  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorAccountEl, setAnchorAccountEl] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [showEditName, setShowEditName] = useState(false);

  const openMenu = Boolean(anchorEl),
    openAccountMenu = Boolean(anchorAccountEl);

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
    if (typeof scenarioChosen !== "string") {
      setShowEditName(false);
      // if (scenarioChosen === "Base") loadScenario();
      // else loadScenario(scenarioChosen);
    } else {
      setShowEditName(true);
    }
  }, [scenarioChosen]);

  useEffect(() => {
    initResizeableHanlder(resizerBtn.current, editSideBar.current);
  }, [site]);

  function handleCloseMenu() {
    setAnchorEl(null);
  }

  function handleCloseAccountMenu() {
    setAnchorAccountEl(null);
  }

  return (
    <div
      className="edit-bar__container fixed w-[40%] min-w-[500px] max-w-[52%] right-0 top-0 bottom-0 z-[9999] bg-[#121212] flex flex-row-reverse"
      ref={editSideBar}
    >
      <div className="sidebar__edit overflow-x-hidden overflow-y-auto h-full w-full border-l border-[#5e5e5f]">
        <header className="flex justify-between p-4 border border-l-0 bg-black border-[#2f2f2f] text-white sticky top-0 z-[99999] shadow-md shadow-white/20">
          <div className="flex gap-3 w-[50%] ">
            <p className="capitalize font-bold 2xl:text-2xl text-xl">
              {siteChosen.properties.id}
            </p>
            <button
              className="w-full text-sm hover:bg-white/20 rounded-md px-2 flex items-center gap-3"
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              <span className="w-[80%] truncate">
                {scenarioChosen && typeof scenarioChosen !== "string"
                  ? scenarioChosen.name.split("-")[1]
                  : scenarioChosen}
              </span>
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
              className="w-[300px]"
            >
              <MenuItem
                className="truncate w-full flex gap-3"
                style={{ borderBottom: "1px solid #5e5e5f" }}
                title="Base"
                onClick={() => {
                  setScenarioChosen("Base");
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
                      // loadScenario(scenario.parent);
                      setScenarioChosen(scenario.parent);
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
              <MenuItem
                style={{ borderTop: "1px solid #5e5e5f" }}
                onClick={() => {
                  setScenarioChosen("Untitled");
                  handleCloseMenu();
                }}
              >
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
            <button onClick={(e) => setAnchorAccountEl(e.currentTarget)}>
              <LottieIcon
                iconType={account_icon}
                size={30}
                isAnimateOnHover={true}
                style={{ cursor: "pointer" }}
              />
            </button>
            <Menu
              style={{ zIndex: 999999 }}
              id="account-menu"
              open={openAccountMenu}
              onClose={handleCloseAccountMenu}
              anchorEl={anchorAccountEl}
            >
              <MenuItem
                onClick={() => {
                  setViewMode(viewModeCons.interact);
                  handleCloseAccountMenu();
                }}
              >
                <p className="text-sm text-red-500">Exit Edit Mode</p>
              </MenuItem>
            </Menu>
          </div>
        </header>
        {scenarioChosen !== "Base" ? (
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
        ) : (
          <p className="text-center text-lg italic mt-4 text-[#ccc]">
            You can't edit Base.
          </p>
        )}
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
