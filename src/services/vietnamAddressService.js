import axios from 'axios'

/**
 * Vietnam Address Service
 * Uses free API: https://provinces.open-api.vn/api/
 */

const ADDRESS_API_BASE = 'https://provinces.open-api.vn/api'

export const vietnamAddressService = {
    /**
     * Get all provinces/cities in Vietnam
     * @returns {Promise<Array>} List of provinces
     */
    async getProvinces() {
        try {
            const response = await axios.get(`${ADDRESS_API_BASE}/p/`)
            return response.data || []
        } catch (error) {
            console.error('Error fetching provinces:', error)
            return []
        }
    },

    /**
     * Get districts by province code
     * @param {number} provinceCode - Province code
     * @returns {Promise<Array>} List of districts
     */
    async getDistricts(provinceCode) {
        try {
            const response = await axios.get(`${ADDRESS_API_BASE}/p/${provinceCode}?depth=2`)
            return response.data?.districts || []
        } catch (error) {
            console.error('Error fetching districts:', error)
            return []
        }
    },

    /**
     * Get wards by district code
     * @param {number} districtCode - District code
     * @returns {Promise<Array>} List of wards
     */
    async getWards(districtCode) {
        try {
            const response = await axios.get(`${ADDRESS_API_BASE}/d/${districtCode}?depth=2`)
            return response.data?.wards || []
        } catch (error) {
            console.error('Error fetching wards:', error)
            return []
        }
    },

    /**
     * Search provinces by name
     * @param {string} query - Search query
     * @returns {Promise<Array>} Filtered provinces
     */
    async searchProvinces(query) {
        const provinces = await this.getProvinces()
        if (!query) return provinces

        const lowerQuery = query.toLowerCase()
        return provinces.filter(p =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.name_en?.toLowerCase().includes(lowerQuery)
        )
    }
}

export default vietnamAddressService
