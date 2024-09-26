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
import string

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
# Load pre-trained face detection model
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Global dictionary to store face data
face_dict = {}
# Define a regex pattern for email addresses
email_pattern = re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')

# Global variables to store redacted words and document data for images and PDFs
image_redacted_words = []

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

# Redact image entities and store the full words globally
def redact_image_entities(image_path, entities_to_redact, face=True):
    global image_redacted_words, face_dict
    
    # Initialize face dictionary
    face_dict = {}

    image = cv2.imread(image_path)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    data = pytesseract.image_to_data(gray, output_type=pytesseract.Output.DICT)
    
    full_text = " ".join([data['text'][i] for i in range(len(data['text'])) if data['text'][i] and int(data['conf'][i]) > 60])
    doc = nlp(full_text)
    
    redacted_words = []
    for ent in doc.ents:
        if ent.label_ in entities_to_redact:
            redacted_words.append(ent.text)  # Store full entity without splitting

    image_redacted_words = redacted_words  # Store globally
    
    # Redact words in the image
    n_boxes = len(data['text'])
    for word in redacted_words:
        word_parts = word.split()  # Split the entity into words (for matching)
        # Find all the boxes that correspond to the entity
        word_parts = [part.strip(string.punctuation) for part in word_parts] 
        boxes = []
        for i in range(n_boxes):
            if int(data['conf'][i]) > 60:
                text = data['text'][i]
                text = text.strip(string.punctuation)
                if text in word_parts:  # Check if the word part matches
                    (x, y, w, h) = (data['left'][i], data['top'][i], data['width'][i], data['height'][i])
                    boxes.append((x, y, w, h))
        
        if boxes:
            # Combine bounding boxes for multi-word entity
            x_min = min([box[0] for box in boxes])
            y_min = min([box[1] for box in boxes])
            x_max = max([box[0] + box[2] for box in boxes])
            y_max = max([box[1] + box[3] for box in boxes])
            image = cv2.rectangle(image, (x_min-3, y_min-3), (x_max+3, y_max+3), (0, 0, 255), 2)
     # Face detection if 'face' parameter is True
    if face:
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
        
        # Add each detected face to the global face_dict and draw rectangles with numbers
        for idx, (x, y, w, h) in enumerate(faces):
            face_number = f"face_{idx + 1}"
            face_dict[face_number] = (x, y, w, h)
            image = cv2.rectangle(image, (x, y), (x + w, y + h), (255, 0, 0), 2)
            cv2.putText(image, face_number, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 0, 0), 2)

    redacted_image_path = os.path.join(REDACTED_FOLDER, os.path.basename(image_path))
    cv2.imwrite(redacted_image_path, image)
    
    return redacted_image_path, redacted_words, face_dict

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

# Redact image with black fill using stored global variables
def redact_image_with_black_fill(image_path, exclude_words, include_face=['face_1']):
    global image_redacted_words

    image = cv2.imread(image_path)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    data = pytesseract.image_to_data(gray, output_type=pytesseract.Output.DICT)
    
    redacted_words = [word for word in image_redacted_words if word not in exclude_words]
    
    # Black-fill the full entity
    n_boxes = len(data['text'])
    for word in redacted_words:
        word_parts = word.split()  # Split the entity into words (for matching)
        word_parts = [part.strip(string.punctuation) for part in word_parts]  # Strip punctuation from entity parts
        # Find all the boxes that correspond to the entity
        boxes = []
        for i in range(n_boxes):
            if int(data['conf'][i]) > 60:
                text = data['text'][i].strip(string.punctuation)  # Strip punctuation from recognized text
                if text in word_parts:  # Check if the word part matches
                    (x, y, w, h) = (data['left'][i], data['top'][i], data['width'][i], data['height'][i])
                    boxes.append((x, y, w, h))
        
        if boxes:
            # Combine bounding boxes for multi-word entity
            x_min = min([box[0] for box in boxes])
            y_min = min([box[1] for box in boxes])
            x_max = max([box[0] + box[2] for box in boxes])
            y_max = max([box[1] + box[3] for box in boxes])
            image = cv2.rectangle(image, (x_min-3, y_min-3), (x_max+3, y_max+3), (0, 0, 0), -1)

    # Selective face redaction based on `include_face` array
    print(face_dict)
    for face_number in include_face:
        if face_number in face_dict:
            (x, y, w, h) = face_dict[face_number]
            image = cv2.rectangle(image, (x, y), (x + w, y + h), (0, 0, 0), -1)  # Black out selected face

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

# Helper function to save uploaded video file
def save_uploaded_file(file, filename):
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)
    return file_path

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

    final_image_path = redact_image_with_black_fill(file_path, exclude_words)

    redacted_image_base64 = encode_file_to_base64(final_image_path)

    return jsonify({
        "redacted_image": redacted_image_base64
    })
# Endpoint to redact PDF
@app.route('/redact_pdf', methods=['POST'])
def redact_pdf_route():
    data = request.form
    print(data)
    if 'file' not in data or 'entities' not in data:
        return jsonify({"error": "No file or entities provided"}), 400

    file = data['file']
    entities = data['entities']
    filename = data.get('filename', 'document.pdf')

    file_path = decode_base64_to_file(file, filename)

    redacted_pdf_path, redacted_words = redact_pdf_entities(file_path, entities)

    redacted_pdf_base64 = encode_file_to_base64(redacted_pdf_path)

    return jsonify({
        "redacted_file": redacted_pdf_base64,
        "words_redacted": redacted_words
    })

# Endpoint to confirm PDF redaction
@app.route('/confirm_pdf_redaction', methods=['POST'])
def confirm_pdf_redaction():
    data = request.form

    if 'file' not in data or 'exclude_words' not in data:
        return jsonify({"error": "No file or words provided"}), 400

    file = data['file']
    exclude_words = data['exclude_words']
    filename = data.get('filename', 'document.pdf')

    file_path = decode_base64_to_file(file, filename)

    final_pdf_path = redact_pdf_with_black_fill(file_path, exclude_words)
    redacted_pdf_base64 = encode_file_to_base64(final_pdf_path)

    return jsonify({
        "redacted_file": redacted_pdf_base64
    })

    # ciphertext = bytes.fromhex(request.json.get('ciphertext'))  
    # plaintext = decrypt_message(ciphertext) 

if __name__ == '__main__':
    app.run(debug=True,use_reloader=False)