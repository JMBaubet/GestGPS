import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import * as dotenv from 'dotenv'

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
  res.send({error: `Une erreur s'est produite sur le serveur !`})            
})

app.all('*', (req, res) => {
  res.status(404).send('404! Page not found');
});

//Lancement du serveur
app.listen(port, () => {
    console.log(`le back-end est lancé sur http://localhost:${port}`)
})
