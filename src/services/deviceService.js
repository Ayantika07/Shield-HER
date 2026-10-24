// Device & Sensor Services: Battery Status, Geolocation, Web Share

// ----------------- BATTERY MONITOR SERVICE -----------------
export async function getBatteryStatus() {
  if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
    try {
      const battery = await navigator.getBattery();
      return {
        supported: true,
        level: Math.round(battery.level * 100),
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime,
        batteryRef: battery
      };
    } catch {
      return { supported: false, level: null, charging: null };
    }
  }
  return { supported: false, level: null, charging: null };
}

// ----------------- GEOLOCATION SERVICE -----------------
export function getCurrentCoordinates() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser or device.'));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 10000
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy),
          altitude: position.coords.altitude,
          timestamp: new Date(position.timestamp).toISOString()
        });
      },
      (error) => {
        let msg = 'Unable to retrieve your location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please allow location access in your browser settings to share your live coordinates.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location information is currently unavailable from your device sensors.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out. Please check GPS settings.';
        }
        reject(new Error(msg));
      },
      options
    );
  });
}

// Reverse Geocode (Coordinates -> Street Address) using OSM Nominatim with timeout
export async function reverseGeocode(lat, lng) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        signal: controller.signal,
        headers: { 'Accept': 'application/json', 'User-Agent': 'ShieldHerSafetyApp/1.0' }
      }
    );
    clearTimeout(timeoutId);
    if (!response.ok) return null;
    const data = await response.json();
    return data.display_name || null;
  } catch {
    return null; // Return null if offline or timed out
  }
}

// Format an emergency text message for WhatsApp, SMS, or Clipboard
export function createEmergencyMessage({ userName, coordinates, address, customNote = '' }) {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const lat = coordinates?.latitude ? coordinates.latitude.toFixed(5) : 'Unknown';
  const lng = coordinates?.longitude ? coordinates.longitude.toFixed(5) : 'Unknown';
  const mapsUrl = coordinates?.latitude
    ? `https://maps.google.com/?q=${lat},${lng}`
    : 'Location coordinates unavailable';

  return `EMERGENCY ALERT from ${userName || 'SHIELD HER User'} at ${time}:
I am requesting urgent assistance.
${customNote ? `Note: ${customNote}\n` : ''}
Current Location: ${address || 'Near coordinates'}
Coordinates: ${lat}, ${lng} (Accuracy: ~${coordinates?.accuracy || 15}m)
Map Link: ${mapsUrl}

Sent via SHIELD HER Safety Platform. If I am unreachable, please call 112 immediately.`;
}

// Trigger Web Share API or Clipboard Copy Fallback
export async function shareEmergencyAlert(alertData) {
  const text = createEmergencyMessage(alertData);

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'EMERGENCY ALERT - SHIELD HER',
        text: text
      });
      return { success: true, method: 'web-share' };
    } catch (err) {
      if (err.name === 'AbortError') {
        return { success: false, aborted: true };
      }
      // Otherwise fall through to clipboard
    }
  }

  // Fallback to clipboard
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    return { success: true, method: 'clipboard', text };
  }

  return { success: false, text };
}
