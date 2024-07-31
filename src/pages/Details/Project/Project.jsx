import { useEffect, useState } from "react";
import "./Project.css";

// Components
import DocumentViewer from "../../../components/DocumentViewer/DocumentViewer";

// Services, Utils
import {
  getDownloadUrl,
  getRef,
  listChilds,
} from "../../../services/firebaseStorage";
import logo from "../../../assets/images/logo.svg";

const Project = ({ projectName, setShowProjectMode, siteIndex }) => {
  const [slides, setSlides] = useState(null);
  const [loading, setLoading] = useState(false);

  async function loadingSlide() {
    try {
      const projectRef = getRef(
        `nha_trang/media/site${Number(siteIndex) + 1}/project`
      );

      const slidesRef = await listChilds(projectRef);
      getDownloadUrl(slidesRef[0]).then((url) => {
        setSlides(url);
      });
    } catch (err) {
      console.log(err, "Project error");
    }
  }

  useEffect(() => {
    window.onkeydown = (e) => {
      if (e.keyCode === 27) {
        setShowProjectMode(false);
      }
    };

    return () => (window.onkeydown = null);
  });

  useEffect(() => {
    loadingSlide();
  }, [siteIndex]);

  return (
    <>
      <div className="project_mode fixed top-0 left-0 bottom-0 right-0 z-[999999] h-screen overflow-hidden bg-black">
        {/* <header className="text-3xl text-[#242526] bg-white font-medium capitalize p-5 flex justify-between items-center">
          <h3 className="text-3xl font-[500] text-[#242526]">{projectName}</h3>
          <span onClick={() => setShowProjectMode(false)} title="Close">
            <i className="fa-solid fa-xmark text-2xl cursor-pointer hover:text-[#ce2027] transition-colors duration-[0.15s]"></i>
          </span>
        </header> */}
        <section
          className="sticky bg-black/75 px-5 py-4 flex justify-between items-center top-0 z-[99999]"
          style={{ backdropFilter: "blur(60px)" }}
        >
          <span className="flex items-center">
            <figure className="w-[330px] relative after:w-[1px] after:bg-white after:h-full after:absolute after:left-full after:top-0 after:rounded-lg pr-5 mr-5">
              <img src={logo} alt="" />
            </figure>
            <h3 className="text-2xl font-[600] text-white capitalize">
              {projectName}
            </h3>
          </span>
          {/* Clicking on close button, redirect to before mode */}
          <span onClick={() => setShowProjectMode(false)} title="Close">
            <i className="fa-solid fa-xmark text-2xl cursor-pointer text-white hover:text-[#ce2027] transition-colors duration-[0.15s]"></i>
          </span>
        </section>

        {/* If u want navigation page to work, you have to put the viewer into 
        an element which has fixed height */}
        <section className="relative flex-1" style={{ height: "calc(100% - 65px)" }}>
          {slides && <DocumentViewer file={slides} />}
        </section>
      </div>
    </>
  );
};

export default Project;
