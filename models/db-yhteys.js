const mysql = require('mysql')

const tietokanta = 'omatyonhaku'

const yhteys = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: tietokanta
})

yhteys.connect((err) => {
        (err)
            ? console.log(`virhe yhdistettäessä tietokantaan ${err}`)
            : console.log(`yhdistetty tietokantaan ${tietokanta}`)
    })

module.exports = {
    mysql, yhteys
}
