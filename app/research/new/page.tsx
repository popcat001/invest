import { CompanyForm } from "../parts";

export default function NewResearchPage() {
  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">New research</p>
          <h1>Create company record</h1>
          <p className="subtle">Start with classification and operating posture; detailed research opens after save.</p>
        </div>
      </header>
      <div className="panel">
        <div className="panel-body">
          <CompanyForm />
        </div>
      </div>
    </>
  );
}

