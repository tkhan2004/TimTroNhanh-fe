<template>
  <div class="address-input">
    <!-- City/Province -->
    <div class="form-group">
      <label for="city">Tỉnh/Thành phố <span v-if="required" class="required">*</span></label>
      <select 
        id="city"
        v-model="selectedCity"
        @change="onCityChange"
        :disabled="disabled"
        :required="required"
        class="form-select"
      >
        <option value="">-- Chọn Tỉnh/Thành phố --</option>
        <option 
          v-for="province in provinces" 
          :key="province.code" 
          :value="province.code"
        >
          {{ province.name }}
        </option>
      </select>
    </div>

    <!-- District -->
    <div class="form-group">
      <label for="district">Quận/Huyện <span v-if="required" class="required">*</span></label>
      <select 
        id="district"
        v-model="selectedDistrict"
        @change="onDistrictChange"
        :disabled="disabled || !selectedCity"
        :required="required"
        class="form-select"
      >
        <option value="">-- Chọn Quận/Huyện --</option>
        <option 
          v-for="district in districts" 
          :key="district.code" 
          :value="district.code"
        >
          {{ district.name }}
        </option>
      </select>
    </div>

    <!-- Ward -->
    <div class="form-group">
      <label for="ward">Phường/Xã <span v-if="required" class="required">*</span></label>
      <select 
        id="ward"
        v-model="selectedWard"
        @change="onWardChange"
        :disabled="disabled || !selectedDistrict"
        :required="required"
        class="form-select"
      >
        <option value="">-- Chọn Phường/Xã --</option>
        <option 
          v-for="ward in wards" 
          :key="ward.code" 
          :value="ward.code"
        >
          {{ ward.name }}
        </option>
      </select>
    </div>

    <!-- Detailed Address -->
    <div class="form-group">
      <label for="address">Địa chỉ chi tiết <span v-if="required" class="required">*</span></label>
      <input 
        id="address"
        type="text"
        v-model="detailedAddress"
        @input="onAddressChange"
        :disabled="disabled"
        :required="required"
        placeholder="Số nhà, tên đường..."
        class="form-input"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { vietnamAddressService } from '@/services/vietnamAddressService'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

// State
const provinces = ref([])
const districts = ref([])
const wards = ref([])

const selectedCity = ref('')
const selectedDistrict = ref('')
const selectedWard = ref('')
const detailedAddress = ref('')

// City names for display
const cityName = ref('')
const districtName = ref('')
const wardName = ref('')

// Load provinces on mount
onMounted(async () => {
  provinces.value = await vietnamAddressService.getProvinces()
  
  // Set initial values if provided
  if (props.modelValue.city) {
    const province = provinces.value.find(p => p.name === props.modelValue.city)
    if (province) {
      selectedCity.value = province.code
      await onCityChange()
    }
  }
})

// Helper to remove Vietnamese accents
const removeAccents = (str) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
}

// Helper for fuzzy matching strings
const isMatch = (str1, str2) => {
  if (!str1 || !str2) return false
  
  // Normalize function: lowercase, remove accents, remove common prefixes/suffixes
  const normalize = (s) => {
    let str = removeAccents(s.toLowerCase())
    
    // Remove common administrative prefixes (Vietnamese & English)
    str = str.replace(/^(tinh|thanh pho|tp\.?|quan|huyen|thi xa|phuong|xa|thi tran)\s+/g, '')
    str = str.replace(/\s+(province|city|district|ward|town|commune)$/g, '')
    
    // Handle specific cases like "District 1" -> "1"
    str = str.replace(/^district\s+(\d+)$/g, '$1')
    str = str.replace(/^quan\s+(\d+)$/g, '$1')
    
    return str.trim()
  }
  
  const s1 = normalize(str1)
  const s2 = normalize(str2)
  
  // Exact match after normalization
  if (s1 === s2) return true
  
  // Contains match (e.g. "Thu Duc" in "Thanh pho Thu Duc")
  if (s1.length > 2 && s2.length > 2) {
    return s1.includes(s2) || s2.includes(s1)
  }
  
  return false
}

// Unified function to update address from props sequentially
const updateAddressFromProps = async () => {
  // 1. Update City
  if (props.modelValue.city && props.modelValue.city !== cityName.value) {
    const province = provinces.value.find(p => isMatch(p.name, props.modelValue.city))
    if (province) {
      selectedCity.value = province.code
      await onCityChange(false) // false = don't emit yet
    }
  }

  // 2. Update District (wait for districts to load)
  if (props.modelValue.district && props.modelValue.district !== districtName.value && selectedCity.value) {
    // Ensure districts are loaded
    if (districts.value.length === 0) {
      districts.value = await vietnamAddressService.getDistricts(selectedCity.value)
    }
    
    const district = districts.value.find(d => isMatch(d.name, props.modelValue.district))
    if (district) {
      selectedDistrict.value = district.code
      await onDistrictChange(false) // false = don't emit yet
    }
  }

  // 3. Update Ward (wait for wards to load)
  if (props.modelValue.ward && props.modelValue.ward !== wardName.value && selectedDistrict.value) {
    // Ensure wards are loaded
    if (wards.value.length === 0) {
      wards.value = await vietnamAddressService.getWards(selectedDistrict.value)
    }
    
    const ward = wards.value.find(w => isMatch(w.name, props.modelValue.ward))
    if (ward) {
      selectedWard.value = ward.code
      onWardChange(false) // false = don't emit yet
    }
  }
  
  // 4. Update Detailed Address
  if (props.modelValue.address !== detailedAddress.value) {
    detailedAddress.value = props.modelValue.address || ''
  }
}

// Watch for ANY change in modelValue (deep watch)
watch(() => props.modelValue, async (newVal) => {
  await updateAddressFromProps()
}, { deep: true })

// Modify handlers to accept a flag to suppress emit
const onCityChange = async (shouldEmit = true) => {
  const province = provinces.value.find(p => p.code === selectedCity.value)
  cityName.value = province?.name || ''
  
  // Reset lower levels
  if (shouldEmit) {
    selectedDistrict.value = ''
    selectedWard.value = ''
    districtName.value = ''
    wardName.value = ''
    districts.value = []
    wards.value = []
  }
  
  if (selectedCity.value) {
    districts.value = await vietnamAddressService.getDistricts(selectedCity.value)
  }
  
  if (shouldEmit) emitValue()
}

const onDistrictChange = async (shouldEmit = true) => {
  const district = districts.value.find(d => d.code === selectedDistrict.value)
  districtName.value = district?.name || ''
  
  // Reset lower levels
  if (shouldEmit) {
    selectedWard.value = ''
    wardName.value = ''
    wards.value = []
  }
  
  if (selectedDistrict.value) {
    wards.value = await vietnamAddressService.getWards(selectedDistrict.value)
  }
  
  if (shouldEmit) emitValue()
}

const onWardChange = (shouldEmit = true) => {
  const ward = wards.value.find(w => w.code === selectedWard.value)
  wardName.value = ward?.name || ''
  if (shouldEmit) emitValue()
}

const onAddressChange = () => {
  emitValue()
}

const emitValue = () => {
  emit('update:modelValue', {
    city: cityName.value,
    district: districtName.value,
    ward: wardName.value,
    address: detailedAddress.value
  })
}
</script>

<style scoped>
.address-input {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.required {
  color: #ef4444;
}

.form-select,
.form-input {
  padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.form-select:focus,
.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-select:disabled,
.form-input:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
  opacity: 0.6;
}

.form-input::placeholder {
  color: #9ca3af;
}
</style>
