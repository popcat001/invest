import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { listCompanies } from "@/lib/db";
import { scoreInterpretation, scoreTotal } from "@/lib/strategy";

export default function ResearchPage() {
  const companies = listCompanies();

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Research manager</p>
          <h1>Company research</h1>
          <p className="subtle">Track L/T classification, signal color, structural score, action, and trigger discipline.</p>
        </div>
        <div className="button-row">
          <Link href="/research/ai" className="button primary"><Sparkles size={16} /> AI research</Link>
          <Link href="/research/new" className="button"><Plus size={16} /> New company</Link>
        </div>
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
                <th>Action</th>
                <th className="number">Score</th>
                <th>Interpretation</th>
                <th>Next review</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => {
                const total = scoreTotal(company.research?.scores);
                return (
                  <tr key={company.id}>
                    <td><Link href={`/research/${company.id}`}><strong>{company.ticker}</strong> {company.name}</Link></td>
                    <td>{company.primaryLayer}</td>
                    <td>{company.tier}</td>
                    <td><span className={`chip signal-${company.signal}`}>{company.signal}</span></td>
                    <td>{company.action}</td>
                    <td className="number">{total}</td>
                    <td>{scoreInterpretation(total)}</td>
                    <td>{company.nextReviewDate || "Unscheduled"}</td>
                  </tr>
                );
              })}
              {!companies.length && (
                <tr>
                  <td colSpan={8}>No research records yet. Start with a company thesis and L/T classification.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
