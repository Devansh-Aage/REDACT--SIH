import base64,os,mimetypes
import spacy,cv2

# Load spaCy's English NLP model
nlp = spacy.load("model-best")
# Load pre-trained face detection model
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Set up paths for uploading and redacted files
UPLOAD_FOLDER = 'static/uploads/'
REDACTED_FOLDER = 'static/redacted/'

# Global dictionary to store face data
face_dict = {}

# Global variables to store redacted words and document data for images and PDFs
image_redacted_words = []

# Helper function to decode Base64 image/PDF and save it
def decode_base64_to_file(base64_string, filename):
    if base64_string.startswith("data:image") or base64_string.startswith("data:application/pdf"):
        base64_string = base64_string.split(",")[1]
    file_data = base64.b64decode(base64_string)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
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

# Helper function to save uploaded video file
def save_uploaded_file(file, filename):
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)
    return file_path

