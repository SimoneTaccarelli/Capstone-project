import { Container } from "react-bootstrap";

const PrivacyAndPolicy = () => {
  return (
    <Container className="privacy-policy my-4">
      <h1 className="text-center mb-4">🛡️ Privacy & Policy — Itoko no Lab</h1>

      <section className="mb-4">
        <h3>1. Raccolta delle informazioni</h3>
        <p>
          <strong>Itoko no Lab</strong> è un sito vetrina. Non vengono effettuati acquisti direttamente tramite la piattaforma, quindi non raccogliamo informazioni sensibili come indirizzi di spedizione o dati di pagamento.
        </p>
        <p>
          L’unica informazione che potremmo raccogliere è l’indirizzo email dell’utente, qualora venga fornito volontariamente per richieste o contatti tramite moduli presenti sul sito.
        </p>
      </section>

      <section className="mb-4">
        <h3>2. Utilizzo dei dati</h3>
        <p>
          Eventuali dati raccolti (come l’email) verranno utilizzati esclusivamente per rispondere alle richieste dell’utente.  
          Non inviamo newsletter né condividiamo informazioni con terze parti.
        </p>
      </section>

      <section className="mb-4">
        <h3>3. Sicurezza</h3>
        <p>
          Qualsiasi informazione eventualmente fornita è trattata in modo sicuro e non sarà mai ceduta a soggetti esterni.
        </p>
      </section>

      <section className="mb-4">
        <h3>4. Cambi e resi</h3>
        <p>
          Tutti i nostri prodotti sono realizzati su richiesta. Per questo motivo, non accettiamo cambi o resi, salvo in casi eccezionali di merce danneggiata.  
          Ti invitiamo a contattarci entro <strong>48 ore</strong> dalla ricezione del prodotto in caso di problemi.
        </p>
      </section>

      <section className="mb-4">
        <h3>5. Modifiche alla policy</h3>
        <p>
          Ci riserviamo il diritto di aggiornare questa pagina in qualsiasi momento.  
          Le modifiche saranno comunicate pubblicando la versione aggiornata sul sito.
        </p>
      </section>

      <footer className="text-center mt-4">
        <p><em>Ultimo aggiornamento: 23/05/2025</em></p>
      </footer>
    </Container>
  );
};

export default PrivacyAndPolicy;