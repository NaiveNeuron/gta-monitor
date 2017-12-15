
# TODO: get computer's ip (preferably from eth0)

EXERCISE_NUM=1
USR=${1:-`whoami`}
HOSTNAME=${2:-`hostname`}

echo "Sending start of the exercise..."
wget --header="Content-Type: application/json" --post-data '{"type": "start", "user": "'$USR'", "hostname": "'$HOSTNAME'", "date": '"`date +%s`"', "exercise_number": '$EXERCISE_NUM', "ip": "192.168.0.102"}' http://localhost:3000/gta -O /dev/null

#echo "Sending sample command..."
wget --header="Content-Type: application/json" --post-data '{"type": "command", "user": "'$USR'", "hostname": "'`$HOSTNAME`'", "date": '"`date +%s`"', "exercise_number": '$EXERCISE_NUM', "ip": "192.168.0.102", "level": 1, "command": "ls -l"}' http://localhost:3000/gta -O /dev/null

#echo "Sending passing command..."

#echo "Sending exit command..."
