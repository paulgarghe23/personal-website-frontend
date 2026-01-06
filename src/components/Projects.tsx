import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Github, PanelRightOpen } from "lucide-react";

const Projects = () => {
  const projects = [
    {
      title: "Paul's AI Web Agent V2",
      description:
        "Enhanced AI web agent built with LangGraph, LangChain, and Vertex AI. Deployed on Google Cloud Run with CI/CD pipelines, featuring intelligent Q&A capabilities and contact form integration.",
      tags: ["Python", "LangGraph", "LangChain", "Vertex AI", "FastAPI", "GCP", "Cloud Run"],
      github: "https://github.com/paulgarghe23/web-agent-backend-v2-gcp",
      diagramUrl: "/docs/functional-architecture.html",
      diagramLabel: "Functional Diagram",
    },
    {
      title: "Paul's AI Web Agent",
      description:
        "AI-powered web agent built with FastAPI and RAG for intelligent profile and projects Q&A using OpenAI embeddings.",
      tags: ["Python", "FastAPI", "RAG", "OpenAI", "AI"],
      github: "https://github.com/paulgarghe23/web-agent-backend-v1",
    },
    {
      title: "Identity Forge Page",
      description:
        "Personal website built with React, Tailwind and Vercel.",
      tags: ["React", "Vite", "Tailwind", "Vercel"],
      github: "https://github.com/paulgarghe23/personal-website-frontend",
    },
    {
      title: "Zepp Data LLM Analysis",
      description:
        "Python-based data pipeline that extracts sleep data from Zepp/Mi Fit, exports it to CSV, and generates weekly AI reports.",
      tags: ["Python", "API", "Automation", "LLM"],
      github: "https://github.com/paulgarghe23/zepp-sleep-llm-analysis",
    },
  ];

  return (
    <section id="projects" className="py-32 bg-secondary">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-20 animate-fade-in">
          <h2 className="text-5xl md:text-6xl font-serif font-semibold mb-6 text-foreground">
            Recent Projects
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            
          </p>
        </div>

        <div className="flex flex-col gap-10">
          {projects.map((project, index) => (
            <Card
              key={index}
              className="border border-border/50 shadow-elegant hover:shadow-lift transition-smooth hover:-translate-y-1 group bg-card"
            >
              <CardHeader className="pb-4 pt-8 px-8">
                <CardTitle className="text-2xl font-serif font-semibold group-hover:text-accent transition-smooth mb-3">
                  {project.title}
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground leading-relaxed">
                  {project.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="px-8 pb-8">
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-3 py-1 text-sm rounded-full bg-secondary text-secondary-foreground border border-border/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 hover:bg-accent/10"
                    asChild
                  >
                    <a href={project.github} target="_blank" rel="noopener noreferrer">
                      <Github size={16} /> View Project
                    </a>
                  </Button>

                  {project.diagramUrl && (
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button size="sm" variant="outline" className="gap-2 hover:bg-accent/10">
                          <PanelRightOpen size={16} /> {project.diagramLabel || "View Diagram"}
                        </Button>
                      </SheetTrigger>
                      <SheetContent
                        side="right"
                        className="w-full sm:max-w-5xl p-0 border-l bg-card flex flex-col"
                        aria-label={project.diagramLabel || "Diagram"}
                      >
                        <div className="flex items-center justify-between border-b px-6 py-4">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Diagram</p>
                            <p className="text-base font-semibold text-foreground">{project.title}</p>
                          </div>
                        </div>
                        <div className="flex-1 bg-muted flex justify-center items-start">
                          <div className="h-[90vh] w-full max-w-[1400px] overflow-auto px-2 py-2">
                            <iframe
                              src={project.diagramUrl}
                              title={project.diagramLabel || "Functional diagram"}
                              className="h-full w-full border-0 scale-[0.88] origin-top"
                              loading="lazy"
                            />
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;