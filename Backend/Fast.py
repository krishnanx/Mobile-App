import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
from Barcode import BarcodeReader
from dotenv import load_dotenv
import os
from openai import OpenAI
from PIL import Image
from io import BytesIO
import requests

# Load environment variables
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Directory to save decoded images
UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

UPLOAD_DIRS = "./uploaded_images"
os.makedirs(UPLOAD_DIRS, exist_ok=True)

def crop_image(file_path):
    """Crops the image into a square centered on the image."""
    with Image.open(file_path) as img:
        width, height = img.size
        box_size = min(width, height)

        # Calculate coordinates for the square crop
        left = (width - box_size) / 2
        top = (height - box_size) / 2
        right = left + box_size
        bottom = top + box_size

        cropped_img = img.crop((left, top, right, bottom))
        cropped_file_path = os.path.join(UPLOAD_DIR, "cropped_image.jpg")
        cropped_img.save(cropped_file_path)

    return cropped_file_path

@app.route("/upload-base64", methods=["POST"])
def upload_base64():
    try:
        # Get the Base64 encoded image from the request
        image_data = request.json.get("image")
        if not image_data:
            return jsonify({"error": "No image data provided"}), 400

        # Decode the Base64 string
        image_bytes = base64.b64decode(image_data)
        file_path = os.path.join(UPLOAD_DIRS, "uploaded_image.jpg")

        # Save the decoded image
        with open(file_path, "wb") as image_file:
            image_file.write(image_bytes)
        
        # Crop the image
        cropped_file_path = crop_image(file_path)
        
        # Read the barcode from the cropped image
        barcode_info = BarcodeReader(cropped_file_path)
        
        if barcode_info == "error:barcode not detected":
            return jsonify({"status": "error", "message": "Barcode not detected"}), 400
        
        # Get ingredients from the barcode
        ingredients,name,image,nutrients = mock_get_ingredients(barcode_info)
        if not ingredients:
            return jsonify({"status": "error", "message": "Failed to fetch ingredients"}), 400

        # Generate OpenAI response based on ingredients
        #generated_text = generate_openai_text(ingredients)
        
        result = {
            "status": "success",
            "barcode_info": barcode_info,
            "Name":name,
            "ingredients": ingredients,
            #"openai_response": generated_text,
            "Image":image,
            "Nutrients":nutrients
        }

        # Return the result as JSON
        return jsonify(result), 200

    except Exception as e:
        # Catch any other exceptions and return an error message
        return jsonify({"error": f"Failed to decode and save image: {str(e)}"}), 400

def generate_openai_text(ingredients):
    try:
        prompt = f"""For the following ingredients: {', '.join(ingredients)}
        Please provide:
        1. A detailed explanation of each ingredients
        """

        openai_response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "user", "content": prompt}
            ],
            max_tokens=100
        )
        return openai_response.choices[0].message.content.strip()
    except Exception as e:
        raise RuntimeError(f"OpenAI API Error: {str(e)}")

def mock_get_ingredients(barcode_data):
    try:
        # Replace this URL with a dynamic URL using barcode_data if needed
        url = f"https://world.openfoodfacts.net/api/v2/product/{barcode_data}"
        response = requests.get(url)
        response.raise_for_status()  

        data = response.json()
        if data["status"] == 1: 
            ingredients_text = data["product"]["ingredients_text"]
            print(data["product"])
            image=data["product"]["image_small_url"]
            nutrients= data["product"]["nutriments"]
            print("nutrients:",nutrients)
            ingredients_list = [ing.strip() for ing in ingredients_text.split(",")]
            return ingredients_list,data["product"]["brands"],image,nutrients
        else:
            return None
    except Exception as e:
        print(f"Error fetching ingredients: {str(e)}")
        return None

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
