function cors(req, res, next) {
    res.set('Access-Control-Allow-Origin', '*')
    res.set('Access-Control-Allow-Headers', 'Content-Type')
    res.set('Access-Control-Allow-Headers', 'DELETE')
    res.set('Access-Control-Allow-Headers', 'PUT')


    next()
}

module.exports = cors