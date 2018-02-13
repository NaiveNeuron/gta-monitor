
# TODO: get computer's ip (preferably from eth0)

EXERCISE_NUM=1
TYPE=$1
USR=${2:-`whoami`}
HOSTNAME=${3:-`hostname`}
IP=${4:-"158.195.28.190"}

if [ "$TYPE" = "start" ]; then
    wget --header="Content-Type: application/json" --post-data '{"type": "start", "user": "'$USR'", "hostname": "'$HOSTNAME'", "date": '"`date +%s`"', "exercise_number": '$EXERCISE_NUM', "ip": "'$IP'"}' http://localhost:3000/gta -O /dev/null
elif [ "$TYPE" = "command" ]; then
    wget --header="Content-Type: application/json" --post-data '{"type": "command", "user": "'$USR'", "hostname": "'$HOSTNAME'", "date": '"`date +%s`"', "exercise_number": '$EXERCISE_NUM', "ip": "'$IP'", "level": 1, "command": "ls -l"}' http://localhost:3000/gta -O /dev/null
elif [ "$TYPE" = "passed" ]; then
    wget --header="Content-Type: application/json" --post-data '{"type": "passed", "user": "'$USR'", "hostname": "'$HOSTNAME'", "date": '"`date +%s`"', "exercise_number": '$EXERCISE_NUM', "ip": "'$IP'", "level": 1, "command": "ls -l"}' http://localhost:3000/gta -O /dev/null
elif [ "$TYPE" = "exit" ]; then
    wget --header="Content-Type: application/json" --post-data '{"type": "exit", "user": "'$USR'", "hostname": "'$HOSTNAME'", "date": '"`date +%s`"', "exercise_number": '$EXERCISE_NUM', "ip": "'$IP'"}' http://localhost:3000/gta -O /dev/null
fi
