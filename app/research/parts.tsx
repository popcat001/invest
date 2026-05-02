import { ACTIONS, LAYERS, SCORE_CATEGORIES, SIGNALS, T_TIERS } from "@/lib/constants";
import type { CompanyWithNote } from "@/lib/types";
import { exportCompanyAction, upsertCompanyAction, upsertResearchAction } from "../actions";
import { scoreInterpretation, scoreTotal } from "@/lib/strategy";

export function CompanyForm({ company }: { company?: CompanyWithNote }) {
  return (
    <form action={upsertCompanyAction} className="form-grid">
      <input type="hidden" name="id" value={company?.id ?? ""} />
      <label>Ticker<input name="ticker" defaultValue={company?.ticker ?? ""} required /></label>
      <label>Name<input name="name" defaultValue={company?.name ?? ""} required /></label>
      <label>
        Primary L layer
        <select name="primaryLayer" defaultValue={company?.primaryLayer ?? "L4"}>
          {LAYERS.filter((layer) => layer.id !== "Cash").map((layer) => <option key={layer.id} value={layer.id}>{layer.id} {layer.name}</option>)}
        </select>
      </label>
      <label>
        Secondary L layer
        <select name="secondaryLayer" defaultValue={company?.secondaryLayer ?? ""}>
          <option value="">None</option>
          {LAYERS.filter((layer) => layer.id !== "Cash").map((layer) => <option key={layer.id} value={layer.id}>{layer.id} {layer.name}</option>)}
        </select>
      </label>
      <label>
        T tier
        <select name="tier" defaultValue={company?.tier ?? "T3"}>
          {T_TIERS.map((tier) => <option key={tier.id} value={tier.id}>{tier.id} {tier.name}</option>)}
        </select>
      </label>
      <label>
        Signal
        <select name="signal" defaultValue={company?.signal ?? "Yellow"}>
          {SIGNALS.map((signal) => <option key={signal} value={signal}>{signal}</option>)}
        </select>
      </label>
      <label>
        Action
        <select name="action" defaultValue={company?.action ?? "Watchlist"}>
          {ACTIONS.map((action) => <option key={action} value={action}>{action}</option>)}
        </select>
      </label>
      <label>Next review<input name="nextReviewDate" type="date" defaultValue={company?.nextReviewDate ?? ""} /></label>
      <label className="span-2">One-line thesis<textarea name="thesis" defaultValue={company?.thesis ?? ""} /></label>
      <label className="span-2">Risk summary<textarea name="riskSummary" defaultValue={company?.riskSummary ?? ""} /></label>
      <label className="span-2">Trigger that changes action<textarea name="trigger" defaultValue={company?.trigger ?? ""} /></label>
      <div className="span-2 button-row">
        <button className="primary" type="submit">Save company</button>
      </div>
    </form>
  );
}

export function ResearchForm({ company }: { company: CompanyWithNote }) {
  const research = company.research;
  const total = scoreTotal(research?.scores);
  return (
    <form action={upsertResearchAction} className="form-grid">
      <input type="hidden" name="companyId" value={company.id} />
      <label>Analyst<input name="analyst" defaultValue={research?.analyst ?? ""} /></label>
      <div className="span-2">
        <h3>Structural fit score · {total} · {scoreInterpretation(total)}</h3>
      </div>
      {SCORE_CATEGORIES.map((category) => (
        <label key={category}>
          {category}
          <input name={`score:${category}`} type="number" min="1" max="5" defaultValue={research?.scores?.[category] ?? 3} />
        </label>
      ))}
      {["Revenue drivers", "Margin drivers", "Capital intensity", "Customer adoption", "Competitive position", "Key dependencies"].map((field) => (
        <label className="span-2" key={field}>{field}<textarea name={field} defaultValue={String(research?.businessBreakdown?.[field] ?? "")} /></label>
      ))}
      {["Current valuation", "Growth expectation embedded in price", "What must go right", "What could make the stock cheap", "What could make the stock expensive"].map((field) => (
        <label className="span-2" key={field}>{field}<textarea name={field} defaultValue={String(research?.valuation?.[field] ?? "")} /></label>
      ))}
      {["Hard data", "Market emotion", "Valuation", "Structural evidence"].map((field) => (
        <div className="span-2 form-grid" key={field}>
          <label>{field} state<select name={`${field} state`} defaultValue={String(research?.signals?.[`${field} state`] ?? company.signal)}>{SIGNALS.map((signal) => <option key={signal}>{signal}</option>)}</select></label>
          <label>{field} evidence<textarea name={`${field} evidence`} defaultValue={String(research?.signals?.[`${field} evidence`] ?? "")} /></label>
        </div>
      ))}
      {["Thesis risk", "Valuation risk", "Competition risk", "Execution risk", "Macro or regulatory risk"].map((field) => (
        <label className="span-2" key={field}>{field}<textarea name={field} defaultValue={String(research?.risks?.[field] ?? "")} /></label>
      ))}
      {["Intended role", "Initial size", "Target size", "Max size", "Add triggers", "Trim triggers", "Exit triggers"].map((field) => (
        <label key={field}>{field}<input name={field} defaultValue={String(research?.positionPlan?.[field] ?? "")} /></label>
      ))}
      <label className="span-2">Decision reason<textarea name="decisionReason" defaultValue={research?.decisionReason ?? ""} /></label>
      <div className="span-2 button-row">
        <button className="primary" type="submit">Save research</button>
      </div>
    </form>
  );
}

export function ExportCompanyButton({ id }: { id: number }) {
  return (
    <form action={exportCompanyAction}>
      <input type="hidden" name="id" value={id} />
      <button type="submit">Export Markdown</button>
    </form>
  );
}

