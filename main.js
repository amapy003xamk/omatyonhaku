/* Sovellusohjelmointi 2
** Soveltava harjoitustyö
** Marko Pylkkänen, TKMI18SM
** 6.1.2020
*/

require('dotenv').config()
const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const crypto = require('crypto')

const kayttaja = require('./models/kayttaja')
const tehtava = require('./models/tehtava')

const app = express()

const portti = process.env.PORT

app.set('view engine', 'ejs')
app.set('views', './views')

app.use(express.static('./public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: null,
        expires: false
    }
}))

app.use((req, res, next) => {

    if (!req.session.kirjautuminen && req.path !== '/login' && req.path !== '/logout' && req.path !== '/register') {
        res.render('index', {
            virhe: (req.session.viesti)
                ? req.session.viesti
                : {
                tyyppi: 'login',
                viesti: ''
            },
            kirjautuminen: req.session.kirjautuminen,
            kirjautumistiedot:  {
                tunnus: null,
                muista: null
            },
            tyotiedot: {
                otsikko: null,
                yritys: null,
                haettuPvm: null,
                paattyyPvm: null,
                nimi: null,
                tel: null,
                email: null,
                linkki: null
            },
            lista: null
        })
    } else {
        next()
    }
})

app.post('/login', (req, res) => {
    req.session.kirjautuminen = false
    req.session.viesti = null

    if (req.body.tunnus && req.body.salasana) {

        const kirjautumistiedot = {
            tunnus: req.body.tunnus,
            salasana: crypto.createHash('SHA512').update(req.body.salasana, 'utf8').digest('hex'),
            muista: (req.body.muista) ? true : false
        }

        kayttaja.kirjaudu(kirjautumistiedot, (data) => {
            if (data) {
                if (kirjautumistiedot.muista) {
                    req.session.cookie.maxAge = 7 * 24 * 3600000
                }
                req.session.kirjautuminen = true
                req.session.tunnus = data.tunnus
                req.session.kayttajaId = data.id

                res.redirect('/')
            } else {
                res.render('index', {
                    virhe: {
                        tyyppi: 'loginTiedot',
                        viesti: 'Käyttäjätunnus tai salasana on virheellinen tai jokin kenttä jäi vahingossa täyttämättä. Tarkasta syöttämäsi tiedot.'
                    },
                    kirjautuminen: req.session.kirjautuminen,
                    kirjautumistiedot: {
                        tunnus: req.body.tunnus,
                        muista: req.body.muista
                    },
                    tyotiedot: {
                        otsikko: null,
                        yritys: null,
                        haettuPvm: null,
                        paattyyPvm: null,
                        nimi: null,
                        tel: null,
                        email: null,
                        linkki: null
                    },
                    lista: null
                })
            }
        })
    } else {
        res.render('index', {
            virhe: {
                tyyppi: 'loginTiedot',
                viesti: 'Käyttäjätunnus tai salasana on virheellinen tai jokin kenttä jäi vahingossa täyttämättä. Ole hyvä ja tarkasta syöttämäsi tiedot.'
            },
            kirjautuminen: req.session.kirjautuminen,
            kirjautumistiedot: {
                tunnus: req.body.tunnus,
                muista: req.body.muista
            },
            tyotiedot: {
                otsikko: null,
                yritys: null,
                haettuPvm: null,
                paattyyPvm: null,
                nimi: null,
                tel: null,
                email: null,
                linkki: null
            },
            lista: null
        })
    }
})

app.post('/register', (req, res) => {

    kayttaja.tarkasta(req.body, (err, data) => {

        if (err) {
            res.render('index', {
                virhe: err,
                kirjautuminen: req.session.kirjautuminen,
                kirjautumistiedot: {
                    tunnus: req.body.tunnus,
                    muista: null
                },
                tyotiedot: {
                    otsikko: null,
                    yritys: null,
                    haettuPvm: null,
                    paattyyPvm: null,
                    nimi: null,
                    tel: null,
                    email: null,
                    linkki: null
                },
                lista: null
            })
        } else {
            const rekTiedot = {
                tunnus: req.body.tunnus,
                salasana: crypto.createHash('SHA512').update(req.body.salasana, 'utf8').digest('hex')
            }
        
            kayttaja.rekisteroi(rekTiedot, () => {
                req.session.kirjautuminen = false
                req.session.viesti = data
                res.redirect('/')
            })
        }
    })
})

app.post('/lisaaHaku', (req, res) => {
    tehtava.uusi(req.body, req.session.kayttajaId, (err) => {
        req.session.viesti = null

        if (err) {
            res.render('index', {
                virhe: err,
                kirjautuminen: req.session.kirjautuminen,
                kirjautumistiedot: {
                    tunnus: req.session.tunnus,
                    muista: null
                },
                tyotiedot: {
                    otsikko: req.body.otsikko,
                    yritys: req.body.yritys,
                    haettuPvm: req.body.haettuPvm,
                    paattyyPvm: req.body.paattyyPvm,
                    nimi: req.body.nimi,
                    tel: req.body.tel,
                    email: req.body.email,
                    linkki: req.body.linkki
                },
                lista: null
            })
        } else {
            res.redirect('/')
        }
    })
})

app.post('/archive/:id', (req, res) => {
    const tiedot = {
        tehtavaId: Number(req.params.id),
        kayttajaId: Number(req.session.kayttajaId),
        polku: req.headers.referer
    }

    tehtava.arkistoi(tiedot, (polku) => {
        res.redirect(`${polku}`)
    })
})

app.post('/delete/:id', (req, res) => {
    const tiedot = {
        tehtavaId: Number(req.params.id),
        kayttajaId: Number(req.session.kayttajaId),
        polku: req.headers.referer
    }

    tehtava.poista(tiedot, (polku) => {
        res.redirect(`${polku}`)
    })
})

app.post('/edit/:id', (req,res) => {
    const tiedot = {
        tehtavaId: Number(req.params.id),
        kayttajaId: Number(req.session.kayttajaId),
        polku: req.query.referer,
        reqBody: req.body
    }

    tehtava.muokkaa(req.body, tiedot, (err) => {
        if (err) {
            res.redirect(`/edit/${tiedot.tehtavaId}?err=tiedot&path=${req.query.referer}`)
        } else {
            res.redirect(tiedot.polku)
        }
    })
})

app.post('/addmemo/:id', (req, res) => {
    const tiedot = {
        tehtavaId: Number(req.params.id),
        kayttajaId: Number(req.session.kayttajaId),
        polku: req.headers.referer,
        reqBody: req.body
    }

    tehtava.uusiMuistiinpano(req.body, tiedot, (polku) => {
        res.redirect(`${polku}`)
    })
})

app.post('/delmemo/:id', (req, res) => {

    const tiedot = {
        muistiinpanoId: Number(req.params.id),
        kayttajaId: Number(req.session.kayttajaId),
        polku: `${req.headers.referer.split('?')[0]}?path=${req.query.referer}`
    }

    tehtava.poistaMuistiinpano(tiedot, () => {
        res.redirect(`${tiedot.polku}`)
    })
})

app.get('/logout', (req, res) => {

    req.session.kirjautuminen = false
    req.session.tunnus = null
    req.session.kayttajaId = null
    req.session.expires = false

    res.redirect('/')
})

app.get('/archive', (req, res) => {

    tehtava.haeKaikki(req.session.kayttajaId, 'arkisto', (data) => {

        res.render('archive', {
            virhe: false,
            kirjautuminen: req.session.kirjautuminen,
            kirjautumistiedot: {
                tunnus: req.session.tunnus,
                muista: null
            },
            tyotiedot: {
                otsikko: null,
                yritys: null,
                haettuPvm: null,
                paattyyPvm: null,
                nimi: null,
                tel: null,
                email: null,
                linkki: null
            },
            lista: {
                data: data.data,
                muistiinpanot: data.muistiinpanot,
                avoimetMaara: data.avoimetMaara,
                paattynytMaara: data.paattynytMaara,
                muistiinMaara: data.muistiinMaara,
                arkistoMaara: data.arkistoMaara
            }
        })
    })
})

app.get('/history', (req, res) => {

    tehtava.haeKaikki(req.session.kayttajaId, 'paattynyt', (data) => {

        res.render('history', {
            virhe: false,
            kirjautuminen: req.session.kirjautuminen,
            kirjautumistiedot: {
                tunnus: req.session.tunnus,
                muista: null
            },
            tyotiedot: {
                otsikko: null,
                yritys: null,
                haettuPvm: null,
                paattyyPvm: null,
                nimi: null,
                tel: null,
                email: null,
                linkki: null
            },
            lista: {
                data: data.data,
                muistiinpanot: data.muistiinpanot,
                avoimetMaara: data.avoimetMaara,
                paattynytMaara: data.paattynytMaara,
                muistiinMaara: data.muistiinMaara,
                arkistoMaara: data.arkistoMaara
            }
        })
    })
})

app.get('/notebook', (req, res) => {

    tehtava.haeKaikki(req.session.kayttajaId, 'muistiin', (data) => {

        res.render('notebook', {
            virhe: false,
            kirjautuminen: req.session.kirjautuminen,
            kirjautumistiedot: {
                tunnus: req.session.tunnus,
                muista: null
            },
            tyotiedot: {
                otsikko: null,
                yritys: null,
                haettuPvm: null,
                paattyyPvm: null,
                nimi: null,
                tel: null,
                email: null,
                linkki: null
            },
            lista: {
                data: data.data,
                muistiinpanot: data.muistiinpanot,
                avoimetMaara: data.avoimetMaara,
                paattynytMaara: data.paattynytMaara,
                muistiinMaara: data.muistiinMaara,
                arkistoMaara: data.arkistoMaara
            }
        })
    })
})

app.get('/edit/:id', (req, res) => {

    const tiedot = {
        tehtavaId: Number(req.params.id),
        kayttajaId: Number(req.session.kayttajaId),
        polku: (req.query.path)
         ? req.query.path
         : req.headers.referer
    }

    tehtava.haeTiedot(tiedot, (data) => {

        res.render('edit', {
            virhe: {
                tyyppi: 'muokkaus',
                viesti: req.query.err
            },
            kirjautuminen: req.session.kirjautuminen,
            kirjautumistiedot: {
                tunnus: req.session.tunnus,
                kayttajaId: Number(req.session.kayttajaId),
                muista: null
            },
            tyotiedot: {
                otsikko: null,
                yritys: null,
                haettuPvm: null,
                paattyyPvm: null,
                nimi: null,
                tel: null,
                email: null,
                linkki: null
            },
            lista: {
                data: data.data[0],
                muistiinpanot: data.muistiinpanot,
                polku: tiedot.polku
            }
        })
    })
})

app.get('/', (req, res) => {

    if (req.session.kirjautuminen) {
        tehtava.haeKaikki(req.session.kayttajaId, 'avoin', (data) => {

            res.render('index', {
                virhe: false,
                kirjautuminen: req.session.kirjautuminen,
                kirjautumistiedot: {
                    tunnus: req.session.tunnus,
                    muista: null
                },
                tyotiedot: {
                    otsikko: null,
                    yritys: null,
                    haettuPvm: null,
                    paattyyPvm: null,
                    nimi: null,
                    tel: null,
                    email: null,
                    linkki: null
                },
                lista: {
                    data: data.data,
                    muistiinpanot: data.muistiinpanot,
                    avoimetMaara: data.avoimetMaara,
                    paattynytMaara: data.paattynytMaara,
                    muistiinMaara: data.muistiinMaara,
                    arkistoMaara: data.arkistoMaara
                }
            })
        })
    } else {
        res.redirect('/logout')
    }
})

app.listen(portti, () => {
    console.log(`palvelin käynnistyi osoitteeseen localhost:${portti}`)
})
