// Wrapper condiviso per creare un client Turso (libSQL). Usato sia da
// api/_milestones-db.js che da api/_trips-db.js, per non duplicare
// questa stessa funzione in entrambi i moduli.

import { createClient } from "@libsql/client";

export function makeClient(url, authToken) {
  return createClient({ url, authToken });
}
