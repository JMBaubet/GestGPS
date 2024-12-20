
/**
 * Traitement des erreurs des promesses de type fetch(), json()...
 * @param {string} err - message d'erreur de la promesse.
 * @param {object} alarmes - liste des alarmes.
 */
export const traiteCatch = (err, alarmes) => {
  console.error(`${err}`)
  if (`${err}`.includes("Timeout")) {
    // On traite l’erreur du fetch (Time Out)
    if (alarmes.value.findIndex(alarme => alarme.id == 3) === -1) {
      alarmes.value.push({
        id: 3,
        type: 'error',
        text: "Le backend est absent !",
        icon: "mdi-lan-disconnect"
      })
    }
  } else if (`${err}`.includes("SyntaxError: JSON.parse")) {
    // On traite l’erreur du json
    if (alarmes.value.findIndex(alarme => alarme.id == 4) === -1) {
      alarmes.value.push({
        id: 4,
        type: 'error',
        text: `Une réponse JSON est mal formatée !`,
        closable: true,
        icon: "mdi-code-json"
      })
    }
  } else {
    // on traite une erreur inattendue
    if (alarmes.value.findIndex(alarme => alarme.id == 99) === -1) {
      alarmes.value.push({
        id: 4,
        type: 'error',
        text: `Une erreur innatendue est arrivée !`,
        closable: true,
        icon: "mdi-alert-decagram-outline"
      })
    }
  }
}

/**
 * 
 * @param {object} json 
 * @param {object} alarmes 
 */
export const traiteErreur = (json, alarmes) => {
  if (alarmes.value.findIndex(alarme => alarme.id == json.id) === -1) {
    alarmes.value.push({
      id: json.id,
      type: 'error',
      text: json.error,
      closable: true,
      icon: "mdi-alert-box-outline"
    })
  }
}