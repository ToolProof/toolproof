import { runRemoteGraph as runGrafumilo } from './testClients/clientGrafumilo.js';
import { runRemoteGraph as runLigandokreado } from './testClients/clientLigandokreado.js';

if (process.env.NODE_ENV === 'grafumilo') {
    runGrafumilo();
} else {
    runLigandokreado();
}