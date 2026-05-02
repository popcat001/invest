import { ACTIONS, LAYERS, SIGNALS, T_TIERS } from "@/lib/constants";

const references = [
  {
    title: "Five-layer capital allocation",
    file: "l-dimension-five-layer-capital-allocation.png",
    note: "Defines where AI capital flows and how portfolio exposure should be checked."
  },
  {
    title: "L/T layer-tier map",
    file: "lxt-strategy-model-layer-tier-map.png",
    note: "Connects structural layer classification with tactical operating posture."
  },
  {
    title: "Signal traffic lights",
    file: "rewired-signal-rules-traffic-lights.png",
    note: "Turns data, emotion, valuation, and structural evidence into action discipline."
  }
];

const flow = [
  "Classify where value is captured in the AI economy.",
  "Choose how aggressively to operate the idea.",
  "Score structural fit and evidence quality.",
  "Read signal color for timing and sizing.",
  "Take one action with a trigger that would change it."
];

export default function ReferencePage() {
  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Framework reference</p>
          <h1>Logic behind the strategy</h1>
          <p className="subtle">A compact guide to the L/T model, five-layer allocation, and signal-light rules used by research notes, AI generation, portfolio views, and monthly reviews.</p>
        </div>
      </header>

      <section className="reference-flow" aria-label="Strategy workflow">
        {flow.map((step, index) => (
          <div className="flow-step" key={step}>
            <span>{index + 1}</span>
            <p>{step}</p>
          </div>
        ))}
      </section>

      <section className="work-grid" style={{ marginTop: 18 }}>
        <div className="panel">
          <div className="panel-header"><h2>L dimension: where capital goes</h2></div>
          <div className="panel-body layer-stack">
            {LAYERS.filter((layer) => layer.id !== "Cash").map((layer) => (
              <div className="layer-card" key={layer.id}>
                <div>
                  <strong>{layer.id}</strong>
                  <h3>{layer.name}</h3>
                  <p>{layer.role}</p>
                </div>
                <span>{layer.range[0]}-{layer.range[1]}%</span>
              </div>
            ))}
          </div>
        </div>

        <aside className="panel">
          <div className="panel-header"><h2>T dimension</h2></div>
          <div className="panel-body tier-list">
            {T_TIERS.map((tier) => (
              <div key={tier.id}>
                <strong>{tier.id}</strong>
                <span>{tier.name}</span>
                <small>Max {tier.max}%</small>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="panel" style={{ marginTop: 18 }}>
        <div className="panel-header"><h2>Signal-to-action operating rule</h2></div>
        <div className="panel-body signal-board">
          {SIGNALS.map((signal) => (
            <div className={`signal-card signal-${signal}`} key={signal}>
              <strong>{signal}</strong>
              <p>{signalCopy(signal)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="panel" style={{ marginTop: 18 }}>
        <div className="panel-header"><h2>Allowed action vocabulary</h2></div>
        <div className="panel-body button-row">
          {ACTIONS.map((action) => <span className="chip" key={action}>{action}</span>)}
        </div>
      </section>

      <section className="reference-grid" style={{ marginTop: 18 }}>
        {references.map((reference) => (
          <article className="panel reference-image-card" key={reference.file}>
            <div className="panel-header">
              <h2>{reference.title}</h2>
            </div>
            <div className="reference-image-wrap">
              <img src={`/reference-assets/${reference.file}`} alt={reference.title} />
            </div>
            <div className="panel-body">
              <p className="subtle">{reference.note}</p>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}

function signalCopy(signal: string) {
  if (signal === "Green") return "Add in stages or hold full target when valuation is acceptable.";
  if (signal === "Yellow") return "Hold, add slowly, or wait for confirmation.";
  if (signal === "Orange") return "Pause adds, trim tactical exposure, and tighten review.";
  return "Exit, reduce, or move to watchlist when thesis damage dominates.";
}
