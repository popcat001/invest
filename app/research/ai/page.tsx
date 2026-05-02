import { AiResearchForm } from "./form";

export default async function AiResearchPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">AI research</p>
          <h1>Generate a company note</h1>
          <p className="subtle">Enter only a company name or ticker, then choose the research engine. The server maps the result into the L/T framework, saves it to SQLite, and opens the completed research record.</p>
        </div>
      </header>

      <section className="work-grid">
        <div className="panel ai-console">
          <div className="panel-header">
            <h2>Research trigger</h2>
          </div>
          <div className="panel-body">
            {error ? <p className="alert">{error}</p> : null}
            <AiResearchForm />
          </div>
        </div>

        <aside className="panel">
          <div className="panel-header">
            <h2>What gets saved</h2>
          </div>
          <div className="panel-body">
            <div className="checklist">
              <p>L layer and T tier</p>
              <p>Signal color and action</p>
              <p>Structural score matrix</p>
              <p>Business, valuation, signal, risk, and position notes</p>
              <p>Source URLs captured inside the research note</p>
            </div>
            <p className="subtle">OpenAI and Codex can use web search when configured. Claude Code depends on your local tool permissions. Current market claims still require review.</p>
          </div>
        </aside>
      </section>
    </>
  );
}
