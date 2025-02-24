import fs, { promises } from 'fs'
import * as dotenv from 'dotenv'

const dataDirectory = process.env.DATA_DIRECTORY
const fileVisu = process.env.FILE_VISU



export const saveVisu = (id, visu) => {
  return new Promise((resolve, reject) => {
    console.log(`Enregistrement du fichier visu : ${id}`)
    console.table(visu)

    fs.promises.writeFile(dataDirectory + id + "\\" + fileVisu, JSON.stringify(visu))
      .then(() => {
        resolve({ status: "OK" })
      })
      .catch((err) => {
        console.error(`Erreur archivage du fichier visu : ${err}`)
        reject({ id: "21??", error: `Erreur écriture de fichier !` })
      })
  })
}

