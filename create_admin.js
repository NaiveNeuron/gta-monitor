var prompt = require('prompt');
var models = require('./models');

prompt.start();

var schema = {
    properties: {
        firstname: {
            description: 'Enter first name',
        },
        lastname: {
            description: 'Enter last name',
        },
        username: {
            description: 'Enter username',
            required: true
        },
        password: {
            description: 'Password',
            required: true,
            hidden: true
        },
        password_again: {
            description: 'Password again',
            required: true,
            hidden: true
        }
    }
}

prompt.get(schema, function (err, result) {
    if (result.password != result.password_again)
        return console.log('Passwords do not match!');

    models.User.findOne({
        where: {
            username: result.username,
        }
    }).then(function(user) {
        if (user) {
            console.log('User already exists!');
            process.exit(0);
        } else {
            models.User.create(
                { username: result.username,
                  password: result.password,
                  firstname: result.firstname,
                  lastname: result.lastname }).then(function(user) {
                      console.log('User created!');
                      process.exit(0);
            });
        }
    });
});
