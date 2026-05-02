import { LAYERS } from "@/lib/constants";
import { layerAllocation, listCompanies, listPositions } from "@/lib/db";
import { allocationState, positionWarning, tierMax } from "@/lib/strategy";
import { upsertPositionAction } from "../actions";

export default function PortfolioPage() {
  const companies = listCompanies();
  const positions = listPositions();
  const allocation = layerAllocation();

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Portfolio construction</p>
          <h1>Holdings and layer exposure</h1>
          <p className="subtle">Use position sizes for review discipline. Tactical signals affect sizing and timing, not the structural thesis.</p>
        </div>
      </header>

      <section className="work-grid">
        <div className="panel">
          <div className="panel-header"><h2>Positions</h2></div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ticker</th>
                  <th>Holding</th>
                  <th>Layer</th>
                  <th>Tier</th>
                  <th className="number">Weight</th>
                  <th className="number">T max</th>
                  <th>Warning</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((position) => {
                  const company = companies.find((item) => item.ticker === position.ticker);
                  return (
                    <tr key={position.id}>
                      <td><strong>{position.ticker}</strong></td>
                      <td>{position.holding}</td>
                      <td>{position.isCash ? "Cash" : company?.primaryLayer ?? "Unmapped"}</td>
                      <td>{company?.tier ?? ""}</td>
                      <td className="number">{position.weight.toFixed(1)}%</td>
                      <td className="number">{company ? `${tierMax(company.tier)}%` : ""}</td>
                      <td className="warning">{company ? positionWarning(position.weight, company.tier) : ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <aside className="panel">
          <div className="panel-header"><h2>Add or update position</h2></div>
          <div className="panel-body">
            <form action={upsertPositionAction} className="form-grid">
              <label className="span-2">Company
                <select name="companyId">
                  <option value="">Cash or external</option>
                  {companies.map((company) => <option key={company.id} value={company.id}>{company.ticker} {company.name}</option>)}
                </select>
              </label>
              <label>Ticker<input name="ticker" required /></label>
              <label>Holding<input name="holding" defaultValue="Holding" /></label>
              <label>Weight %<input name="weight" type="number" min="0" step="0.1" /></label>
              <label>Target %<input name="targetSize" type="number" min="0" step="0.1" /></label>
              <label>Max %<input name="maxSize" type="number" min="0" step="0.1" /></label>
              <label><input name="isCash" type="checkbox" /> Cash allocation</label>
              <div className="span-2"><button className="primary" type="submit">Save position</button></div>
            </form>
          </div>
        </aside>
      </section>

      <section className="panel" style={{ marginTop: 18 }}>
        <div className="panel-header"><h2>Layer allocation</h2></div>
        <div className="panel-body">
          {LAYERS.map((layer) => {
            const value = allocation[layer.id] ?? 0;
            return (
              <div className="allocation-row" key={layer.id}>
                <div className="allocation-meta">
                  <span>{layer.id} {layer.name} · target {layer.range[0]}-{layer.range[1]}%</span>
                  <span>{value.toFixed(1)}% · {allocationState(value, layer.id)}</span>
                </div>
                <div className="bar"><span style={{ width: `${Math.min(100, value)}%` }} /></div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

