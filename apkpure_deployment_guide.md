# 🤖 APKPure Step-by-Step Publishing Guide

Publishing your app on **APKPure** is **100% free ($0)** and has no developer registration fees (unlike Google Play's $25 fee). It is one of the largest alternative Android app stores in the world, with over 100 million active users.

Follow these step-by-step instructions to compile your APK and publish it live on APKPure.

---

## 🛠️ Step 1: Generate your APK Installer File

APKPure accepts standard Android `.apk` files. We will use Expo's **EAS Build** free tier to compile the app.

1. Open your terminal and navigate to the mobile project folder:
   ```powershell
   cd c:\Users\Miqdaam\Downloads\Tax-Assistant-Pro\artifacts\mobile
   ```

2. Make sure the EAS CLI is installed:
   ```powershell
   npm install -g eas-cli
   ```

3. Log in with your free Expo account (create one at [expo.dev](https://expo.dev) if you haven't already):
   ```powershell
   eas login
   ```

4. Run the production build command to create the APK:
   ```powershell
   eas build --platform android --profile production
   ```
   *Note: Because we configured your `eas.json` build profile, this command will output a standard `.apk` file instead of an `.aab` file.*

5. When the build completes, EAS will print a URL in your terminal. **Click the URL to download your finished `.apk` file** (e.g., `application-prod.apk`) to your computer.

---

## 🔑 Step 2: Create a Free APKPure Developer Account

1. Open your browser and go to the **[APKPure Developer Console](https://developer.apkpure.com/)**.
2. Click **Sign Up** to register a free developer account.
3. Fill in your email, set a password, and verify your email address.
4. Complete your developer profile (enter your Developer Name, e.g., "Miqdaam" or your company name).

---

## 📦 Step 3: Upload and Describe Your App

1. In the APKPure Developer Console dashboard, click **"Add New App"** (or **"Create App"**).
2. Choose your app's default language (English or Urdu) and select **Android** as the platform.
3. **Upload the APK:**
   * Drag and drop the `.apk` file you downloaded in Step 1.
   * APKPure will parse the file, read the package name (`com.taxhelper`), version code (`1.0.0`), and verify the integrity.

4. **Fill in App Information:**
   * **App Name:** `Tax Helper - Pakistan FBR Calculator`
   * **Category:** `Finance` (or `Business`)
   * **Short Description:** *A free, offline-first Pakistan income tax estimator for Tax Year 2024–25.*
   * **Full Description:** Describe the key features (5-step wizard, salaried/non-salaried slabs, 0.25% IT freelancer rate, widow tax relief, offline calculations, and the legal disclaimers). You can copy the description from your LinkedIn post or README!

---

## 🖼️ Step 4: Add Store Assets (Icon & Screenshots)

To make your store listing look professional, upload your assets:

1. **App Icon:**
   * Upload the `icon.png` (which is located in your project root folder). It is already formatted at the correct resolution.
2. **Screenshots:**
   * Upload at least 3-4 screenshots of your app running (you can take these while testing the web version or simulator).
   * Include the *Home page*, *Income Input step*, and the *Results summary page*.
3. **Privacy Policy (Optional but recommended):**
   * Enter a URL to your privacy policy (you can host a simple markdown privacy policy page on your Vercel website).

---

## 🚀 Step 5: Submit and Publish

1. Review all the information to ensure everything is correct.
2. Click **"Submit for Review"**.
3. **Review Timeline:** APKPure reviews submissions very quickly (usually within **1–24 hours**).
4. Once approved, your app will be live on APKPure! You will get a shareable URL (e.g., `https://apkpure.com/tax-helper-pakistan/...`) that anyone can click to install the app natively on their Android phone.

---

## 💡 Professional Tip: Combine Web & APK Links
If you deploy the web version of your app to **Vercel** for free:
1. Put a prominent download button on your landing page saying **"Download for Android (Free)"**.
2. Link that button directly to your **APKPure** listing.
3. This gives your iOS users a web version they can install via "Add to Home Screen," and Android users a fast way to get the native app — all for **exactly $0**.
