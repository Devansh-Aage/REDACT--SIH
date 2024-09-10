from flask import Flask, request, jsonify
import io
from flask import Flask, request, jsonify
import io
import os
import cv2
import pytesseract
import re
import spacy
import fitz  # PyMuPDF
import tempfile
import base64
import json
from flask_cors import CORS
import mimetypes

app = Flask(__name__)
CORS(app)

# Set up paths for uploading and redacted files
UPLOAD_FOLDER = 'static/uploads/'
REDACTED_FOLDER = 'static/redacted/'

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['REDACTED_FOLDER'] = REDACTED_FOLDER

# Ensure the folders exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(REDACTED_FOLDER, exist_ok=True)

# Load spaCy's English NLP model
nlp = spacy.load("model-best")
nlp = spacy.load("model-best")

# Define a regex pattern for email addresses
email_pattern = re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')

# Global variables to store redacted words and document data for images and PDFs
image_redacted_words = []
image_doc = None

pdf_redacted_words = []
pdf_doc = None

# Helper function to decode Base64 image/PDF and save it
def decode_base64_to_file(base64_string, filename):
    if base64_string.startswith("data:image") or base64_string.startswith("data:application/pdf"):
        base64_string = base64_string.split(",")[1]
    file_data = base64.b64decode(base64_string)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    with open(file_path, 'wb') as f:
        f.write(file_data)
    return file_path

# Helper function to encode file to Base64
def encode_file_to_base64(file_path):
    # Guess the MIME type based on the file extension
    mime_type, _ = mimetypes.guess_type(file_path)

    if not mime_type:
        mime_type = "application/octet-stream"  # Default MIME type

    with open(file_path, 'rb') as file:
        base64_encoded = base64.b64encode(file.read()).decode('utf-8')

    # Add the MIME type prefix to the Base64 string
    return f"data:{mime_type};base64,{base64_encoded}"

# Redact image entities and store the words globally
def redact_image_entities(image_path, entities_to_redact):
    global image_redacted_words, image_doc

    image = cv2.imread(image_path)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    data = pytesseract.image_to_data(gray, output_type=pytesseract.Output.DICT)
    full_text = " ".join([data['text'][i] for i in range(len(data['text'])) if int(data['conf'][i]) > 60])
    
    image_doc = nlp(full_text)
    redacted_words = []
    for ent in image_doc.ents:
        if ent.label_ in entities_to_redact:
            redacted_words.extend(ent.text.split())

    image_redacted_words = redacted_words  # Store globally
    n_boxes = len(data['text'])
    for i in range(n_boxes):
        if int(data['conf'][i]) > 60:
            text = data['text'][i]
            if text in redacted_words:
                (x, y, w, h) = (data['left'][i], data['top'][i], data['width'][i], data['height'][i])
                image = cv2.rectangle(image, (x, y), (x + w, y + h), (0, 0, 255), 2)

    redacted_image_path = os.path.join(REDACTED_FOLDER, os.path.basename(image_path))
    cv2.imwrite(redacted_image_path, image)
    
    return redacted_image_path, redacted_words

# Redact PDF entities and store the words globally
def redact_pdf_entities(input_pdf_path, entities_to_redact):
    global pdf_redacted_words, pdf_doc

    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as temp_file:
        temp_file_path = temp_file.name
    
    doc = fitz.open(input_pdf_path)
    doc = fitz.open(input_pdf_path)
    pdf_redacted_words = []

    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        full_text = page.get_text()

        pdf_doc = nlp(full_text)
        words_to_redact = []
        
        for ent in pdf_doc.ents:
            if ent.label_ in entities_to_redact:
                words_to_redact.append(ent.text)
        
        pdf_redacted_words.extend(words_to_redact)
        
        for word in words_to_redact:
            areas = page.search_for(word)
            for area in areas:
                page.draw_rect(area, color=(1, 0, 0), width=2)

    doc.save(temp_file_path)
    final_redacted_path = os.path.join(REDACTED_FOLDER, os.path.basename(temp_file_path))
    os.rename(temp_file_path, final_redacted_path)

    return final_redacted_path, pdf_redacted_words

# Redact image with black fill using the stored global variables
def redact_image_with_black_fill(image_path, exclude_words):
    global image_redacted_words

    image = cv2.imread(image_path)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    data = pytesseract.image_to_data(gray, output_type=pytesseract.Output.DICT)
    
    redacted_words = [word for word in image_redacted_words if word in exclude_words]

    n_boxes = len(data['text'])
    for i in range(n_boxes):
        if int(data['conf'][i]) > 60:
            text = data['text'][i]
            if text in redacted_words:
                (x, y, w, h) = (data['left'][i], data['top'][i], data['width'][i], data['height'][i])
                image = cv2.rectangle(image, (x, y), (x + w, y + h), (0, 0, 0), -1)
    
    black_fill_image_path = os.path.join(REDACTED_FOLDER, 'black_filled_' + os.path.basename(image_path))
    cv2.imwrite(black_fill_image_path, image)
    
    return black_fill_image_path

# Redact PDF with black fill using the stored global variables
def redact_pdf_with_black_fill(input_pdf_path, exclude_words):
    global pdf_redacted_words

    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as temp_file:
        temp_file_path = temp_file.name

    doc = fitz.open(input_pdf_path)

    words_to_redact = [word for word in pdf_redacted_words if word not in exclude_words]

    for page_num in range(len(doc)):
        page = doc.load_page(page_num)

        for word in words_to_redact:
            areas = page.search_for(word)
            for area in areas:
                page.add_redact_annot(area, fill=(0, 0, 0))

        page.apply_redactions()

    doc.save(temp_file_path)
    final_redacted_path = os.path.join(REDACTED_FOLDER, os.path.basename(temp_file_path))
    os.rename(temp_file_path, final_redacted_path)

    return final_redacted_path

# Route to handle image redaction
@app.route('/redact_image', methods=['POST'])
def redact_image_route():
    data = request.form

    if 'file' not in data or 'filename' not in data or 'entities' not in data:
        return jsonify({"error": "Missing file, filename, or entities"}), 400

    base64_file = data['file']
    filename = data['filename']
    entities = request.form.get('entities')  # Retrieve the entities as a JSON array string

    entities_to_redact = [entity.strip() for entity in entities.split(',')]

    # Decode the base64 file
    file_path = decode_base64_to_file(base64_file, filename)

    # Redact the image
    redacted_image_path, redacted_words = redact_image_entities(file_path, entities_to_redact)

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
    data = request.form

    if 'file' not in data or 'exclude_words' not in data:
        return jsonify({"error": "No file or words provided"}), 400

    file = data['file']
    exclude_words = data['exclude_words']
    filename = data.get('filename', 'image.jpg')

    file_path = decode_base64_to_file(file, filename)
    file = data['file']
    exclude_words = data['exclude_words']
    filename = data.get('filename', 'image.jpg')

    file_path = decode_base64_to_file(file, filename)

    final_image_path = redact_image_with_black_fill(file_path, exclude_words)

    redacted_image_base64 = encode_file_to_base64(final_image_path)

    return jsonify({
        "redacted_image": redacted_image_base64
    })

# Endpoint to redact PDF
    redacted_image_base64 = encode_file_to_base64(final_image_path)

    return jsonify({
        "redacted_image": redacted_image_base64
    })

# Endpoint to redact PDF
@app.route('/redact_pdf', methods=['POST'])
def redact_pdf_route():
    data = request.get_json()

    if 'file' not in data or 'entities' not in data:
    data = request.get_json()

    if 'file' not in data or 'entities' not in data:
        return jsonify({"error": "No file or entities provided"}), 400

    file = data['file']
    entities = data['entities']
    filename = data.get('filename', 'document.pdf')

    file_path = decode_base64_to_file(file, filename)
    file = data['file']
    entities = data['entities']
    filename = data.get('filename', 'document.pdf')

    file_path = decode_base64_to_file(file, filename)

    redacted_pdf_path, redacted_words = redact_pdf_entities(file_path, entities)

    redacted_pdf_base64 = encode_file_to_base64(redacted_pdf_path)

    redacted_pdf_base64 = encode_file_to_base64(redacted_pdf_path)

    return jsonify({
        "redacted_file": redacted_pdf_base64,
        "words_redacted": redacted_words
        "redacted_file": redacted_pdf_base64,
        "words_redacted": redacted_words
    })

# Endpoint to confirm PDF redaction
# Endpoint to confirm PDF redaction
@app.route('/confirm_pdf_redaction', methods=['POST'])
def confirm_pdf_redaction():
    data = request.get_json()

    if 'file' not in data or 'exclude_words' not in data:
    data = request.get_json()

    if 'file' not in data or 'exclude_words' not in data:
        return jsonify({"error": "No file or words provided"}), 400

    file = data['file']
    exclude_words = data['exclude_words']
    filename = data.get('filename', 'document.pdf')

    file_path = decode_base64_to_file(file, filename)
    file = data['file']
    exclude_words = data['exclude_words']
    filename = data.get('filename', 'document.pdf')

    file_path = decode_base64_to_file(file, filename)

    final_pdf_path = redact_pdf_with_black_fill(file_path, exclude_words)

    redacted_pdf_base64 = encode_file_to_base64(final_pdf_path)

    return jsonify({
        "redacted_file": redacted_pdf_base64
    })
    redacted_pdf_base64 = encode_file_to_base64(final_pdf_path)

    return jsonify({
        "redacted_file": redacted_pdf_base64
    })

if __name__ == '__main__':
    app.run(debug=True)