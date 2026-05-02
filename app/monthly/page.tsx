import { CalendarPlus } from "lucide-react";
import { LAYERS } from "@/lib/constants";
import { listMonthlyReviews } from "@/lib/db";
import { createMonthlyReviewAction, exportMonthlyReviewAction } from "../actions";

export default function MonthlyPage() {
  const reviews = listMonthlyReviews();
  const defaultMonth = new Date().toISOString().slice(0, 7);

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Monthly review</p>
          <h1>Portfolio review snapshots</h1>
          <p className="subtle">Create a point-in-time snapshot from current holdings, layer allocation, signal state, and action posture.</p>
        </div>
      </header>

      <section className="work-grid">
        <div className="panel">
          <div className="panel-header"><h2>Review history</h2></div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Reviewer</th>
                  <th className="number">Portfolio value</th>
                  <th className="number">Cash</th>
                  <th className="number">Net exposure</th>
                  <th>Export</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review.id}>
                    <td><strong>{review.month}</strong></td>
                    <td>{review.reviewer}</td>
                    <td className="number">{review.portfolioValue.toLocaleString()}</td>
                    <td className="number">{review.cashPercentage.toFixed(1)}%</td>
                    <td className="number">{review.netExposure.toFixed(1)}%</td>
                    <td>
                      <form action={exportMonthlyReviewAction}>
                        <input type="hidden" name="id" value={review.id} />
                        <button type="submit">Export</button>
                      </form>
                    </td>
                  </tr>
                ))}
                {!reviews.length && <tr><td colSpan={6}>No monthly reviews yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="panel">
          <div className="panel-header"><h2>Create snapshot</h2></div>
          <div className="panel-body">
            <form action={createMonthlyReviewAction} className="form-grid">
              <label className="span-2">Month<input name="month" type="month" defaultValue={defaultMonth} /></label>
              <label className="span-2">Reviewer<input name="reviewer" /></label>
              <label className="span-2">Portfolio value<input name="portfolioValue" type="number" min="0" step="0.01" /></label>
              <label className="span-2">Major market events<textarea name="majorEvents" /></label>
              <div className="span-2">
                <button className="primary" type="submit"><CalendarPlus size={16} /> Create or refresh</button>
              </div>
            </form>
          </div>
        </aside>
      </section>

      <section className="panel" style={{ marginTop: 18 }}>
        <div className="panel-header"><h2>Review checklist</h2></div>
        <div className="panel-body grid">
          {LAYERS.map((layer) => (
            <div key={layer.id}>
              <h3>{layer.id} {layer.name}</h3>
              <p className="subtle">Target {layer.range[0]}-{layer.range[1]}%. {layer.role}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

