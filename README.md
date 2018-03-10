# gta-monitor

Intelligent system for monitoring students who work in the Linux terminal

## Getting started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

First of all, clone this repository by running

```
$ git clone git@github.com:NaiveNeuron/gta-monitor.git
```

### Prerequisites

* nodejs
* database which is supported by sequelize - mysql, sqlite, postgres or mssql

### Installation

To install all the modules specified in `package.json` run following

```
$ npm install
```

### Configuration

* Create a database
* Choose the environment (`development` or `production`) `$ export NODE_ENV="environment"` - if not set, app will use `development`
* Choose the port `$ export PORT=4321` - if not set, app will use port 3000
* Update `config/db_config.json` appropriately to set the connection to database
* If you want to setup TLS/SSL, update path to certificate and key in `config/app_config.json`

## Running

Run the application by executing `$ npm start`.
It will automatically create tables (in case they don't exist yet) and start listening
on given port.

### Create superuser

To create admin account simply run

```
$ node create_admin.js
```

It will prompt you to fill in basic info including password and save it.
