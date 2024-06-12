import { useNavigate } from "react-router-dom";
import "./AboutProject.css";

import logo from "../../assets/images/logo.svg";

const AboutProject = () => {
  const navigate = useNavigate();

  return (
    <div className="about_prj fixed top-0 bottom-0 left-0 right-0 bg-white z-[99999] overflow-auto">
      <section
        className="sticky bg-black/75 px-5 py-4 flex justify-between items-center top-0"
        style={{ backdropFilter: "blur(60px)" }}
      >
        <span className="flex items-center">
          <figure className="w-[330px] relative after:w-[1px] after:bg-white after:h-full after:absolute after:left-full after:top-0 after:rounded-lg pr-5 mr-5">
            <img src={logo} alt="" />
          </figure>
          <h3 className="text-2xl font-[600] text-white">Night Time Economy</h3>
        </span>
        {/* Clicking on close button, redirect to before mode */}
        <span onClick={() => navigate("/nha_trang/0")} title="Close">
          <i className="fa-solid fa-xmark text-2xl cursor-pointer text-white hover:text-[#ce2027] transition-colors duration-[0.15s]"></i>
        </span>
      </section>
      <section>
        <figure className="w-full">
          <img
            src="/src/assets/images/project_thumb.png"
            className="w-full"
            alt=""
          />
        </figure>
        <div className="flex justify-center my-5">
          <span className="p-5 w-[60%]">
            <h3 className="text-3xl font-bold mb-4 text-[#1B3C73]">About Project:</h3>
            <p>
              ;Lorem ipsum dolor sit, amet consectetur adipisicing elit.
              Laborum, voluptates, nemo earum tempore eaque harum eum dolores
              voluptate animi suscipit deleniti sed dicta quisquam cupiditate
              repellat delectus corrupti tempora illum?
            </p>
          </span>
          <span className="p-5 w-[40%] border-l border-[#ccc]">
            <h3 className="text-3xl font-bold mb-4 text-[#1B3C73]">Credits:</h3>
          </span>
        </div>
      </section>
    </div>
  );
};

export default AboutProject;
