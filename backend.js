import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import * as dotenv from 'dotenv'
import os from 'os'
import fs from 'fs'
import path from 'path'

import { decodeGpx } from './src/scripts/gpx.js'
import { getTraceurs } from './src/scripts/traceurs.js'

const app = express()
dotenv.config()
const port = process.env.PORT

// Configuration de cors pour autoriser les requette
// Depuis localhost:3000 le front end
const allowedOrigins = ['http://localhost:3000'];
const options = cors.CorsOptions = {
  origin: allowedOrigins
};
app.use(cors(options))

app.use(morgan('tiny'))

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
      res.set('Content-Type', 'application/json')
      res.send({ gpx: `${gpxFiles.length}`, fit: `${fitFiles.length}` })
    })
    .catch(err => {
      res.setHeader('Content-Type', 'application/json');
      res.status(500)
      res.json({ error: `Le dossier ${directory} n'a pas été trouvé !` })
    })

})

// Obtention de la liste des fichiers *.gpx présents dans download.
app.get('/api/GpxFiles/', (req, res) => {
  fs.promises.readdir(directory)
    .then(filesDir => {
      const gpxFiles = filesDir.filter(el => path.extname(el) === '.gpx')
      res.setHeader('Content-Type', 'application/json');
      res.send(gpxFiles)
    })
    .catch(err => {
      res.setHeader('Content-Type', 'application/json');
      res.status(500)
      res.json.send({ error: `Le dossier ${directory} n'a pas été trouvé !` })
    })
})


// Traitement d'un fichier gpx
app.post('/api/GpxFile/:fileName/:traceur', (req, res) => {
  console.log(`backend.js : traceur : ${req.params.traceur}`)
  decodeGpx(`${directory}\\${req.params.fileName}`, `${req.params.traceur}`)
    .then(retour => {
      if (retour.circuitId !== 0) { console.log(`Retour de la promise : ${retour.circuitId}, ${retour.isPresent}`) }

      /** Il faut : 
       * - decoder le fichier
       * - archiver le fichier gpx dans l'appli
       * - mettre à jour le fichier json
       * - créer la vignette  */
      res.set('Content-Type', 'application/json')
      if (retour.circuitId === 0) {
        res.send({ gpx: "Present" })
      } else if (retour.isPresent) {
        res.send({ gpx: "Semblable" })
      } else {
        res.send({ gpx: "OK" })
      }
    })
    .catch(err => {
      console.error(`Erreur : ${err}`)
      res.setHeader('Content-Type', 'application/json');
      res.status(500)
      res.json({ error: `Le fichier ${req.params.fileName} n'a pas pu être traité !` })
    })
})

// Obtension de la liste des traceurs connus dans dataModel.json
app.get('/api/traceurs/', (req, res) => {
  getTraceurs()
    .then(listeTraceurs => {
      res.set('Content-Type', 'application/json')
      res.send(listeTraceurs)
    })
    .catch(err => {
      console.error(`Erreur : ${err}`)
      res.setHeader('Content-Type', 'application/json');
      res.status(500)
      res.json({ error: `La liste des traceurs ne peut être récupérée !` })
    })
})

//Définition de 2 points de terminaison pour test
//réponse OK
app.get('/', (req, res) => {
  res.set('Content-Type', 'text/html');
  res.send("Hello world")
})
// Réponse Erreur sur le serveur
app.get('/err', (req, res) => {
  res.set('Content-Type', 'application/html');
  res.status(500)
  res.send({ error: `Une erreur s'est produite sur le serveur !` })
})

app.all('*', (req, res) => {
  res.status(404).send('404! Page not found');
});

/************************ 
 * Lancement du serveur *
 ************************/
app.listen(port, () => {
  console.log(`le back-end est lancé sur http://localhost:${port}`)
})
