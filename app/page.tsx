import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { LAYERS, SIGNALS } from "@/lib/constants";
import { layerAllocation, listCompanies, listMonthlyReviews, listPositions } from "@/lib/db";
import { allocationState, positionWarning, scoreTotal } from "@/lib/strategy";

export default function DashboardPage() {
  const companies = listCompanies();
  const positions = listPositions();
  const allocation = layerAllocation();
  const reviews = listMonthlyReviews();
  const reviewQueue = companies.filter((company) => company.nextReviewDate).slice(0, 6);
  const warnings = companies.filter((company) => company.position && positionWarning(company.position.weight, company.tier));

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Research workstation</p>
          <h1>L/T portfolio command surface</h1>
          <p className="subtle">Manage company research, signal posture, layer allocation, and monthly reviews from one repo-local dashboard.</p>
        </div>
        <Link href="/research/new" className="button primary">
          New company <ArrowUpRight size={16} />
        </Link>
      </header>

      <section className="grid" aria-label="Portfolio metrics">
        <div className="panel metric">
          <span>Companies</span>
          <strong>{companies.length}</strong>
        </div>
        <div className="panel metric">
          <span>Positions</span>
          <strong>{positions.filter((item) => !item.isCash).length}</strong>
        </div>
        <div className="panel metric">
          <span>Cash</span>
          <strong>{allocation.Cash.toFixed(1)}%</strong>
        </div>
        <div className="panel metric">
          <span>Monthly reviews</span>
          <strong>{reviews.length}</strong>
        </div>
      </section>

      <section className="work-grid" style={{ marginTop: 18 }}>
        <div className="panel">
          <div className="panel-header">
            <h2>Research book</h2>
            <Link className="button" href="/research">Open</Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ticker</th>
                  <th>Layer</th>
                  <th>Tier</th>
                  <th>Signal</th>
                  <th>Action</th>
                  <th className="number">Score</th>
                </tr>
              </thead>
              <tbody>
                {companies.slice(0, 8).map((company) => (
                  <tr key={company.id}>
                    <td><Link href={`/research/${company.id}`}><strong>{company.ticker}</strong> {company.name}</Link></td>
                    <td>{company.primaryLayer}</td>
                    <td>{company.tier}</td>
                    <td><span className={`chip signal-${company.signal}`}>{company.signal}</span></td>
                    <td>{company.action}</td>
                    <td className="number">{scoreTotal(company.research?.scores)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="panel">
          <div className="panel-header">
            <h2>Layer allocation</h2>
          </div>
          <div className="panel-body">
            {LAYERS.map((layer) => {
              const value = allocation[layer.id] ?? 0;
              return (
                <div className="allocation-row" key={layer.id}>
                  <div className="allocation-meta">
                    <span>{layer.id} {layer.name}</span>
                    <span>{value.toFixed(1)}% · {allocationState(value, layer.id)}</span>
                  </div>
                  <div className="bar"><span style={{ width: `${Math.min(100, value)}%` }} /></div>
                </div>
              );
            })}
          </div>
        </aside>
      </section>

      <section className="grid" style={{ marginTop: 18 }}>
        <div className="panel">
          <div className="panel-header"><h2>Signals</h2></div>
          <div className="panel-body button-row">
            {SIGNALS.map((signal) => (
              <span className={`chip signal-${signal}`} key={signal}>{signal}: {companies.filter((company) => company.signal === signal).length}</span>
            ))}
          </div>
        </div>
        <div className="panel">
          <div className="panel-header"><h2>Size warnings</h2></div>
          <div className="panel-body">
            {warnings.length ? warnings.map((company) => (
              <p key={company.id} className="warning">{company.ticker}: {positionWarning(company.position?.weight ?? 0, company.tier)}</p>
            )) : <p className="subtle">No T-tier max-size warnings.</p>}
          </div>
        </div>
        <div className="panel">
          <div className="panel-header"><h2>Review queue</h2></div>
          <div className="panel-body">
            {reviewQueue.length ? reviewQueue.map((company) => (
              <p key={company.id}><strong>{company.ticker}</strong> · {company.nextReviewDate}</p>
            )) : <p className="subtle">No dated review items yet.</p>}
          </div>
        </div>
      </section>
    </>
  );
}

