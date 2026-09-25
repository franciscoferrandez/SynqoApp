export function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="brand" href="#contenido">
          Synqo
        </a>
      </header>
      <main id="contenido" tabIndex={-1}>
        <section aria-labelledby="bootstrap-title" className="bootstrap-state">
          <p className="eyebrow">Preparación técnica</p>
          <h1 id="bootstrap-title">Synqo se está preparando</h1>
          <p>
            El espacio de coordinación estará disponible cuando se completen las primeras
            funcionalidades.
          </p>
        </section>
      </main>
    </div>
  );
}
