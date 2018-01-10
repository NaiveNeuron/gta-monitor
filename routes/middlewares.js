
module.exports = {
    login_required: function(req, res, next) {
        if (req.user)
            return next();

        res.redirect('/auth/login');
    }
};
