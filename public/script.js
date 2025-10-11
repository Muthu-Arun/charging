
document.addEventListener('DOMContentLoaded', () => {
    const stationsContainer = document.getElementById('stations-container');
    const themeSwitcher = document.getElementById('theme-switcher');
    const numberOfStations = 4;

    // Theme switcher logic
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }

    themeSwitcher.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        let theme = 'light';
        if (document.body.classList.contains('dark-theme')) {
            theme = 'dark';
        }
        localStorage.setItem('theme', theme);
    });

    // Function to create a single station element
    const createStationElement = (stationId) => {
        const stationDiv = document.createElement('div');
        stationDiv.classList.add('station');
        stationDiv.dataset.stationId = stationId;

        stationDiv.innerHTML = `
            <div class="station-header">
                <h2 class="station-title">Station ${stationId}</h2>
                <p>Status: <span class="status available" id="status-${stationId}">Available</span></p>
            </div>
            <div class="station-body">
                <div class="form-group">
                    <label for="vehicle-id-${stationId}">Vehicle ID:</label>
                    <input type="text" id="vehicle-id-${stationId}" placeholder="Enter Vehicle ID">
                </div>
            </div>
            <div class="station-footer">
                <button class="btn btn-primary start-charging" data-station-id="${stationId}">Start Charging</button>
                <button class="btn btn-danger stop-charging" data-station-id="${stationId}">Stop Charging</button>
            </div>
        `;

        return stationDiv;
    };

    // Function to get charger status
    const getChargerStatus = async (stationId) => {
        try {
            const response = await fetch(`/api/charger/${stationId}/status`);
            const data = await response.json();
            const statusElement = document.getElementById(`status-${stationId}`);
            statusElement.textContent = data.status;
            statusElement.className = `status ${data.status.toLowerCase()}`;
        } catch (error) {
            console.error(`Error getting status for station ${stationId}:`, error);
        }
    };

    // Function to start charging
    const startCharging = async (stationId) => {
        const vehicleIdInput = document.getElementById(`vehicle-id-${stationId}`);
        const vehicleId = vehicleIdInput.value;

        if (!vehicleId) {
            alert('Please enter a Vehicle ID');
            return;
        }

        try {
            const response = await fetch(`/api/charger/${stationId}/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ vehicleId }),
            });
            const data = await response.json();
            alert(data.message);
            getChargerStatus(stationId);
        } catch (error) {
            console.error(`Error starting charging for station ${stationId}:`, error);
        }
    };

    // Function to stop charging
    const stopCharging = async (stationId) => {
        const vehicleIdInput = document.getElementById(`vehicle-id-${stationId}`);
        const vehicleId = vehicleIdInput.value;

        if (!vehicleId) {
            alert('Please enter a Vehicle ID');
            return;
        }

        try {
            const response = await fetch(`/api/charger/${stationId}/stop`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ vehicleId }),
            });
            const data = await response.json();
            alert(data.message);
            getChargerStatus(stationId);
        } catch (error) {
            console.error(`Error stopping charging for station ${stationId}:`, error);
        }
    };

    // Create and append stations
    for (let i = 1; i <= numberOfStations; i++) {
        const stationElement = createStationElement(i);
        stationsContainer.appendChild(stationElement);
        getChargerStatus(i);
    }

    // Add event listeners for all start/stop buttons
    stationsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('start-charging')) {
            const stationId = event.target.dataset.stationId;
            startCharging(stationId);
        }
        if (event.target.classList.contains('stop-charging')) {
            const stationId = event.target.dataset.stationId;
            stopCharging(stationId);
        }
    });
});
