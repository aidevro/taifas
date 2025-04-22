cd /opt/taifas
while true; do
    docker-compose logs -f | grep -v -E 'mongodb'
    echo "Command stopped, restarting..."
    sleep 1  # Add a small delay to prevent rapid looping if the command fails immediately
done
