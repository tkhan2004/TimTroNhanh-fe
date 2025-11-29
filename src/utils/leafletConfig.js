/**
 * Leaflet Map Configuration
 * Default settings for map integration
 */

export const LEAFLET_CONFIG = {
    // Default center (Vietnam - Hanoi)
    defaultCenter: [21.0285, 105.8542],

    // Default zoom level
    defaultZoom: 13,

    // Vietnam bounds
    vietnamBounds: [
        [8.1790665, 102.14441],  // Southwest
        [23.393395, 109.46994]    // Northeast
    ],

    // Tile layer (OpenStreetMap)
    tileLayer: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        minZoom: 5
    },

    // Marker icon settings
    markerIcon: {
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }
}

/**
 * Get coordinates for major Vietnamese cities
 */
export const CITY_COORDINATES = {
    'TP Hồ Chí Minh': [10.8231, 106.6297],
    'Hồ Chí Minh': [10.8231, 106.6297],
    'Hà Nội': [21.0285, 105.8542],
    'Đà Nẵng': [16.0544, 108.2022],
    'Hải Phòng': [20.8449, 106.6881],
    'Cần Thơ': [10.0452, 105.7469],
    'Biên Hòa': [10.9510, 106.8439],
    'Nha Trang': [12.2388, 109.1967],
    'Huế': [16.4637, 107.5909],
    'Buôn Ma Thuột': [12.6667, 108.0500]
}

/**
 * Get center coordinates for a city
 * @param {string} cityName - City name
 * @returns {Array} [lat, lng]
 */
export function getCityCenter(cityName) {
    return CITY_COORDINATES[cityName] || LEAFLET_CONFIG.defaultCenter
}

export default LEAFLET_CONFIG
