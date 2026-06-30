from flask import Flask, request, send_file
from rembg import remove, new_session
import io

app = Flask(__name__)

session = new_session("u2net")

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
    app.run(host="127.0.0.1", port=5001)