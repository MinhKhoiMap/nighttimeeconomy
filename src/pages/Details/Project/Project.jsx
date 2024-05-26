import "./Project.css";
import { project } from "../../../assets/data/project";

const Project = ({ projectName, setShowProjectMode, groupIndex }) => {
  return (
    <div className="project_mode fixed top-0 left-0 bottom-0 right-0 z-[9999999] bg-white overflow-auto">
      <header className="text-3xl text-[#242526] font-medium capitalize p-5 flex justify-between items-center">
        <h3 className="text-3xl font-[500] text-[#242526]">{projectName}</h3>
        <span onClick={setShowProjectMode} title="Close">
          <i className="fa-solid fa-xmark text-2xl cursor-pointer hover:text-[#ce2027] transition-colors duration-[0.15s]"></i>
        </span>
      </header>
      <section>
        {project[0].map((page, index) => (
          <img src={page} key={index} className="object-contain" />
        ))}
      </section>
    </div>
  );
};

export default Project;
