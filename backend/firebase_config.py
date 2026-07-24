
# import os
# import firebase_admin
# from firebase_admin import credentials, firestore

# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# KEY_PATH = os.path.join(BASE_DIR, "vector_prod.json")


# def init_firebase():
#     if not firebase_admin._apps:
#         if os.path.exists(KEY_PATH):
#             cred = credentials.Certificate(KEY_PATH)
#             firebase_admin.initialize_app(cred)
#         else:
#             firebase_admin.initialize_app()

#     db = firestore.client()
#     return db


# db = init_firebase()
# users_collection = db.collection("users")
import os
import firebase_admin
from firebase_admin import credentials, firestore, storage

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
KEY_PATH = os.getenv(
    "FIREBASE_CREDENTIALS_PATH",
    os.getenv("GOOGLE_APPLICATION_CREDENTIALS", os.path.join(BASE_DIR, "vector_prod.json")),
)

# Set this to your actual Firebase Storage bucket name, e.g.
# "your-project-id.appspot.com" (find it under Firebase Console ->
# Storage -> Files, it's shown at the top as gs://<this-value>).
# You can also set it via an environment variable instead of hardcoding it.
STORAGE_BUCKET = os.getenv("FIREBASE_STORAGE_BUCKET", "your-project-id.appspot.com")


def init_firebase():
    if not firebase_admin._apps:
        if KEY_PATH and os.path.exists(KEY_PATH):
            cred = credentials.Certificate(KEY_PATH)
            firebase_admin.initialize_app(cred, {"storageBucket": STORAGE_BUCKET})
        else:
            firebase_admin.initialize_app(options={"storageBucket": STORAGE_BUCKET})

    db = firestore.client()
    bucket = storage.bucket()
    return db, bucket


db, bucket = init_firebase()
users_collection = db.collection("users")

