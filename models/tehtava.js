const db = require('./db-yhteys')

const tauluTehtava = 'tehtava'
const tauluMuistiinpanot = 'muistiinpanot'

module.exports = {
    uusi: (tiedot, kayttajaId, cb) => {
        const time = new Date().getTime()
        let virhe

        if (tiedot.otsikko && tiedot.yritys) {

            const haettuPvm = (!isNaN(new Date(tiedot.haettuPvm).getTime()))
                ? db.mysql.escape(new Date(tiedot.haettuPvm).getTime())
                : `''`

            const paattyyPvm = (!isNaN(new Date(tiedot.paattyyPvm).getTime()))
                ? db.mysql.escape(new Date(tiedot.paattyyPvm).getTime())
                : `''`

            const tiedotObj = {
                kayttajaId: db.mysql.escape(kayttajaId),
                otsikko: db.mysql.escape(tiedot.otsikko),
                yritys: db.mysql.escape(tiedot.yritys),
                haettuPvm: haettuPvm,
                paattyyPvm: paattyyPvm,
                nimi: db.mysql.escape(tiedot.nimi),
                tel: db.mysql.escape(tiedot.tel),
                email: db.mysql.escape(tiedot.email),
                linkki: db.mysql.escape(tiedot.linkki),
                tiedosto: `''`,
                luotu: time,
                status: `''`
            }

            const sarakkeetTehtava = Object.keys(tiedotObj).join(', ')
            const arvotTehtava = Object.values(tiedotObj).join(', ')

            db.yhteys.query(`INSERT INTO ${tauluTehtava} (${sarakkeetTehtava}) VALUES (${arvotTehtava})`, (err) => {
                if (err) throw err

                db.yhteys.query(`SELECT id FROM ${tauluTehtava} WHERE luotu = ${time} AND kayttajaId = ${tiedotObj.kayttajaId}`, (err, data) => {
                    if (err) throw err

                    const muistiinpanotObj = {
                        kayttajaId: db.mysql.escape(kayttajaId),
                        tehtavaId: data[0].id,                        
                        pvm: db.mysql.escape(time),
                        viesti: `'Luotu'`
                    }
                    
                    const sarakkeetMuistiinpano = Object.keys(muistiinpanotObj).join(', ')
                    const arvotMuistiinpano = Object.values(muistiinpanotObj).join(', ')

                    db.yhteys.query(`INSERT INTO ${tauluMuistiinpanot} (${sarakkeetMuistiinpano}) VALUES (${arvotMuistiinpano})`, (err) => {
                        if (err) throw err
                        cb(false)
                    })
                })
            })
        } else {
            virhe = {tyyppi: 'tyoTiedot', viesti: 'Kaikkia pakollisia kenttiä ei täytetty. Ole hyvä ja tarkasta tiedot.'}
            cb(virhe)
        }
    },
    haeKaikki: (kayttajaId, listaus, cb) => {
        let lajittelu = 'ORDER BY id DESC'

        if (listaus === 'avoin') {
            lajittelu = 'ORDER BY paattyyPvm ASC'
        } else if (listaus === 'paattynyt') {
            lajittelu = 'ORDER BY paattyyPvm DESC'
        } else if (listaus === 'muistiin') {
            lajittelu = 'ORDER BY paattyyPvm DESC, luotu DESC'
        } else if (listaus === 'arkisto') {
            lajittelu = 'ORDER BY luotu DESC'
        }

        db.yhteys.query(`SELECT * FROM ${tauluTehtava} WHERE kayttajaId=${kayttajaId} ${lajittelu}`, (err, data) => {
            if (err) throw err

            db.yhteys.query(`SELECT * FROM ${tauluMuistiinpanot} WHERE kayttajaId=${kayttajaId} ORDER BY pvm DESC`, (err, dataMuistio) => {
                if (err) throw err

                const time = new Date().getTime()

                const result = {
                    data: data.filter((d, i) => {
                        if (listaus === 'avoin') {
                            if ((d.haettuPvm !== 0 && d.paattyyPvm + 86399999 > time && d.status !== 'arkisto') || (d.haettuPvm !== 0 && d.paattyyPvm === 0 && d.status !== 'arkisto')) {
                                return d
                            }
                        } else if (listaus === 'paattynyt') {
                            if ((d.paattyyPvm !== 0 && d.paattyyPvm + 86399999 < time && d.haettuPvm === 0 && d.status !== 'arkisto') || (d.paattyyPvm !== 0 && d.paattyyPvm + 86399999 < time && d.haettuPvm !== 0 && d.status !== 'arkisto')) {
                                return d
                            }
                        } else if (listaus === 'muistiin') {
                            if ((d.haettuPvm === 0 && d.status !== 'arkisto' && d.paattyyPvm === 0) || (d.haettuPvm === 0 && d.status !== 'arkisto' && d.paattyyPvm + 86399999 > time)) {
                                return d
                            }
                        } else if (listaus === 'arkisto') {
                            if (d.status === 'arkisto') {
                                return d
                            }
                        } else {
                            return null
                        }
                    }),
                    muistiinpanot: dataMuistio,
                    avoimetMaara: data.filter(d => (d.haettuPvm !== 0 && d.paattyyPvm + 86399999 > time && d.status !== 'arkisto') || (d.haettuPvm !== 0 && d.paattyyPvm === 0 && d.status !== 'arkisto')).length,
                    paattynytMaara: data.filter(d => ((d.paattyyPvm !== 0 && d.paattyyPvm + 86399999 < time && d.haettuPvm === 0 && d.status !== 'arkisto') || (d.paattyyPvm !== 0 && d.paattyyPvm + 86399999 < time && d.haettuPvm !== 0 && d.status !== 'arkisto'))).length,
                    muistiinMaara: data.filter(d => ((d.haettuPvm === 0 && d.status !== 'arkisto' && d.paattyyPvm === 0) || (d.haettuPvm === 0 && d.status !== 'arkisto' && d.paattyyPvm + 86399999 > time))).length,
                    arkistoMaara: data.filter(d => d.status === 'arkisto').length
                }

                cb(result)
            })
        })
    },
    haeTiedot: (tiedot, cb) => {
        const tehtavaId = db.mysql.escape(tiedot.tehtavaId)
        const kayttajaId = db.mysql.escape(tiedot.kayttajaId)

        db.yhteys.query(`SELECT * FROM ${tauluTehtava} WHERE id = '${tehtavaId}' AND kayttajaId = ${kayttajaId}`, (err, data) => {
            if (err) throw err
            db.yhteys.query(`SELECT * FROM ${tauluMuistiinpanot} WHERE kayttajaId=${kayttajaId} AND tehtavaId=${tehtavaId} ORDER BY pvm DESC`, (err, dataMuistio) => {
                if (err) throw err

                const result = {
                    data: data,
                    muistiinpanot: dataMuistio
                }
                cb(result)
            })
        })
    },
    muokkaa: (tiedot, sessioTiedot, cb) => {
        let virhe = null

        if (tiedot.otsikko && tiedot.yritys) {

            const haettuPvm = (!isNaN(new Date(tiedot.haettuPvm).getTime()))
                ? db.mysql.escape(new Date(tiedot.haettuPvm).getTime())
                : `''`

            const paattyyPvm = (!isNaN(new Date(tiedot.paattyyPvm).getTime()))
                ? db.mysql.escape(new Date(tiedot.paattyyPvm).getTime())
                : `''`

            const tiedotObj = {
                otsikko: db.mysql.escape(tiedot.otsikko),
                yritys: db.mysql.escape(tiedot.yritys),
                haettuPvm: haettuPvm,
                paattyyPvm: paattyyPvm,
                nimi: db.mysql.escape(tiedot.nimi),
                tel: db.mysql.escape(tiedot.tel),
                email: db.mysql.escape(tiedot.email),
                linkki: db.mysql.escape(tiedot.linkki),
                tiedosto: db.mysql.escape('')
            }

            db.yhteys.query(`UPDATE ${tauluTehtava} 
                SET 
                    otsikko=${tiedotObj.otsikko},
                    yritys=${tiedotObj.yritys},
                    haettuPvm=${tiedotObj.haettuPvm},
                    paattyyPvm=${tiedotObj.paattyyPvm},
                    nimi=${tiedotObj.nimi},
                    tel=${tiedotObj.tel},
                    email=${tiedotObj.email},
                    linkki=${tiedotObj.linkki},
                    tiedosto=${tiedotObj.tiedosto}
                WHERE
                    id=${sessioTiedot.tehtavaId} AND kayttajaId=${sessioTiedot.kayttajaId}
            `, (err) => {
                if (err) throw err

                cb(virhe)
            })
        } else {
            virhe = {tyyppi: 'muokkaaTiedot', viesti: 'Kaikkia pakollisia kenttiä ei täytetty. Ole hyvä ja tarkasta tiedot.'}
            cb(virhe)
        }
    },
    arkistoi: (tiedot, cb) => {
        const time = db.mysql.escape(new Date().getTime())
        const tehtavaId = db.mysql.escape(tiedot.tehtavaId)
        const kayttajaId = db.mysql.escape(tiedot.kayttajaId)

        db.yhteys.query(`UPDATE ${tauluTehtava} SET status = 'arkisto' WHERE id='${tehtavaId}' AND kayttajaId=${kayttajaId}`, (err) => {
            if (err) throw err

            const muistiinpanotObj = {
                kayttajaId: kayttajaId,
                tehtavaId: tehtavaId,                
                pvm: time,
                viesti: `'Arkistoitu'`
            }
            
            const sarakkeetMuistiinpano = Object.keys(muistiinpanotObj).join(', ')
            const arvotMuistiinpano = Object.values(muistiinpanotObj).join(', ')

            db.yhteys.query(`INSERT INTO ${tauluMuistiinpanot} (${sarakkeetMuistiinpano}) VALUES (${arvotMuistiinpano})`, (err) => {
                if (err) throw err
                cb(tiedot.polku)
            })
        })
    },
    poista: (tiedot, cb) => {
        const tehtavaId = db.mysql.escape(tiedot.tehtavaId)
        const kayttajaId = db.mysql.escape(tiedot.kayttajaId)

        db.yhteys.query(`DELETE FROM ${tauluTehtava} WHERE id = '${tehtavaId}' AND kayttajaId = ${kayttajaId}`, (err) => {
            if (err) throw err
            cb(tiedot.polku)
        })
    },
    uusiMuistiinpano: (tiedot, sessioTiedot, cb) => {
        if (tiedot.muistiinpano.length > 0) {
            const uusiMuistiinpano = {
                kayttajaId: db.mysql.escape(sessioTiedot.kayttajaId),
                tehtavaId: db.mysql.escape(sessioTiedot.tehtavaId),
                pvm: db.mysql.escape(new Date().getTime()),
                viesti: db.mysql.escape(tiedot.muistiinpano)
            }
            
            const sarakkeetMuistiinpano = Object.keys(uusiMuistiinpano).join(', ')
            const arvotMuistiinpano = Object.values(uusiMuistiinpano).join(', ')

            db.yhteys.query(`INSERT INTO ${tauluMuistiinpanot} (${sarakkeetMuistiinpano}) VALUES (${arvotMuistiinpano})`, (err) => {
                if (err) throw err

                cb(sessioTiedot.polku)
            })
        } else {
            cb(null)
        }
    },
    poistaMuistiinpano: (tiedot, cb) => {
        const muistiinpanoId = db.mysql.escape(tiedot.muistiinpanoId)

        db.yhteys.query(`DELETE FROM ${tauluMuistiinpanot} WHERE id=${muistiinpanoId}`, (err) => {
            if (err) throw err
            cb()
        })
    }
}
