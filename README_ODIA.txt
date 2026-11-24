# BEAST AI ULTRA — Android starter

## What this starter includes
- Black / neon-blue assistant dashboard.
- Gemini and OpenAI model selector.
- Settings fields for the user's own API keys.
- Text chat requests to Gemini and OpenAI.
- A first-pass browser speech input button (support depends on Android WebView).
- GitHub Actions workflow that builds a debug APK and uploads it as an artifact.

## Important limitations
- This is a starter app, not the complete JARVIS 5.76 / Stonic AI feature set.
- Offline AI is a placeholder; a local model runtime must be integrated and tested on the target phone.
- Android automation, always-on wake word, avatar animation, image/video generation, and YouTube analysis are not implemented yet.
- API keys are stored in local browser storage for this personal prototype. Do not distribute this APK with personal keys saved. A production app should call a secure backend and protect user credentials.
- The Gemini model name may need updating based on current model availability and account access.

## Build APK using GitHub from a phone
1. Create a new GitHub repository named `beast-ai-ultra`.
2. Upload all files and folders from this ZIP to the repository root.
3. Open the repository's **Actions** tab.
4. Select **Build BEAST AI ULTRA APK** and press **Run workflow** (or push to `main`).
5. Wait for the workflow to finish successfully.
6. Open that workflow run, find **Artifacts**, and download `BEAST-AI-ULTRA-debug-apk`.
7. Extract the downloaded ZIP and install `app-debug.apk`. Android may ask you to allow installation from that browser/file manager.

If GitHub asks for permissions, allow the workflow to run. Never share your API keys in GitHub files, chat, or screenshots.
