import cv2, pytesseract, fitz
import string, os, tempfile
from utils import UPLOAD_FOLDER,REDACTED_FOLDER, nlp, face_cascade

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
