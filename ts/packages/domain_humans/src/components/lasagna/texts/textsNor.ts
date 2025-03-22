import { NodeNameType } from '../classes';


export const nodeDescriptions: Record<NodeNameType, string> = {
    AI: 'Bygget rundt en kraftig, reflekterende GPT-lignende LLM, som OpenAIs o3, er AI-en forhåndskonfigurert til å bruke sine parametriske kapasiteter til å samarbeide med mennesker og verktøy for legemiddelutvikling rettet mot en spesifikk sykdom. Ved å utnytte OpenAIs strukturert-utdata-funksjon kan AI-en direkte generere kandidater i formatene som kreves av de respektive verktøyene.',
    Humans: 'Mennesker samhandler med prosessen via et nettgrensesnitt. Et menneske i loopen vil vanligvis være en ekspert på den aktuelle sykdommen.',
    Tools: 'Verktøy innebærer spesialiserte verktøy som støtter legemiddelutviklingsprosessen gjennom molekylær docking, molekylær dynamikk, kvantemekaniske frie energiberegninger og mer. Disse verktøyene, ofte Python-baserte (f.eks. AutoDock Vina, Schrödinger Suite), tester kandidatens evne til å binde seg til målstrukturer, vanligvis proteiner.',
    Data: 'Data er en filmappe som deles mellom mennesker, verktøy og AI-en. Det er her ankre, mål, kandidater mv. lagres og hentes.',
    Meta: 'Meta registrerer AI-ens interne tilstand og fungerer som en detaljert logg over hvert steg den tar, slik at den kan reflektere over sin egen atferd.',
    MetaInternal: 'Meta registrerer AI-ens interne tilstand og fungerer som en detaljert logg over hvert steg den tar, slik at den kan reflektere over sin egen atferd.',
    Standin: '',
};

export const resourceDescriptions: Record<string, string> = {
    'anchor.pdb': 'En anker fungerer som et utgangspunkt for legemiddelutviklingsprosessen. Et anker er vanligvis et eksisterende, men suboptimalt legemiddel (også kjent som et ligand) for den aktuelle sykdommen. Ankrene er representert som .pdb (Protein Data Bank)-filer eller SMILES-strenger, begge brukt til å beskrive molekylstrukturer. Ankre som vil bli forsøkt med tanke på Lewy Body Demens er tyrosinhydroksylasehemmere som Imatinib og Nilotinib. Sistnevnte har gitt lovende testresultater mot denne sykdommen, men virkestoffet trenger i for liten grad inn i hjernen. Kanskje er det en forandring i designet på dette legemiddelet som skal til? (google "Georgetown University + Lewy Body + Nilotinib" for mer informasjon).',
    'target.pdb': 'Målet er et protein som er kjent for å spille en rolle i sykdommen. AI-en bruker ankeret til å generere en kandidat som er antatt å binde seg til målet. Med tanke på Lewy Body demens er det proteinet c-Abl som er det naturlige målet. Dette fordi det fosforylerer (kjemisk prosess) det sykdomsfremkallende alfa-synuklein proteinet, hvilket får sistnevnte til å klumpe seg sammen i hjernen i såkalte Lewy legemer.',
    'candidate.pdb': 'Kandidaten er et molekyl som genereres av AI-en basert på ankeret og målet. Kandidaten er antatt å binde seg til målet og har potensial til å utvikles til et legemiddel mot sykdommen.',
    'simulationResults.xyz': 'Dette er resultatet av en simulering som tester kandidatens evne til å binde seg til målet. .xyz indikerer at resultatene består av filer i forskjellige filformater.',
    'paper.txt': 'En akademisk artikkel som dokumenterer agentens resonnement, simuleringsprosessen og resultater, samt gir forslag til videre handling eller fremtidig forskning.',
};

export const pathDescriptions: Record<number, string> = {
    0: 'Bruk knappene nedenfor for å navigere gjennom en typisk iterasjon av prosessen.',
    1: 'Et menneske laster opp et anker og et mål.',
    2: 'AI-en henter ankeret og målet.',
    3: 'AI-en konstruerer en kandidat.',
    4: 'AutoDock Vina henter kandidaten og målet.',
    5: 'AutoDock Vina simulerer interaksjonene mellom kandidaten og målet.',
    6: 'AI-en henter simuleringsresultatene.',
    7: 'Hvis resultatene er lovende, skriver AI-en en artikkel.',
    8: 'Mennesket leser artikkelen.',
    9: 'Mennesket diskuterer artikkelen med AI-en og vurderer laboratorietester eller nye runder med simulering.',
};
