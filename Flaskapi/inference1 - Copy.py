from flask import Flask, request, jsonify, send_file
from diffusers import StableDiffusionXLInpaintPipeline
import torch
from PIL import Image
import io
import os
from flask_cors import CORS

# Initialize the Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

# Explanation: To avoid reloading the model multiple times, load the model only once when the server starts.
# This will prevent delays caused by repeated model loading when handling multiple requests.

# Load the fine-tuned SDXL Inpainting model only once, when the server starts
pipeline = StableDiffusionXLInpaintPipeline.from_pretrained(
    r"C:\FYPMODEL\SDXL_Inpaint_Model",  # Path to the local model directory
    torch_dtype=torch.float16  # Use float16 for faster inference
).to("cuda")  # Move the model to GPU

# Define the default prompt and optional negative prompt
prompt = "Satellite Imagery Residential Houses"
negative_prompt = ""  # Optional: leave blank if not needed

@app.route('/inpaint', methods=['POST'])
def inpaint():
    try:
        # Fetch the image and mask from the request
        image_file = request.files['image']
        mask_file = request.files['mask']

        # Step 1: Handling data transfer
        # Explanation: Data is transferred via HTTP requests. This involves overhead when receiving the files and converting them.
        # Flask will handle the image and mask data as files uploaded in the request.
        image = Image.open(image_file).convert("RGB").resize((1024, 1024))
        mask = Image.open(mask_file).convert("L").resize((1024, 1024))

        # Step 2: Running inference
        # Explanation: Use torch.autocast to ensure mixed precision is used for better performance on GPUs.
        # This reduces the precision of calculations, thus speeding up the inference time while keeping the output quality sufficient.
        with torch.autocast("cuda"):
            output = pipeline(
                prompt=prompt,
                image=image,
                mask_image=mask,
                negative_prompt=negative_prompt,  # Optional
                num_inference_steps=50,  # Adjust as needed for a balance between quality and speed
                guidance_scale=7.5  # Adjust as needed for guidance scaling
            ).images[0]

        # Step 3: Sending the response
        # Explanation: Converting the image to an in-memory format (BytesIO) and sending it via HTTP introduces some overhead.
        # This is necessary to return the image to the client without saving it to disk.
        img_byte_arr = io.BytesIO()
        output.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)

        # Return the generated image as a response to the client
        return send_file(img_byte_arr, mimetype='image/png')

    except Exception as e:
        # Step 4: Handling errors
        # Explanation: Errors in the request or during inference are captured here, and an error message is returned as a response.
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Start the Flask app
    # Explanation: Multi-threading is disabled (threaded=False) to prevent Flask from attempting to manage multiple model loads
    # or inference tasks in parallel, which could cause excessive overhead or slow performance.
    app.run(host='0.0.0.0', port=5006, debug=False, threaded=False)
