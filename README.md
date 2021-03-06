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
* database which is supported by sequelize - MySQL, MariaDB, SQLite, PostgreSQL or MsSQL

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
* If you want to allow storing data from specific ip addresses, add it to `allowed_subnets` in config (`xxx.yyy.zzz.vvv/mask`). Example `111.222.111.0/26`

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

### Sending POST requests

File `sample_requests.sh` contains requests of all types that gta-monitor
accepts. If you want to send a request, run command below. Note that if
you specify some optional argument, all of optional arguments before must be
specified.

```bash
$ bash sample_requests.sh <type> [USER] [HOSTNAME] [SERVER] [IP]
```
Argument `type` is one of the following: `start`, `command`, `passed`,
`exit`, `help`, `ack`
