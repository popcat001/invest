import Link from "next/link";
import { listCompanies } from "@/lib/db";

export default function WatchlistPage() {
  const companies = listCompanies().filter((company) => company.action === "Watchlist" || !company.position);

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Watchlist</p>
          <h1>Ideas waiting for evidence</h1>
          <p className="subtle">Track the required trigger before action. A watchlist item has no position until thesis, valuation, and signal state support it.</p>
        </div>
        <Link href="/research/new" className="button primary">New idea</Link>
      </header>

      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>L layer</th>
                <th>T tier</th>
                <th>Signal</th>
                <th>Required trigger</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id}>
                  <td><Link href={`/research/${company.id}`}><strong>{company.ticker}</strong> {company.name}</Link></td>
                  <td>{company.primaryLayer}</td>
                  <td>{company.tier}</td>
                  <td><span className={`chip signal-${company.signal}`}>{company.signal}</span></td>
                  <td>{company.trigger || "Define before action."}</td>
                </tr>
              ))}
              {!companies.length && <tr><td colSpan={5}>No watchlist items.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

