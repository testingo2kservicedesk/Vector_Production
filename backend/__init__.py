
import os

from flask import Flask
from flask_cors import CORS

from login import login_bp
from adminlogin import admin_login_bp
from adminusers import admin_users_bp
from signup import signup_bp
from models import models_bp
from defective import defects_bp
from podetails import podetails_bp
from salesregister import saleregister_bp
from dailyproduction import dailyproduction_bp
from invoice import invoice_bp
from stockregister import stockregister_bp
from dashboard import dashboard_bp


def create_app():

    app = Flask(__name__)

    @app.get("/health")
    def health_check():
        return {"status": "ok"}, 200

    allowed_origins = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,"
        "http://localhost:3001,"
        "http://127.0.0.1:3000,"
        "http://192.168.0.70:3000"
    ).split(",")

    CORS(
        app,
        resources={r"/*": {"origins": [origin.strip() for origin in allowed_origins]}},
    )

    app.register_blueprint(login_bp)
    app.register_blueprint(admin_login_bp)
    app.register_blueprint(admin_users_bp)
    app.register_blueprint(signup_bp)
    app.register_blueprint(models_bp)
    app.register_blueprint(defects_bp)
    app.register_blueprint(podetails_bp)
    app.register_blueprint(saleregister_bp)
    app.register_blueprint(dailyproduction_bp)
    app.register_blueprint(invoice_bp)
    app.register_blueprint(stockregister_bp)
    app.register_blueprint(dashboard_bp)
    return app


# ---------------------------------------------------------------------------
# How to protect a route in any other blueprint (models.py, invoice.py, etc):
#
#   from auth_utils import roles_required
#
#   @models_bp.route("/models", methods=["GET"])
#   @roles_required("admin", "coadmin")          # only these roles pass
#   def get_models():
#       ...
#
# Or, to allow "coadmin and above" without listing every role:
#
#   from auth_utils import min_role_required
#
#   @models_bp.route("/models", methods=["POST"])
#   @min_role_required("coadmin")                # coadmin + admin pass
#   def create_model():
#       ...
#
# Inside a protected view you can read who's calling via request.user, e.g.
# request.user["role"], request.user["email"], request.user["sub"].
# ---------------------------------------------------------------------------
