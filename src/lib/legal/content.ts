export interface LegalSection {
  id: string
  title: string
  paragraphs: string[]
}

export function getLegalSections(appName: string): LegalSection[] {
  const operator = appName.trim() || 'Patiseria Noastră'

  return [
    {
      id: 'terms',
      title: 'Termeni și condiții',
      paragraphs: [
        `Prezentele termeni și condiții guvernează utilizarea aplicației mobile ${operator} și a serviciilor de comandă online oferite prin intermediul acesteia.`,
        'Utilizarea aplicației implică acceptarea acestor termeni. Dacă nu sunteți de acord, vă rugăm să nu utilizați aplicația.',
        'Comenzile plasate prin aplicație constituie oferte de contract. Confirmarea comenzii de către operator (prin notificare în aplicație, email sau SMS) reprezintă acceptarea ofertei și încheierea contractului la distanță, în sensul Ordonanței de urgență nr. 34/2014 privind drepturile consumatorilor în cadrul contractelor încheiate cu profesioniștii.',
        'Prețurile afișate sunt exprimate în RON, includ TVA unde este cazul, și pot fi actualizate. Prețul aplicabil este cel afișat la momentul confirmării comenzii.',
        'Operatorul își rezervă dreptul de a refuza sau anula o comandă în cazuri justificate (stoc epuizat, date incorecte, suspiciune de fraudă etc.), cu informarea clientului și, după caz, rambursarea sumelor achitate.',
        'Produsele alimentare pot avea termene de valabilitate și condiții speciale de păstrare, comunicate la livrare/ridicare. Clientul este responsabil de respectarea acestora după predare.',
      ],
    },
    {
      id: 'privacy',
      title: 'Politica de confidențialitate (GDPR)',
      paragraphs: [
        `Operatorul ${operator} prelucrează datele cu caracter personal în conformitate cu Regulamentul (UE) 2016/679 (GDPR) și Legea nr. 190/2018 privind măsuri de punere în aplicare a GDPR.`,
        'Date prelucrate: nume, email, telefon, adresă de livrare (dacă e cazul), istoric comenzi, mesaje în chat-ul de suport, date tehnice (identificatori de dispozitiv, jurnal de utilizare) strict necesare funcționării aplicației.',
        'Temeiuri legale: executarea contractului (art. 6 alin. (1) lit. b GDPR), obligații legale (lit. c), interes legitim pentru securitate și îmbunătățirea serviciului (lit. f), consimțământ unde este necesar (lit. a) — de ex. marketing, dacă v-ați abonat explicit.',
        'Datele sunt stocate pe durata relației contractuale și ulterior conform termenelor legale de arhivare (de regulă 5–10 ani pentru documente contabile/fiscale, după caz).',
        'Nu vindem datele personale. Putem transmite date către furnizori (găzduire, plăți, curierat, suport IT) care acționează ca împuterniciți, cu contracte conforme art. 28 GDPR.',
        'Aveți dreptul de acces, rectificare, ștergere, restricționare, portabilitate, opoziție și de a nu fi supus unei decizii automate cu efect juridic semnificativ. Pentru exercitarea drepturilor: contactați operatorul prin datele din aplicație sau suport.',
        'Aveți dreptul de a depune plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP), www.dataprotection.ro.',
        'Pentru securitate, folosim conexiuni criptate și măsuri tehnice și organizatorice rezonabile; niciun sistem nu este însă 100% sigur.',
      ],
    },
    {
      id: 'cookies',
      title: 'Politica privind cookie-urile și tehnologiile similare',
      paragraphs: [
        'Aplicația mobilă poate utiliza stocare locală pe dispozitiv (ex. token de autentificare, preferințe, coș) necesară funcționării — echivalentul strict necesar al cookie-urilor pe web.',
        'Nu folosim tracking publicitar invaziv fără consimțământ. Dacă integrăm analiză de utilizare, vă vom informa și vom solicita consimțământul unde legea o impune.',
        'Puteți șterge datele aplicației dezinstalând aplicația sau resetând datele din setările telefonului; sesiunea de autentificare poate fi încheiată din Meniu → Deconectare.',
      ],
    },
    {
      id: 'consumer',
      title: 'Informații pentru consumatori',
      paragraphs: [
        'În calitate de consumator, beneficiați de drepturile prevăzute de Legea nr. 296/2004 (Codul consumului) și de OUG nr. 34/2014.',
        'Pentru contractele la distanță, aveți dreptul de retragere în 14 zile calendaristice de la primirea produselor, cu excepțiile legale (inclusiv produse alimentare perisabile, preparate la comandă, sigilate și desigilate după livrare etc. — art. 16 lit. c, m din OUG 34/2014).',
        'Pentru produse neconforme, puteți solicita remedierea conform garanțiilor legale și contractuale. Reclamațiile se pot transmite prin suportul din aplicație sau la datele de contact ale operatorului.',
        'Autoritatea competentă pentru soluționarea alternativă a litigiilor: Autoritatea Națională pentru Protecția Consumatorilor (ANPC), www.anpc.ro, tel. 021 9551.',
        'Platforma europeană ODR (soluționare online litigii): https://ec.europa.eu/consumers/odr',
      ],
    },
    {
      id: 'contact',
      title: 'Contact operator',
      paragraphs: [
        `Denumire comercială: ${operator}.`,
        'Pentru întrebări legale, confidențialitate sau exercitarea drepturilor GDPR, utilizați secțiunea Suport din aplicație sau datele de contact afișate pe site-ul oficial al operatorului (dacă este disponibil).',
        'Ultima actualizare a documentelor legale: mai 2026. Operatorul poate actualiza aceste informații; versiunea aplicabilă este cea publicată în aplicație.',
      ],
    },
  ]
}
