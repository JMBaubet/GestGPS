import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import * as dotenv from 'dotenv'
import os from 'os'
import fs from 'fs'
import path from 'path'

import { decodeTraceGpx } from './src/scripts/gpx.js'
import { getTraceurs, getTraceur, getIdTraceur } from './src/scripts/traceurs.js'
import { getVilles, getVille } from './src/scripts/villes.js'
import { getCircuits, getCircuit, getcircuitsMinMax } from './src/scripts/circuits.js'
import { delDataCircuit } from './src/scripts/dataCircuit.js'
import { delCircuit2dataModel, majEvt2dataModel, majVisu2dataModel, majTraceur2dataModel } from './src/scripts/dataModel.js'
import { getLineString } from './src/scripts/circuits.js'
import { getVisu } from './src/scripts/3DFiles.js'
import { saveVisu } from './src/scripts/visu.js'
import { getEvt, saveEvt, getVignettes } from './src/scripts/evt.js'

const app = express()
dotenv.config()
const port = process.env.PORT

// Configuration de cors pour autoriser les requette
// Depuis localhost:3000 le front end
const allowedOrigins = [ 'http://localhost:3000' ];
const options = cors.CorsOptions = {
  origin: allowedOrigins
};
app.use(cors(options))
app.use(morgan('tiny'))
app.use(express.json({ limit: '5mb' }))

const directory = os.homedir() + "\\downloads"

//definition des points de terminaison

// Test :
// - de la présence du serveur
// - de fichiers *.gpx dans ~/Downloads
// - de fichiers *.fit dans ~/Downloads (Pour la version 3)
app.get('/api/isRunning/', (req, res) => {
  fs.promises.readdir(directory)
    .then(filesDir => {
      const gpxFiles = filesDir.filter(el => path.extname(el) === '.gpx')
      const fitFiles = filesDir.filter(el => path.extname(el) === '.fit')
      res.setHeader('Content-Type', 'application/json')
      res.status(200).send({ gpx: `${gpxFiles.length}`, fit: `${fitFiles.length}` })
    })
    .catch(err => {
      res.setHeader('Content-Type', 'application/json');
      res.status(500).send({ id: 1000, error: `${directory} indisponible !` })
    })

})

// Obtention de la liste des fichiers *.gpx présents dans downloads.
app.get('/api/GpxFiles/', (req, res) => {
  fs.promises.readdir(directory)
    .then(filesDir => {
      const gpxFiles = filesDir.filter(el => path.extname(el) === '.gpx')
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(gpxFiles)
    })
    .catch(err => {
      res.setHeader('Content-Type', 'application/json');
      res.status(500).send({ id: 1001, error: `Le dossier ${directory} n'a pas été trouvé !` })
    })
})


// Obtention d'un fichier lineString
app.get('/api/lineString/:id', (req, res) => {
  getLineString(`${req.params.id}`)
    .then(retour => {
      res.setHeader('Content-Type', 'application/json')
      res.status(200)
      res.send(retour)

    })
    .catch((err) => {
      res.setHeader('Content-Type', 'application/json');
      res.status(500).send({ id: 1001, error: `Le Fichier ${req.params.id}/lineString n'a pas été trouvé !` })
    })
})

// Ajout d'un fichier gpx
app.post('/api/GpxFile/:fileName/:traceur', (req, res) => {
  // console.log(`backend.js : Traceur sélectionné : ${req.params.traceur}?, fichier : ${req.params.fileName}`)
  decodeTraceGpx(`${directory}\\${req.params.fileName}`, `${req.params.traceur}`)
    .then(retour => {
      // console.log(`backend.js : Retour de la promise : ${retour.circuitId}, ${retour.peutEtrePresent}`)

      res.setHeader('Content-Type', 'application/json')
      res.status(200)
      if (retour.circuitId === 0) {
        res.send({ gpx: "Present" })
      } else if (retour.isPresent) {
        res.send({ gpx: "Semblable" })
      } else {
        res.send({ gpx: "OK" })
      }
    })
    .catch(err => {
      console.error(`backend.js : ${err.id}`)
      res.setHeader('Content-Type', 'application/json');
      //res.status(500).send({ id: 1010, error: `Le fichier ${req.params.fileName} n'a pas pu être traité !` })
      res.status(500).send(err)
    })
})

// suppession d'un fichier gpx
app.delete('/api/GpxFile/:id', (req, res) => {
  //console.log(`backend.js : id circuit : ${req.params.id}`)
  delDataCircuit(req.params.id)
    .then((ret) => {
      delCircuit2dataModel(req.params.id)
        .then((ret) => {
          // console.log(`backend.js : Retour de la promise : OK`)

          res.setHeader('Content-Type', 'application/json')
          res.status(200)
          res.send({ del: "OK" })
        })
        .catch((err) => {
          console.error(`backend.js : ${err.id}`)
          res.setHeader('Content-Type', 'application/json');
          res.status(500).send(err)
        })
    })
    .catch((err) => {
      console.error(`backend.js : ${err.id}`)
      res.setHeader('Content-Type', 'application/json');
      res.status(500).send(err)
    })
})



// récupération des circuits à afficher
app.get('/api/circuits/:page/:nombre/:ville/:traceur/:distances/:deniveles', (req, res) => {
  // console.table(req.params)
  getCircuits(req.params)
    .then(data => {
      res.setHeader('Content-Type', 'application/json')
      res.status(200).send(data)
    })
    .catch(err => {
      console.error(`Erreur : ${err}`)
      res.setHeader('Content-Type', 'application/json');
      res.status(500).send({ id: 1020, error: `Les circuits ne peuvent être récupérés !` })
    })
})

// récupération des circuits à afficher
app.get('/api/circuit/:id', (req, res) => {
  // console.table(req.params)
  getCircuit(req.params.id)
    .then(data => {
      res.setHeader('Content-Type', 'application/json')
      res.status(200).send(data)
    })
    .catch(err => {
      console.error(`Erreur : ${err}`)
      res.setHeader('Content-Type', 'application/json');
      res.status(500).send({ id: 9999, error: `Les informations du circuit ne peuvent être récupérées !` })
    })
})



// récupération des min max 
app.get('/api/circuitsMinMax/', (req, res) => {
  getcircuitsMinMax()
    .then(data => {
      res.setHeader('Content-Type', 'application/json')
      res.status(200).send(data)
    })
    .catch(err => {
      console.error(`Erreur : ${err}`)
      res.setHeader('Content-Type', 'application/json');
      res.status(500).send({ id: 1050, error: `Les min & Max ne peuvent être récupérés !` })
    })
})


// Récupération de la liste des traceurs connus dans dataModel.json
app.get('/api/traceurs/', (req, res) => {
  getTraceurs()
    .then(listeTraceurs => {
      res.setHeader('Content-Type', 'application/json')
      res.status(200).send(listeTraceurs)
    })
    .catch(err => {
      console.error(`Erreur : ${err}`)
      res.setHeader('Content-Type', 'application/json');
      res.status(500).send({ id: 1030, error: `La liste des traceurs ne peut être récupérée !` })
    })
})

// Récupération du nom du traceurs à partir de son id
app.get('/api/traceur/:id', (req, res) => {
  getTraceur(req.params.id)
    .then(traceur => {
      res.setHeader('Content-Type', 'application/json')
      res.status(200).send(traceur)
    })
    .catch(err => {
      console.error(`Erreur : ${err}`)
      res.setHeader('Content-Type', 'application/json');
      res.status(500).send({ id: 1030, error: `La liste des traceurs ne peut être récupérée !` })
    })
})

// Mise a jour du traceur à partir de son nom
app.post('/api/traceur/:id/:traceur', (req, res) => {
  getIdTraceur(req.params.traceur)
    .then(traceur => {
      // console.log(traceur.id)
      majTraceur2dataModel(req.params.id, traceur.id)
        .then(() => {
          res.setHeader('Content-Type', 'application/json')
          res.status(200).send(`{"status": "OK"}`)
        })
        .catch(err => {
          console.error(`Erreur : ${err}`)
          res.setHeader('Content-Type', 'application/json');
          res.status(500).send({ id: 9999, error: `L'id du traceur n'a pas été mis à jour !` })
        })

    })
    .catch(err => {
      console.error(`Erreur : ${err}`)
      res.setHeader('Content-Type', 'application/json');
      res.status(500).send({ id: 9999, error: `L'id du traceur ne peut être récupéré !` })
    })
})



// Récupération de la liste des villes de départ connus dans dataModel.json
app.get('/api/villes/', (req, res) => {
  getVilles()
    .then(listeVilles => {
      res.setHeader('Content-Type', 'application/json')
      res.status(200).send(listeVilles)
    })
    .catch(err => {
      console.error(`Erreur : ${err}`)
      res.setHeader('Content-Type', 'application/json');
      res.status(500).send({ id: 1040, error: `La liste des villes de départ ne peut être récupérée !` })
    })
})

// Récupération du nom de la ville à partir de son id
app.get('/api/ville/:id', (req, res) => {
  getVille(req.params.id)
    .then(ville => {
      res.setHeader('Content-Type', 'application/json')
      res.status(200).send(ville)
    })
    .catch(err => {
      console.error(`Erreur : ${err}`)
      res.setHeader('Content-Type', 'application/json');
      res.status(500).send({ id: 1040, error: `La liste des villes de départ ne peut être récupérée !` })
    })
})


// Récupération des données caméra
app.get('/api/visu/:id', (req, res) => {
  getVisu(`${req.params.id}`)
    .then((camera) => {
      res.setHeader('Content-Type', 'application/json')
      res.status(200).send(camera)
    })
    .catch(err => {
      console.error(`Erreur : ${err}`)
      res.setHeader('Content-Type', 'application/json');
      res.status(500).send({ id: 9999, error: `Le fichier visu ne peut être récupéré !` })
    })
})


//Sauvegarde du fichiervisu.json
app.post('/api/visu/:id/', (req, res) => {
  saveVisu(req.params.id, req.body.visu)
    .then((retour) => {
      majVisu2dataModel(req.params.id, req.body.visu)
        .then(() => {
          res.setHeader('Content-Type', 'application/json')
          res.status(200)
          res.send({ status: "OK" })
        })
        .catch((err) => {
          console.error(`backend.js - majVisu2dataModel : ${err.id}`)
        })
    })
    .catch((err) => {
      console.error(`backend.js - saveVisu : ${err.id}`)
    })
})


// Récupération des données evènement
app.get('/api/evt/:id', (req, res) => {
  getEvt(`${req.params.id}`)
    .then((evt) => {
      res.setHeader('Content-Type', 'application/json')
      res.status(200).send(evt)
    })
    .catch(err => {
      console.error(`Erreur : ${err}`)
      res.setHeader('Content-Type', 'application/json');
      res.status(500).send({ id: 9999, error: `Le fichier evt ne peut être récupéré !` })
    })
})


//Sauvegarde du fichiervisu.json
app.post('/api/evt/:id/', (req, res) => {
  saveEvt(req.params.id, req.body.evt)
    .then((retour) => {
      majEvt2dataModel(req.params.id, req.body.evt)
        .then(() => {
          res.setHeader('Content-Type', 'application/json')
          res.status(200)
          res.send({ status: "OK" })
        })
        .catch((err) => {
          console.error(`backend.js - majEvt2dataModel : ${err.id}`)
        })
    })
    .catch((err) => {
      console.error(`backend.js - saveEvt : ${err.id}`)
    })
})

// Récupération des vignettes png
app.get('/api/vignettes/', (req, res) => {
  getVignettes()
    .then((vignettes) => {
      res.setHeader('Content-Type', 'application/json')
      res.status(200).send({ vignettes: `${vignettes}` })
    })
    .catch(err => {
      console.error(`Erreur : ${err}`)
      res.setHeader('Content-Type', 'application/json');
      res.status(500).send({ id: 9999, error: `Les vingettes ne peuvent être récupérées !` })
    })
})


//Définition de 2 points de terminaison pour test
//réponse OK
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send("Hello world")
})
// Réponse Erreur sur le serveur
app.get('/err', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(500).send({ id: 9999, error: `Une erreur s'est produite sur le serveur !` })
})

app.all('*', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(404).send({ id: 404, error: '404! Page not found' });
});

/************************ 
 * Lancement du serveur *
 ************************/
app.listen(port, () => {
  console.log(`le back-end est lancé sur http://localhost:${port}`)
})
