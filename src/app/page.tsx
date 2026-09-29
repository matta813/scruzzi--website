import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Cursor } from "@/components/Cursor";
import { GridLines } from "@/components/GridLines";
import { Header } from "@/components/Header";
import { Intro } from "@/components/Intro";
import { Operations } from "@/components/Operations";
import { Pipeline } from "@/components/Pipeline";
import { Preloader } from "@/components/Preloader";
import { Projects } from "@/components/Projects";
import { Skills } from "@/components/Skills";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Stats } from "@/components/Stats";

export default function Home() {
  return (
    <>
      <Preloader />
      <SmoothScroll />
      <GridLines />
      <Header />
      <main id="main" className="relative z-10">
        <Intro />
        <Stats />
        <Skills />
        <Projects />
        <Operations />
        <Pipeline />
        <About />
      </main>
      <Contact />
      <Cursor />
    </>
  );
}
