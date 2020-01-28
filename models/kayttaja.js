const db = require('./db-yhteys')

const tauluKayttajat = 'kayttajat'

module.exports = {
    kirjaudu: (kirjautumistiedot, cb) => {
        const tunnus = db.mysql.escape(kirjautumistiedot.tunnus)
        const salasana = db.mysql.escape(kirjautumistiedot.salasana)
        
        db.yhteys.query(`SELECT * FROM ${tauluKayttajat} WHERE tunnus=${tunnus} AND salasana=${salasana}`, (err, data) => {
            if (err) throw err

            if (data.length === 1) {
                const result = {
                    id: data[0].id,
                    tunnus: data[0].tunnus
                }

                cb(result)
            } else {
                cb(null)
            }
        })
    },
    tarkasta: (rekTiedot, cb) => {
        const tunnus = db.mysql.escape(rekTiedot.tunnus)
        let virhe

        if (rekTiedot.tunnus && rekTiedot.salasana && rekTiedot.salasanaVarmistus) {
            if (rekTiedot.tunnus.length > 4) {
                if (rekTiedot.salasana.length > 7) {
                    if (rekTiedot.salasana === rekTiedot.salasanaVarmistus) {
                        virhe = null
                    } else {
                        virhe = {tyyppi: 'rekTiedot', viesti: 'Syöttämäsi salasanat eivät täsmää. Ole hyvä ja tarkasta tiedot.'}
                    }
                } else {
                    virhe = {tyyppi: 'rekTiedot', viesti: 'Syöttämäsi salasana on liian lyhyt. Ole hyvä ja tarkasta tiedot.'}
                }
            } else {
                virhe = {tyyppi: 'rekTiedot', viesti: 'Syöttämäsi käyttäjätunnus on liian lyhyt. Ole hyvä ja tarkasta tiedot.'}
            }
        } else {
            virhe = {tyyppi: 'rekTiedot', viesti: 'Kaikkia lomakkeen kenttiä ei ole täytetty. Ole hyvä ja tarkasta syöttämäsi tiedot.'}
        }

        db.yhteys.query(`SELECT tunnus FROM ${tauluKayttajat} WHERE tunnus=${tunnus}`, (err, data) => {
            if (err) throw err
            if (!virhe && data.length > 0) {
                virhe = {tyyppi: 'rekTiedot', viesti: 'Valitsemasi käyttäjätunnus on jo käytössä. Valitse jokin toinen käyttäjätunnus.'}
                cb(virhe, null)
            } else {
                if (virhe) {
                    cb(virhe, null)
                } else {
                    virhe = {tyyppi: 'rekOk', viesti: 'Käyttäjätunnus rekisteröity onnistuneesti! Jatka kirjautumalla sisään.'}
                    cb(false, virhe)
                }
            }
        })
    },
    rekisteroi: (rekTiedot, cb) => {
        const tunnus = db.mysql.escape(rekTiedot.tunnus)
        const salasana = db.mysql.escape(rekTiedot.salasana)

        db.yhteys.query(`INSERT INTO ${tauluKayttajat} (tunnus, salasana) VALUES (${tunnus}, ${salasana})`, (err) => {
            if (err) throw err

            cb()
        })
    }
}
