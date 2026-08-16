# Deploy Render

Render can run this project as one Node web service:

- `npm run build` creates the React frontend in `dist/`.
- `npm start` runs `server/index.js`.
- The Node server serves both `/api/*` and the built frontend.

## Render settings

Create a new **Web Service** from your GitHub repo.

Build command:

```bash
npm install && npm run build
```

Start command:

```bash
npm start
```

## Environment variables

Set these in Render:

```env
NODE_ENV=production
APP_ORIGIN=https://your-render-app.onrender.com
JWT_SECRET=use-a-long-random-secret
FIREBASE_STORAGE_BUCKET=foodapp2023-470a6.appspot.com
FIREBASE_SERVICE_ACCOUNT_BASE64=paste-base64-json-here
```

Do not upload or commit the Firebase admin JSON file.

## Create FIREBASE_SERVICE_ACCOUNT_BASE64

Run this on Windows PowerShell, using your Firebase JSON file path:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\Users\DUC DIEN\Downloads\foodapp2023-470a6-firebase-adminsdk-oc3gb-2c358d0e77.json"))
```

Copy the output into Render's `FIREBASE_SERVICE_ACCOUNT_BASE64`.

After the first deploy, copy your Render URL and set `APP_ORIGIN` to that exact URL.
