export default function SettingsPage() {
  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Settings</p>
          <h1>Data provider placeholder</h1>
          <p className="subtle">V1 keeps market data manual. This page documents the disabled integration slot for a future price, news, or earnings provider.</p>
        </div>
      </header>

      <section className="panel">
        <div className="panel-header"><h2>Market data</h2></div>
        <div className="panel-body">
          <div className="grid">
            <div>
              <h3>Status</h3>
              <p className="subtle">Disabled</p>
            </div>
            <div>
              <h3>Provider</h3>
              <p className="subtle">Not configured</p>
            </div>
            <div>
              <h3>Current-source rule</h3>
              <p className="subtle">Verify prices, financials, earnings dates, estimates, laws, and news with current sources before making claims.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

