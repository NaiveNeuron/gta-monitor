EXERCISE_NUM="cvicenie_01.gta"
TYPE=$1
USR=${2:-`whoami`}
HOSTNAME=${3:-`hostname`}
SERVER=${4:-"https://localhost:3000"}
IP=${5:-"158.195.28.190"}

LVL="l01"
CMD=$(echo -n "cat file | grep something | awk blablabla" | base64 --wrap=0)

CONCATED="i"$EXERCISE_NUM"j%!d(string="$LVL")k"$HOME"l"
HASH=$(echo -n $CONCATED | md5sum | cut -d " " -f 1)

if [ "$TYPE" = "start" ]; then
    wget --no-check-certificate --header="Content-Type: application/json" --post-data '{"type": "start", "user": "'$USR'", "hostname": "'$HOSTNAME'", "date": '`date +%s`', "exercise_number": "'$EXERCISE_NUM'", "ip": "'$IP'"}' $SERVER/gta -O /dev/null
elif [ "$TYPE" = "command" ]; then
    wget --no-check-certificate --header="Content-Type: application/json" --post-data '{"type": "command", "user": "'$USR'", "hostname": "'$HOSTNAME'", "date": '`date +%s`', "exercise_number": "'$EXERCISE_NUM'", "ip": "'$IP'", "level": "'$LVL'", "command": "'$CMD'"}' $SERVER/gta -O /dev/null
elif [ "$TYPE" = "passed" ]; then
    wget --no-check-certificate --header="Content-Type: application/json" --post-data '{"type": "passed", "user": "'$USR'", "hostname": "'$HOSTNAME'", "date": '`date +%s`', "exercise_number": "'$EXERCISE_NUM'", "ip": "'$IP'", "level": "'$LVL'", "command": "'$CMD'", "homedir": "'$HOME'", "hash": "'$HASH'"}' $SERVER/gta -O /dev/null
elif [ "$TYPE" = "exit" ]; then
    wget --no-check-certificate --header="Content-Type: application/json" --post-data '{"type": "exit", "user": "'$USR'", "hostname": "'$HOSTNAME'", "date": '`date +%s`', "exercise_number": "'$EXERCISE_NUM'", "ip": "'$IP'", "homedir": "'$HOME'", "hash": "'$HASH'"}' $SERVER/gta -O /dev/null
elif [ "$TYPE" = "help" ]; then
    wget --no-check-certificate --header="Content-Type: application/json" --post-data '{"type": "help", "user": "'$USR'", "hostname": "'$HOSTNAME'", "date": '"`date +%s`"', "exercise_number": "'$EXERCISE_NUM'", "level": "'$LVL'", "ip": "'$IP'"}' $SERVER/gta -O /dev/null
elif [ "$TYPE" = "ack" ]; then
    wget --no-check-certificate --header="Content-Type: application/json" --post-data '{"type": "ack", "user": "'$USR'", "hostname": "'$HOSTNAME'", "date": '"`date +%s`"', "exercise_number": "'$EXERCISE_NUM'", "level": "'$LVL'", "ip": "'$IP'"}' $SERVER/gta -O /dev/null
fi
