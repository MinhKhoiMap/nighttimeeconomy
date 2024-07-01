import { useEffect } from "react";
import $ from "jquery";

import "./Project.css";
import { project } from "../../../assets/data/project";

const Project = ({ projectName, setShowProjectMode, groupIndex }) => {
  useEffect(() => {
    let currentSlide = 0;
    const slides = $(".project_mode section img");

    function handleScroll() {
      for (let i = 0; i < slides.length; i++) {
        const rect = slides[i].getBoundingClientRect();
        if (rect.bottom >= 0) {
          if (i === 0) currentSlide = 0;
          else currentSlide = i;
          console.log(currentSlide);
          return;
        }
      }
    }

    $(".project_mode").on("scroll", handleScroll);

    window.onkeydown = (e) => {
      let nextSlide;
      switch (e.keyCode) {
        case 40:
          console.log("first", currentSlide);
          nextSlide =
            currentSlide + 1 > slides.length - 1
              ? currentSlide
              : currentSlide + 1;
          slides[nextSlide].scrollIntoView();
          break;
        case 38:
          nextSlide = currentSlide - 1 < 0 ? currentSlide : currentSlide - 1;
          slides[nextSlide].scrollIntoView();
          break;
      }
    };
  }, []);

  return (
    <div className="project_mode fixed top-0 left-0 bottom-0 right-0 z-[9999999] bg-white overflow-auto">
      <header className="text-3xl text-[#242526] font-medium capitalize p-5 flex justify-between items-center">
        <h3 className="text-3xl font-[500] text-[#242526]">{projectName}</h3>
        <span onClick={setShowProjectMode} title="Close">
          <i className="fa-solid fa-xmark text-2xl cursor-pointer hover:text-[#ce2027] transition-colors duration-[0.15s]"></i>
        </span>
      </header>
      <section>
        {project[groupIndex].map((page, index) => (
          <img src={page} key={index} className="object-contain" />
        ))}
      </section>
    </div>
  );
};

export default Project;
