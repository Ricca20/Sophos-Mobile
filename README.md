# Sophos Mobile

Expo Go mobile application for the Health Direct Patient Portal.

## What this app is

This project is the React Native mobile client for the existing `health-direct-patient` backend. The structure mirrors the web app flows:

- Patient authentication & session persistence
* Interactive doctor directory
- Appointments & application records entry points
- Early Detection notifications
- Collapsible detailed profile editing (matching web client schemas)
- Document upload and profile image picker

---

## ⚙️ Environment & Backend Setup (.env)

The app connects to the `health-direct-patient` Node.js backend. To allow your testing device (physical phone or emulator) to reach the API server running on your machine, you **must use your computer's local network IP** instead of `localhost`.

### 1. Get your Local LAN IP
On your Mac, open the terminal and run:
```bash
ipconfig getifaddr en0
```
*(Example Output: `172.28.8.106`)*

### 2. Configure `.env`
Create or modify the `.env` file in the root directory and update `EXPO_PUBLIC_API_BASE_URL` with your IP and the backend port (`5004`):
```env
# Change the IP below to your computer's current LAN IP:
EXPO_PUBLIC_API_BASE_URL=http://172.28.8.106:5004/api
EXPO_PUBLIC_APP_NAME="Health Direct"
```

### 3. Network Checklist
* ⚠️ **Same WiFi**: The mobile device (running Expo Go) and your Mac **must be connected to the exact same WiFi network**.
* ⚠️ **HTTP Protocol**: Use `http://` and not `https://` for local development.

### 4. Restart Metro Bundler
Expo caches `.env` values on startup. Whenever you change `.env`, always restart the server with the cache cleared:
```bash
npm run start -- --clear
```

---

## 🚀 Features Implemented

The mobile application has been fully completed and aligned with the web portal. Here is a summary of the implementation features:

### 1. Collapsible Profile Section Cards
* The profile screen is structured into **11 collapsible sections** (Basic Information, Contacts, Documents, Address, Personal Data, Disability, Disease Records, Final Diagnosis Records, Radiation Doses, Legal Representatives, and Additional Notes).
* Integrated custom Feather/Ionicons chevrons to signal state changes. Section division headers collapse dynamically to keep the layout compact and interactive.

### 2. Profile Picture Upload & Authenticated Loading
* **Device Image Picker**: Tapping the profile header avatar launches the native image library (via `expo-image-picker`), requests access permissions, and uploads the selected image as a multipart form data file.
* **Authenticated Loading**: The frontend fetches and displays the image dynamically from `/profile/image/:fileId` passing authorization headers with the patient's JWT token.

### 3. Complex Document & Subschema Collection Support
* Dynamic array states allow adding, editing, and deleting records inside **Disease Records**, **Final Diagnoses**, **Radiation Doses**, and **Legal Representatives**.
* Subschema dates integrate with the central calendar modal, automatically serializing input records to ISO format and filtering empty draft entries prior to saving.

### 4. Custom Phone Input with Flag & Country Picker
* Integrated a premium phone number field displaying the country's flag and dialing code prefix.
* Tapping the flag opens an interactive selector containing 211 countries with a search bar to filter by country name, code, or dial prefix. Automatically parses incoming numbers back to standard database formats.

### 5. App-Wide Premium Toast Notifications
* A slide-down premium toast notification context (`ToastContext`) that alerts the user on validation errors (red theme), save successes (green theme), or actions. Replace simple blocking native alerts.

### 6. Glow-Highlight Capsule Bottom Tab Bar
* Redesigned bottom navigation bar to span full screen width with custom rounded top corners. Active tabs feature a blue glow highlight mimicking modern premium interface designs.

---

## 🛠️ Run Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the Expo development server:
   ```bash
   npm start
   ```
3. Run on your desired platform:
   * **Web Preview**: `npm run web` (Opens browser on `http://localhost:8081`)
   * **iOS Simulator**: `npm run ios`
   * **Android Emulator**: `npm run android`
