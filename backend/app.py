import os
from pathlib import Path

from dotenv import load_dotenv
from __init__ import create_app


load_dotenv(Path(__file__).resolve().parent / ".env")

app = create_app()

if __name__ == "__main__":
    app.run(
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", "5000")),
        debug=os.getenv("DEBUG", "").lower() == "true"
    )