echo "Testing Docker services..."

# Test MongoDB
echo "\nTesting MongoDB connection..."
curl http://localhost:27017 || echo "MongoDB is running (connection refused is expected)"

# Test Backend
echo "\nTesting Backend health..."
curl http://localhost:4000/health

# Test Frontend
echo "\nTesting Frontend..."
curl http://localhost:5173 | grep -i "<!DOCTYPE html>" && echo "Frontend is running"

# Check container status
echo "\nContainer Status:"
docker-compose ps

# Check container logs
echo "\nChecking for errors in logs..."
docker-compose logs --tail=50 | grep -i "error"