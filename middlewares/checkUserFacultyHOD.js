module.exports = (req, res, next) => {
    if (req.user.role !== 2 && !req.user.isHOD) {
        req.flash('error', `You don't have enough permissions to access that!`)
        return res.redirect('/')
    }
    next()
}