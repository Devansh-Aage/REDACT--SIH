import cv2, pytesseract, fitz
import string, os, tempfile
from utils import UPLOAD_FOLDER,REDACTED_FOLDER, nlp, face_cascade



# Redact image with black fill using stored global variables
def redact_image_with_black_fill(image_path, image_redacted_words, exclude_words, face_dict, include_face=['face_1']):
    print("Start OCR")
    
    # Load the image and convert to grayscale
    image = cv2.imread(image_path)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Extract text data from the image using pytesseract
    data = pytesseract.image_to_data(gray, output_type=pytesseract.Output.DICT)
    print("End OCR")
    
    # Filter out words that should not be redacted
    redacted_words = [word for word in image_redacted_words if word in exclude_words]
    
    # Redact each individual word by filling with black
    n_boxes = len(data['text'])
    for word in redacted_words:
        word_parts = word.split()  # Split the entity into individual words
        word_parts = [part.strip(string.punctuation) for part in word_parts]  # Clean word parts of punctuation
        
        for i in range(n_boxes):
            if int(data['conf'][i]) > 60:
                text = data['text'][i].strip(string.punctuation)  # Clean detected text
                if text in word_parts:
                    # Get box coordinates and fill with black
                    (x, y, w, h) = (data['left'][i], data['top'][i], data['width'][i], data['height'][i])
                    image = cv2.rectangle(image, (x-3, y-3), (x+w+3, y+h+3), (0, 0, 0), -1)  # Fill with black

    # Redact selected faces by filling with black
    for face_number in include_face:
        if face_number in face_dict:
            (x, y, w, h) = face_dict[face_number]
            image = cv2.rectangle(image, (x, y), (x + w, y + h), (0, 0, 0), -1)  # Black out face

    # Save the black-filled image
    black_fill_image_path = os.path.join(REDACTED_FOLDER, 'black_filled_' + os.path.basename(image_path))
    cv2.imwrite(black_fill_image_path, image)
    
    return black_fill_image_path



# Redact PDF with black fill using the stored global variables
def redact_pdf_with_black_fill(input_pdf_path,pdf_redacted_words, exclude_words):

    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as temp_file:
        temp_file_path = temp_file.name

    doc = fitz.open(input_pdf_path)
    print(pdf_redacted_words)
    words_to_redact = [word for word in pdf_redacted_words if word in exclude_words]
    print(words_to_redact)
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
