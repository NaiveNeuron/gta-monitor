var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var session = require('express-session');
var flash = require('flash');
var schedule = require('node-schedule');
var bcrypt = require('bcrypt-nodejs');
var passport = require('passport');
var ip = require('ip');

var LocalStrategy = require('passport-local').Strategy;

var models = require('./models');
var socketapi = require('./socketapi');

var index = require('./routes/index');
var auth = require('./routes/auth');
var gta = require('./routes/gta');
var exercise = require('./routes/exercise');

var app = express();

var secret_key = 'strong-secret';

app.locals.pretty = true;

global.activities = {};
global.inactive = [];
global.inactivity = 300; /* inactivity in seconds */
global.POST_START = 'start';
global.POST_COMMAND = 'command';
global.POST_PASSED = 'passed';
global.POST_EXIT = 'exit';
global.ALLOWED_SUBNETS = [
    ip.cidrSubnet('158.195.28.128/26'), /* eth0 h3 */
    ip.cidrSubnet('158.195.28.192/26'), /* eth0 f1-248 */
    ip.cidrSubnet('158.195.28.0/25'), /* eth0 h6 */
    ip.cidrSubnet('158.195.252.0/23'), /* wlan eduroam */
];

if (!Date.now) {
    Date.now = function now() {
        return new Date().getTime();
    };
}

passport.use(new LocalStrategy(function(username, password, done) {
    models.User.findOne({
        where: {
            username: username
        }
    }).then(function(user) {
        if (user == null) {
            return done(null, false, { message: 'Incorrect credentials.' });
        }

        if (bcrypt.compareSync(password, user.password)) {
            return done(null, user);
        }

        return done(null, false, { message: 'Incorrect credentials.' });
    });
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: secret_key, resave: false, saveUninitialized: false}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Make it available to check logged in user in templates
app.use(function(req, res, next) {
    res.locals.logged_user = req.user;
    next();
});

app.use('/', index);
app.use('/auth', auth);
app.use('/gta', gta);
app.use('/exercise', exercise);

// Sync Database
models.sequelize.sync().then(function() {
    console.log('Nice! Database looks fine');

    /* Exercises available in whole application */
    models.Exercise.findAll().then(function(resultset) {
        app.locals.navbar_exercises = resultset;
        app.locals.navbar_evaluate_exercises = [];

        resultset.forEach(function(item) {
            if (item.status == 'done')
                app.locals.navbar_evaluate_exercises.push(item);
        });
    });

    /* If there is already an active exercise, check and save last activities of students */
    models.Exercise.findOne({
        where: {
            status: 'active',
        }
    }).then(function(exercise) {
        if (exercise) {
            models.Post.findAll({
                where: {
                    exercise_id: exercise.id
                }
            }).then(function(resultset) {
                resultset.forEach(function(item) {
                    if (item.type == global.POST_EXIT && item.user in global.activities) {
                        delete global.activities[item.user];
                    } else {
                        global.activities[item.user] = item.date;
                    }
                });
            });
        }
    });
}).catch(function(err) {
    console.log(err, 'Something went wrong with the Database Update!');
});

/* Change status of exercises scheduled -> active, active -> done */
var j = schedule.scheduleJob('* * * * *', function(){
    models.Exercise.findAll().then(function(resultset) {
        resultset.forEach(function(item) {
            var ex = item.get({plain: true});
            var curr = new Date();
            var starts = new Date(ex.starts_at);
            var ends = new Date(ex.ends_at);

            if (ex.status == 'scheduled' && starts.getTime() < curr.getTime()) {
                item.update({status: 'active'});
            } else if (ex.status == 'active' && ends.getTime() < curr.getTime()) {
                item.update({status: 'done'}).then(function() {
                    app.locals.navbar_evaluate_exercises.push(item);

                    /* reset activities*/
                    global.activities = {};
                    global.inactive = [];
                });
            }
        });
    });
});

/* Periodically check for inactive students */
var inactive_students_job = schedule.scheduleJob('* * * * *', function() {
    console.log('Checking inactive students...');
    var curr = Date.now() / 1000;
    Object.keys(global.activities).forEach(function(user) {
        var index = global.inactive.indexOf(user);
        /* if the user is inactive and not in inactive group, add them */
        if (curr - (global.activities[user].getTime() / 1000) > global.inactivity) {
            if (index == -1) {
                global.inactive.push(user);
                socketapi.io.emit('new_inactive_student', user);
            }
        } else if (index > -1) {
            /* if the user is active and in inactive group, remove them */
            global.inactive.splice(index, 1);
            socketapi.io.emit('new_active_student', user);
        }
    });
});

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    models.User.findById(id).then(function(user) {
        done(null, user);
    }).catch(function(err) {
        done(err, null);
    });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
