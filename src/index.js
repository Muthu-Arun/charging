const express = require('express');
const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// In-memory state for the chargers
const numberOfStations = 4;
const stations = {};
for (let i = 1; i <= numberOfStations; i++) {
    stations[i] = {
        status: 'Available',
        chargingVehicleId: null,
    };
}

// API Routes
app.get('/api/charger/:stationId/status', (req, res) => {
    const { stationId } = req.params;
    if (stations[stationId]) {
        res.json({ status: stations[stationId].status });
    } else {
        res.status(404).json({ message: 'Station not found' });
    }
});

app.post('/api/charger/:stationId/start', (req, res) => {
    const { stationId } = req.params;
    const { vehicleId } = req.body;

    if (stations[stationId] && stations[stationId].status === 'Available') {
        stations[stationId].status = 'Charging';
        stations[stationId].chargingVehicleId = vehicleId;
        res.json({ message: `Charging started for vehicle ${vehicleId} at station ${stationId}` });
    } else if (!stations[stationId]) {
        res.status(404).json({ message: 'Station not found' });
    } else {
        res.status(400).json({ message: `Station ${stationId} is not available` });
    }
});

app.post('/api/charger/:stationId/stop', (req, res) => {
    const { stationId } = req.params;
    const { vehicleId } = req.body;

    if (stations[stationId] && stations[stationId].status === 'Charging' && stations[stationId].chargingVehicleId === vehicleId) {
        stations[stationId].status = 'Available';
        stations[stationId].chargingVehicleId = null;
        res.json({ message: `Charging stopped for vehicle ${vehicleId} at station ${stationId}` });
    } else if (!stations[stationId]) {
        res.status(404).json({ message: 'Station not found' });
    } else {
        res.status(400).json({ message: `Station ${stationId} is not charging this vehicle` });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`EV charging station server listening at http://localhost:${port}`);
});