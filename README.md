# RescueRoute AI

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![Python](https://img.shields.io/badge/python-3.9%2B-blue)

**Intelligent Emergency Response System** that optimizes emergency vehicle routing, traffic signal control, and resource allocation using real-time data, machine learning, and advanced algorithms.

## 🚀 Features

- 🚑 **Real-time Vehicle Tracking** - Track emergency vehicles with 2-second updates
- 🗺️ **Dynamic Route Optimization** - Modified Dijkstra's algorithm with traffic-aware routing
- 🚦 **Smart Traffic Signal Control** - Priority control with green wave coordination
- 🤖 **ML-Based Predictions** - Accident prediction, ETA estimation, traffic patterns
- 🌐 **Bilingual Support** - English/Hindi with real-time translation
- 📊 **Live Analytics Dashboard** - Real-time statistics and monitoring
- 🔥 **Accident Hotspot Detection** - K-Means clustering for risk analysis
- 💬 **Collaborative Chat** - Emergency coordination with auto-translation

## 📁 Project Structure

```
rescueroute-ai/
├── frontend/          # Next.js 14 frontend application
├── backend/           # Express.js API server
├── ml-service/        # Python Flask ML microservice
├── socket-server/     # Dedicated Socket.io server
├── docker/            # Docker configuration
└── docs/              # Project documentation
```

## 🛠️ Technology Stack

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Real-time**: Socket.io-client
- **Internationalization**: i18next
- **Maps**: Leaflet / MapBox
- **Charts**: Recharts

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose)
- **Cache**: Redis
- **Real-time**: Socket.io
- **Authentication**: JWT
- **Validation**: express-validator

### ML Service

- **Language**: Python 3.9+
- **Framework**: Flask
- **ML Libraries**: TensorFlow, scikit-learn
- **Data Processing**: pandas, numpy

### Infrastructure

- **Containerization**: Docker
- **Orchestration**: Docker Compose

## 📋 Prerequisites

- Node.js >= 18.0.0
- Python >= 3.9
- MongoDB >= 5.0
- Redis >= 6.0
- Docker & Docker Compose (optional)

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd rescueroute-ai

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

Services will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- ML Service: http://localhost:5001
- Socket Server: http://localhost:3001

### Option 2: Manual Setup

#### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration

# Start MongoDB and Redis
# Make sure MongoDB is running on localhost:27017
# Make sure Redis is running on localhost:6379

# Run database migrations/seeding
npm run seed

# Start development server
npm run dev
```

#### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.local.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

#### 3. ML Service Setup

```bash
cd ml-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start Flask server
python api/app.py
```

#### 4. Socket Server Setup

```bash
cd socket-server

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Start server
npm run dev
```

## 🔧 Configuration

### Backend Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/rescueroute
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your_jwt_secret_key_here
SOCKET_SERVER_URL=http://localhost:3001
ML_SERVICE_URL=http://localhost:5001
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### Frontend Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_ML_API_URL=http://localhost:5001
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

## 📚 Key Algorithms

### 1. Modified Dijkstra's Algorithm

- **Purpose**: Emergency vehicle route optimization
- **Features**: Dynamic edge weights based on traffic, weather, and signal timing
- **Location**: `backend/src/services/algorithms/dijkstra.js`

### 2. Priority Queue (Max Heap)

- **Purpose**: Emergency vehicle signal prioritization
- **Complexity**: O(log n) insert and extract operations
- **Location**: `backend/src/services/algorithms/priorityQueue.js`

### 3. K-Means & DBSCAN Clustering

- **Purpose**: Accident hotspot identification
- **Features**: Geographic clustering with severity weights
- **Location**: `backend/src/services/algorithms/clustering.js`

### 4. Resource Allocation

- **Purpose**: Optimal vehicle deployment
- **Algorithm**: Greedy + Dynamic Programming
- **Location**: `backend/src/services/algorithms/resourceAllocation.js`

### 5. Traffic Prediction

- **Purpose**: Predict traffic density 30 minutes ahead
- **Method**: Graph theory + Sliding window analysis
- **Location**: `backend/src/services/algorithms/trafficPrediction.js`

## 🤖 Machine Learning Models

1. **Accident Prediction** - Risk scoring based on location and conditions
2. **ETA Estimation** - Gradient Boosting for accurate arrival times
3. **Traffic Pattern Recognition** - LSTM for time-series traffic analysis
4. **Signal Optimization** - Q-Learning for adaptive signal timing
5. **Emergency Classification** - NLP-based emergency type detection

See [ML-MODELS.md](docs/ML-MODELS.md) for detailed documentation.

## 📡 Socket.io Namespaces

- `/emergency` - Emergency coordination and status updates
- `/vehicle` - Real-time vehicle location tracking
- `/traffic` - Traffic density and congestion updates
- `/signal` - Traffic signal priority control
- `/chat` - Bilingual emergency coordination chat
- `/analytics` - Live dashboard statistics

## 🔐 Authentication & Authorization

### User Roles

- **Citizen**: Report emergencies, view status
- **Emergency Driver**: Receive assignments, update location
- **Traffic Controller**: Manage signals, monitor traffic
- **Admin**: Full system access

### API Authentication

All API endpoints (except auth routes) require JWT token:

```javascript
headers: {
  'Authorization': 'Bearer <your_jwt_token>'
}
```

## 📊 API Documentation

See [API.md](docs/API.md) for complete API documentation with examples.

### Key Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/emergency/create
GET    /api/emergency
GET    /api/emergency/:id
PUT    /api/emergency/:id
GET    /api/vehicle
PUT    /api/vehicle/:id/location
GET    /api/traffic
GET    /api/signal
POST   /api/signal/priority
GET    /api/analytics
GET    /api/analytics/hotspots
POST   /api/translation/translate
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# ML service tests
cd ml-service
pytest
```

## 📦 Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for production deployment guide.

### Quick Deploy with Docker

```bash
# Build and push images
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml push

# Deploy to server
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developers**: Your Team Name
- **Contact**: your.email@example.com

## 🙏 Acknowledgments

- OpenStreetMap for map data
- MongoDB for database platform
- Socket.io for real-time communication
- TensorFlow for ML capabilities

## 📮 Support

For support, email your.email@example.com or open an issue in the repository.

---

**Built with ❤️ for saving lives through technology**
#   R e s c u e R o u t e - A I  
 