import { notFound } from "next/navigation";
import { getCompany } from "@/lib/db";
import { positionWarning, scoreInterpretation, scoreTotal } from "@/lib/strategy";
import { CompanyForm, ExportCompanyButton, ResearchForm } from "../parts";

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const company = getCompany(Number(id));
  if (!company) notFound();
  const total = scoreTotal(company.research?.scores);

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">{company.primaryLayer} · {company.tier}</p>
          <h1>{company.ticker} · {company.name}</h1>
          <p className="subtle">{company.thesis || "No thesis recorded yet."}</p>
        </div>
        <div className="button-row">
          <span className={`chip signal-${company.signal}`}>{company.signal}</span>
          <ExportCompanyButton id={company.id} />
        </div>
      </header>

      <section className="grid" style={{ marginBottom: 18 }}>
        <div className="panel metric"><span>Action</span><strong>{company.action}</strong></div>
        <div className="panel metric"><span>Structural score</span><strong>{total}</strong></div>
        <div className="panel metric"><span>Interpretation</span><strong style={{ fontSize: "1rem" }}>{scoreInterpretation(total)}</strong></div>
        <div className="panel metric"><span>Position</span><strong>{company.position ? `${company.position.weight}%` : "None"}</strong></div>
      </section>

      <section className="work-grid">
        <div className="panel">
          <div className="panel-header"><h2>Research note</h2></div>
          <div className="panel-body"><ResearchForm company={company} /></div>
        </div>
        <aside className="panel">
          <div className="panel-header"><h2>Classification</h2></div>
          <div className="panel-body">
            <CompanyForm company={company} />
            {company.position && positionWarning(company.position.weight, company.tier) ? (
              <p className="warning">{positionWarning(company.position.weight, company.tier)}</p>
            ) : null}
          </div>
        </aside>
      </section>
    </>
  );
}

