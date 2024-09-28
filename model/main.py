from flask import Flask, request, jsonify
import io, base64,tempfile, os, json, mimetypes, re, string
import cv2
import pytesseract
import spacy
import fitz
from flask_cors import CORS
from utils import decode_base64_to_file,encode_file_to_base64,UPLOAD_FOLDER,REDACTED_FOLDER
from redact_preview import redact_image_entities,redact_pdf_entities
from redact_confirm import redact_image_with_black_fill,redact_pdf_with_black_fill

app = Flask(__name__)
CORS(app)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['REDACTED_FOLDER'] = REDACTED_FOLDER

# Ensure the folders exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(REDACTED_FOLDER, exist_ok=True)

image_redacted_words = []
image_redacted_faces = {}
pdf_redacted_words = []

def redact_faces_in_video(video_path):
    # Load the video
    cap = cv2.VideoCapture(video_path)
    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    output_file_path = os.path.join(REDACTED_FOLDER, 'redacted_video_' + os.path.basename(video_path))

    # Create the folder if it doesn't exist
    if not os.path.exists(REDACTED_FOLDER):
        os.makedirs(REDACTED_FOLDER)

    # Create a video writer to save the video with redacted faces
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_file_path, fourcc, fps, (frame_width, frame_height))

    # Load pre-trained face detector (Haar Cascade)
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # Convert frame to grayscale for face detection
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

        # Redact faces by applying black rectangles over them
        for (x, y, w, h) in faces:
            frame = cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 0, 0), -1)

        # Write the modified frame to the output video
        out.write(frame)

    # Release the video objects
    cap.release()
    out.release()

    return output_file_path

# Route to handle video redaction
@app.route('/redact_video', methods=['POST'])
def redact_video_route():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    filename = file.filename

    # Save the uploaded video file
    video_path = save_uploaded_file(file, filename)

    # Redact the video
    redacted_video_path = redact_faces_in_video(video_path)

    # Return the path to the redacted video
    return jsonify({
        "redacted_video_url": redacted_video_path
    })


# Route to handle image redaction
@app.route('/redact_image', methods=['POST'])
def redact_image_route():
    global image_redacted_words
    data = request.form

    if 'file' not in data or 'filename' not in data or 'entities' not in data:
        return jsonify({"error": "Missing file, filename, or entities"}), 400

    base64_file = data['file']
    filename = data['filename']
    entities = data['entities']

    # Decode the base64 file
    file_path = decode_base64_to_file(base64_file, filename)

    # Redact the image
    redacted_image_path, redacted_words, redacted_faces = redact_image_entities(file_path, entities)
    image_redacted_faces = redacted_faces
    # Read the redacted image and encode it in base64
    redacted_image_base64 = encode_file_to_base64(redacted_image_path)

    # Return redacted image and words
    return jsonify({
        'redacted_image': redacted_image_base64,
        'name_redacted': redacted_words
    })

# Endpoint to confirm image redaction
@app.route('/confirm_image_redaction', methods=['POST'])
def confirm_image_redaction():
    global image_redacted_words,image_redacted_faces

    data = request.form

    if 'file' not in data or 'exclude_words' not in data:
        return jsonify({"error": "No file or words provided"}), 400

    file = data['file']
    exclude_words = data['exclude_words']
    filename = data.get('filename', 'image.jpg')

    file_path = decode_base64_to_file(file, filename)
    print(image_redacted_words)
    final_image_path = redact_image_with_black_fill(file_path,image_redacted_words, exclude_words, image_redacted_faces)

    redacted_image_base64 = encode_file_to_base64(final_image_path)

    return jsonify({
        "redacted_image": redacted_image_base64
    })

# Endpoint to redact PDF
@app.route('/redact_pdf', methods=['POST'])
def redact_pdf_route():
    global pdf_redacted_words
    data = request.form

    if 'file' not in data or 'entities' not in data:
        return jsonify({"error": "No file or entities provided"}), 400

    file = data['file']
    entities = data['entities']
    filename = data.get('filename', 'document.pdf')

    file_path = decode_base64_to_file(file, filename)

    redacted_pdf_path, redacted_words = redact_pdf_entities(file_path, entities)
    pdf_redacted_words = redacted_words
    print(pdf_redacted_words)
    redacted_pdf_base64 = encode_file_to_base64(redacted_pdf_path)

    return jsonify({
        "redacted_file": redacted_pdf_base64,
        "words_redacted": redacted_words
    })

# Endpoint to confirm PDF redaction
@app.route('/confirm_pdf_redaction', methods=['POST'])
def confirm_pdf_redaction():
    global pdf_redacted_words
    data = request.form

    if 'file' not in data or 'exclude_words' not in data:
        return jsonify({"error": "No file or words provided"}), 400

    file = data['file']
    exclude_words = data['exclude_words']
    filename = data.get('filename', 'document.pdf')

    file_path = decode_base64_to_file(file, filename)
    print(pdf_redacted_words)
    final_pdf_path = redact_pdf_with_black_fill(file_path, pdf_redacted_words, exclude_words)
    redacted_pdf_base64 = encode_file_to_base64(final_pdf_path)

    return jsonify({
        "redacted_file": redacted_pdf_base64
    })

if __name__ == '__main__':
    app.run(debug=True,use_reloader=False)