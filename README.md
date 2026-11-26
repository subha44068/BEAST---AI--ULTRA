# BEAST AI ULTRA — upgraded starter

## Included
- Gemini and OpenAI chat selection
- Conversation context (recent messages)
- Selectable assistant personality
- Browser speech input and speech output where supported
- Experimental in-page “Jarvis” wake-word listener
- Device-local notes using `remember that ...`
- Futuristic dashboard and AI tool prompt shortcuts
- Original uploaded files preserved as `*.original`

## Run
Keep `index.html`, `style.css`, and `app.js` in the same folder and open `index.html` in a modern browser, or host the folder on HTTPS. Browser speech recognition often requires HTTPS and may not work in every Android WebView.

## Important limitations
This is a web starter, not a complete native Android assistant. It does not yet provide:
- always-on background wake word (requires native Android foreground service and microphone permission)
- direct Android phone automation (requires native Android integration and user-granted permissions)
- real 3D avatar/animation rig (requires avatar assets and rendering integration)
- actual image/video generation (requires a selected provider and backend/API integration)
- live weather/news, YouTube or screen analysis (requires connected data/services and explicit user input)
- true offline model (requires a compatible local model/runtime)

API keys are stored in browser localStorage for local testing only. Do not publish this frontend with personal API keys. A production app should call a secure backend that protects keys and handles authentication, rate limits and provider requests.

The Gemini model name is kept as in the uploaded starter. If the provider reports that it is unavailable for your account, select a currently available model in the backend/configuration.
