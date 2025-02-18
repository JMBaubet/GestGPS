


export const setPositions = (pointsCamera, avancement) => {
  console.log(`setPositions : Avancement ${avancement}`)
  let index = 1
  let lgSegment = 1
  while (index < pointsCamera.length) {
    let ref
    if (pointsCamera[index].set === true) { // On a un nouveau point de reférence
      ref = index
      console.log(`Nouvelle ref : ${ref}`)
      // On met à jour la longueur du point de ref précédent
      pointsCamera[index - lgSegment].longueur = lgSegment

      // On met à jour les datas des points intérmédiaires
      let increment = 1
      for (let ptInter = index - lgSegment + 1; ptInter < index; ptInter++) {
        // console.log(`On va mettre à jour ${ptInter}`)

        // Attention au changement de signe sur le cap. entre pointsCamera[index - lgSegment] et pointsCamera[ref]
        if (((pointsCamera[index - lgSegment].cap > 0) && (pointsCamera[ref].cap > 0)) ||
          ((pointsCamera[index - lgSegment].cap < 0) && (pointsCamera[ref].cap < 0))) {

          pointsCamera[ptInter].cap =
            pointsCamera[index - lgSegment].cap +
            (((pointsCamera[ref].cap - pointsCamera[index - lgSegment].cap) / lgSegment) * increment)
        } else {
          // console.warn(`Changement de signe sur le cap`)
          let cible = pointsCamera[ref].cap
          let origine = pointsCamera[index - lgSegment].cap
          let delta
          if ((cible > 0) && (cible < 90)) {
            delta = cible - origine
            pointsCamera[ptInter].cap =
              origine +
              (((delta) / lgSegment) * increment)
          } else if (cible > 90) {
            delta = origine - cible + 360
            pointsCamera[ptInter].cap =
              origine -
              (((delta) / lgSegment) * increment)
          } else if (cible < -90) {
            delta = cible - origine + 360
            pointsCamera[ptInter].cap =
              origine +
              (((delta) / lgSegment) * increment)
          } else {
            delta = origine - cible
            pointsCamera[ptInter].cap =
              origine -
              (((delta) / lgSegment) * increment)
          }
        }

        pointsCamera[ptInter].zoom =
          pointsCamera[index - lgSegment].zoom +
          (((pointsCamera[ref].zoom - pointsCamera[index - lgSegment].zoom) / lgSegment) * increment)

        pointsCamera[ptInter].pitch =
          pointsCamera[index - lgSegment].pitch +
          (((pointsCamera[ref].pitch - pointsCamera[index - lgSegment].pitch) / lgSegment) * increment)

        increment++
      }

      lgSegment = 0
    }
    // console.table(pointsCamera)

    // On met à jour les datas des points intérmédiaires
    // let increment = 1
    // for (let ptIntermediaire = index - lgSegment; ptIntermediaire < index + lgSegment; ptIntermediaire++) {
    //   pointsCamera[ptIntermediaire].cap = pointsCamera[index + lgSegment].cap +
    //     (((pointsCamera[ref].cap - pointsCamera[index + lgSegment].cap) / lgSegment) * increment)
    //   increment++
    // }


    lgSegment++

    index++
  }
  // console.table(pointsCamera)

}

