from flask import Flask, request, send_from_directory, jsonify
import os
import cv2
import pytesseract
import textacy
import re
import spacy
import fitz  # PyMuPDF
import tempfile

app = Flask(__name__)

# Set up paths for uploading and redacted files
UPLOAD_FOLDER = 'static/uploads/'
REDACTED_FOLDER = 'static/redacted/'

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['REDACTED_FOLDER'] = REDACTED_FOLDER

# Ensure the folders exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(REDACTED_FOLDER, exist_ok=True)

# Load spaCy's English NLP model
nlp = spacy.load("../PDF/model-best")

# Define a regex pattern for email addresses
email_pattern = re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')

def redact_image(image_path):
    image = cv2.imread(image_path)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    data = pytesseract.image_to_data(gray, output_type=pytesseract.Output.DICT)
    full_text = " ".join([data['text'][i] for i in range(len(data['text'])) if int(data['conf'][i]) > 60])
    doc = textacy.make_spacy_doc(full_text, lang=nlp)
    names_to_redact = []
    emails_to_redact = []
    for ent in textacy.extract.entities(doc, include_types={"PERSON", "ORG"}):
        names_to_redact.extend(ent.text.split())
    emails_to_redact = email_pattern.findall(full_text)
    punctuation_set = {',', '.', ';', ':', '!', '?'}

    n_boxes = len(data['text'])
    for i in range(n_boxes):
        if int(data['conf'][i]) > 60:
            text = data['text'][i]
            clean_text = text[:-1] if text[-1] in punctuation_set else text
            if clean_text in names_to_redact or text in emails_to_redact:
                (x, y, w, h) = (data['left'][i], data['top'][i], data['width'][i], data['height'][i])
                image = cv2.rectangle(image, (x, y), (x + w, y + h), (0, 0, 0), -1)
    redacted_image_path = os.path.join(REDACTED_FOLDER, os.path.basename(image_path))
    cv2.imwrite(redacted_image_path, image)
    return redacted_image_path

def redact_pdf(input_pdf_path, entities_to_redact):
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as temp_file:
        temp_file_path = temp_file.name
    
    doc = fitz.open(input_pdf_path)  # Open the PDF directly using the file path
    redaction_info = ""

    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        full_text = page.get_text()

        # Use spaCy model to extract entities
        doc_spacy = nlp(full_text)
        words_to_redact = {ent.label_: [] for ent in doc_spacy.ents if ent.label_ in entities_to_redact}
        
        for ent in doc_spacy.ents:
            if ent.label_ in entities_to_redact:
                words_to_redact[ent.label_].append(ent.text)

        # Collect redaction info
        for label, words in words_to_redact.items():
            if words:
                redaction_info += f"{label}:\n" + "\n".join(words) + "\n\n"
                
        # Redact the identified text
        for label, words in words_to_redact.items():
            for word in words:
                areas = page.search_for(word)
                for area in areas:
                    page.add_redact_annot(area, fill=(0, 0, 0))
            
        page.apply_redactions()

    doc.save(temp_file_path)
    
    # Move the redacted file to the REDACTED_FOLDER
    final_redacted_path = os.path.join(REDACTED_FOLDER, os.path.basename(temp_file_path))
    os.rename(temp_file_path, final_redacted_path)

    return final_redacted_path, redaction_info


@app.route('/redact_image', methods=['POST'])
def redact_image_route():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    filename = file.filename
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)

    redacted_image_path = redact_image(file_path)

    return send_from_directory(app.config['REDACTED_FOLDER'], os.path.basename(redacted_image_path), as_attachment=True)

@app.route('/redact_pdf', methods=['POST'])
def redact_pdf_route():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    entities_to_redact = request.form.get('entities', [])  # Get the array of entities from the JSON request

    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    with tempfile.NamedTemporaryFile(delete=False) as temp_file:
        file_path = temp_file.name
        file.save(file_path)

    redacted_pdf_path, redaction_info = redact_pdf(file_path, entities_to_redact)

    # Send the redacted file as a response
    return send_from_directory(app.config['REDACTED_FOLDER'], os.path.basename(redacted_pdf_path), as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)
