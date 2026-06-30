import sys
import traceback

print("=== rembg_server.py starting ===", flush=True)

try:
    from flask import Flask, request, send_file
    print("Flask imported OK", flush=True)
except Exception as e:
    print("FAILED to import flask:", e, flush=True)
    traceback.print_exc()
    sys.exit(1)

try:
    from rembg import remove, new_session
    print("rembg imported OK", flush=True)
except Exception as e:
    print("FAILED to import rembg:", e, flush=True)
    traceback.print_exc()
    sys.exit(1)

import io

app = Flask(__name__)

try:
    print("Loading u2netp model session...", flush=True)
    session = new_session("u2netp")
    print("Model session loaded OK", flush=True)
except Exception as e:
    print("FAILED to load model session:", e, flush=True)
    traceback.print_exc()
    sys.exit(1)

@app.route("/remove", methods=["POST"])
def remove_bg():
    if "image" not in request.files:
        return {"error": "No image uploaded"}, 400

    input_data = request.files["image"].read()
    output_data = remove(input_data, session=session)

    return send_file(
        io.BytesIO(output_data),
        mimetype="image/png"
    )

@app.route("/health", methods=["GET"])
def health():
    return {"status": "ok"}, 200

if __name__ == "__main__":
    print("Starting Flask app on port 5001...", flush=True)
    app.run(host="127.0.0.1", port=5001)