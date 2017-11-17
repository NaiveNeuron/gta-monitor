
# TODO: get computer's ip (preferably from eth0)

echo "Sending start of the exercise..."
wget --header="Content-Type: application/json" --post-data '{"type": "start", "user": "'$USER'", "hostname": "'`hostname`'", "date": "'"`date +%s`"'", "exercise_id": "3", "ip": "192.168.0.102"}' http://localhost:3000/gta -O /dev/null

#echo "Sending sample command..."

#echo "Sending passing command..."

#echo "Sending exit command..."
