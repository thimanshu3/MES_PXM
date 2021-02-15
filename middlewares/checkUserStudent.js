module.exports = (req, res, next) => {
    if (req.user.role !== 3) {
        req.flash('error', `You don't have enough permissions to access that!`)
        return res.redirect('/')
    }
    next()
}