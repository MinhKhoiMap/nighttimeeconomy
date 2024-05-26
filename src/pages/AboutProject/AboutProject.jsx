import { useNavigate } from "react-router-dom";
import "./AboutProject.css"

const AboutProject = () => {
  const navigate = useNavigate();

  return (
    <div className="about_prj fixed top-0 bottom-0 left-0 right-0 bg-white z-[99999] overflow-auto">
      <section className="sticky top-0 bg-white p-5 flex justify-between items-center">
        <h3 className="text-3xl font-[500] text-[#242526]">About Project</h3>
        <span onClick={() => navigate(-1)} title="Close">
          <i className="fa-solid fa-xmark text-2xl cursor-pointer hover:text-[#ce2027] transition-colors duration-[0.15s]"></i>
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
          <p className="text-center max-w-[69%] ">
            Located 80 kilometres south of Kuwait City, South Sabah Al-Ahmad
            City is set to be the urban core for the country’s southern
            sub-region. The city will be home to an estimated 280,000 people,
            while creating another 145,000 jobs in a diverse range of industries
            including construction, medicine, manufacturing and culture, along
            with extensive green open spaces and multi-layered public transport
            systems that promote wellbeing and sustainability. The 61.5
            square-kilometre city is formed of ten neighbourhood clusters
            arranged around the city’s central business district, and bordered
            by a ring of light industrial buildings. The central district
            contains a sports stadium, museum, city university and a major city
            park, which forms the heart of the masterplan’s landscape strategy.
            Petal-like green spaces branch off from the city park, running
            between each of the neighbourhoods to create green urban links
            throughout the masterplan. The undulating topography of the
            development has been inspired by the gentle form of sand dunes in
            the desert. The practice has also detailed one neighbourhood cluster
            as a pilot project to showcase a future vision for the city. The
            villa cluster forms the smallest unit of the masterplan, arranged
            around a contemporary interpretation of a Farige – a traditional
            Kuwaiti cul-de-sac. These also function as shaded courtyards,
            merging traditional living with contemporary urbanism. Several villa
            clusters together form a community centre, which includes local
            parks and shops, nursery and kindergarten schools, and local mosques
            at every 250 metres. A number of communities combine to become a
            neighbourhood, each with a residential centre featuring a large
            souk, centres for health, children and the youth, and primary,
            elementary and secondary schools. The masterplan offers a range
            housing typologies, including apartments and patio houses,
            encouraging high density living with equally high standards of
            luxury. The modular construction system adopted throughout allows
            for multiple configurations and ensures high quality buildings,
            while also contributing to strengthening the construction industry
            in Kuwait. The pilot neighbourhood cluster will also feature
            roof-top photovoltaic installations on the industrial buildings
            surrounding the development, to further strengthen the sustainable
            credentials of the project. The city also offers opportunities
            several leisure activities such as desert glamping, e-biking, design
            galleries and luxury shopping.
          </p>
        </div>
      </section>
    </div>
  );
};

export default AboutProject;
