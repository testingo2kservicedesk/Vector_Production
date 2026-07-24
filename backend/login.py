import bcrypt
from flask import Blueprint, request, jsonify
from firebase_config import users_collection
from auth_utils import generate_token

login_bp = Blueprint("login", __name__)


@login_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data:
        return jsonify({"success": False, "message": "Request body must be JSON"}), 400

    email = (data.get("email") or "").strip().lower()
    password = data.get("password")

    if not email or not password:
        return jsonify({"success": False, "message": "Email and password required"}), 400

    results = users_collection.where("email", "==", email).limit(1).get()

    if not results:
        return jsonify({"success": False, "message": "Invalid Email or Password"}), 401

    user_doc = results[0]
    user = user_doc.to_dict()

    stored_hash = user.get("password", "").encode("utf-8")

    if bcrypt.checkpw(password.encode("utf-8"), stored_hash):
        role = user.get("role", "user")  # defaults new/legacy users to "user"
        token = generate_token(user_doc.id, email, role, user.get("name", ""))

        return jsonify({
            "success": True,
            "message": "Login Successful",
            "name": user.get("name", ""),
            "userId": user_doc.id,
            "role": role,
            "token": token,
        }), 200

    return jsonify({
        "success": False,
        "message": "Invalid Email or Password"
    }), 401
