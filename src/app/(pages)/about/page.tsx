"use client";

import { HeaderBlock } from "@/components/hud/pages/HeaderBlock";
import { TextBlock } from "@/components/hud/pages/TextBlock";
import { useSatMapStore } from "@/store/satmapStore";

const AboutPage = () => {
  const menuOpen = useSatMapStore((s) => s.menuOpen);

  return (
    <div
      className={`absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 pointer-events-auto w-3/4 md:w-[60%] lg:w-1/2 max-h-3/4 ${
        menuOpen ? "invisible" : "visible"
      }`}
    >
      <HeaderBlock header="About" />

      <div className="flex flex-col gap-2.5 overflow-y-auto">
        <TextBlock eyebrow="SATMAP7">
          SATMAP7, short for "Satellite Map 7", is a full-stack, real-time 3D
          satellite tracker web application. Visualize planet Earth and explore
          thousands of orbiting satellites to scale in real-time. Key features
          include visualizing artificial constellations, visualizing satellite
          orbit paths, and discovering satellite statistics or semantic
          descriptors. This application is intended for education purposes only.
        </TextBlock>

        <TextBlock eyebrow="Data Source">
          The primary data source of this application is CelesTrak which is a
          501(c)(3) non-profit (link: http://www.celestrak.org/). SATMAP7
          sources all of its satellite tracking data from CelesTrak in TLE
          format. Secondary data sources are: NASA Earth Observatory for the
          Earth textures, and Satcat or WikiMedia for satellite or constellation
          specific media.
        </TextBlock>

        <TextBlock eyebrow="Tech Stack">
          SATMAP7 is a Next application that uses React Three Fiber and Three.js
          for the graphics engine, Zustand for global state management, Redis
          for server-side caching, satellite.js for SGP4 propagation, WebGL/GLSL
          for custom shaders, and Tailwind for the HUD UI. SATMAP7 is primarily
          written in Typescript.
        </TextBlock>

        <TextBlock eyebrow="Developer">
          I'm Abiel Kim, a CS graduate (AI specialization) from Simon Fraser
          University. I'm very friendly! Find me at my personal website here:{" "}
          <a href="https://abielkim.vercel.app/">
            https://abielkim.vercel.app/
          </a>
          .
        </TextBlock>
      </div>
    </div>
  );
};

export default AboutPage;
