# GCP deployment

This repository is prepared for a split deployment:

- React frontend: Firebase Hosting
- Flask backend: Cloud Run
- Firebase/Firestore/Storage: the existing Firebase project

## Deploy in this order

Deploy the backend first. The frontend build needs the Cloud Run URL as
`REACT_APP_API_BASE_URL`. After the backend is live, deploy the frontend and
then update the backend CORS setting with the final frontend URL if needed.

## One-time setup

Install and authenticate the Google Cloud CLI and Firebase CLI, then run:

```powershell
gcloud auth login
gcloud auth application-default login
firebase login
gcloud config set project YOUR_GCP_PROJECT_ID
```

Enable APIs and create the Artifact Registry repository:

```powershell
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com
gcloud artifacts repositories create vector-prod --repository-format=docker --location=asia-south1
```

Give the Cloud Run runtime service account access to Firebase services (at
minimum Firestore and Storage roles appropriate for your project). Cloud Run
uses Application Default Credentials; do not upload `vector_prod.json`.

## Backend

From the repository root:

```powershell
gcloud builds submit --config cloudbuild.yaml `
  --substitutions="_REGION=asia-south1,_REPOSITORY=vector-prod,_SERVICE=vector-api,_CORS_ORIGINS=https://YOUR_PROJECT_ID.web.app,_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT_ID.appspot.com" .
gcloud run services describe vector-api --region=asia-south1
```

Check the returned URL plus `/health`; it should return `{"status":"ok"}`.

For production secrets, use Secret Manager rather than committing `.env`:

```powershell
gcloud secrets create vector-jwt-secret --data-file=jwt-secret.txt
gcloud run services update vector-api --region=asia-south1 --set-env-vars=DEBUG=false,CORS_ORIGINS=https://YOUR_PROJECT_ID.web.app --set-secrets=JWT_SECRET=vector-jwt-secret:latest
```

## Frontend

Copy `.firebaserc.example` to `.firebaserc`, replace the project ID, then set
the API URL returned by Cloud Run in `.env.production`:

```text
REACT_APP_API_BASE_URL=https://YOUR_CLOUD_RUN_URL
```

Build and deploy:

```powershell
npm ci
npm run build
firebase deploy --only hosting
```

The Firebase Hosting rewrite in `firebase.json` supports React Router deep
links. Keep `.env.production` out of git; it is already ignored.
