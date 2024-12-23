from flask import Flask, request, jsonify, send_file
from diffusers import StableDiffusionXLInpaintPipeline
import torch
from PIL import Image
import io
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Explanation: To avoid reloading the model multiple times, load the model only once when the server starts.
# This will prevent delays caused by repeated model loading when handling multiple requests.


pipeline = StableDiffusionXLInpaintPipeline.from_pretrained(
    r"PLEASE ENTER YOUR DOWNLOADED MODEL'S DIRECTORY HERE",  # Path to the local model directory
    torch_dtype=torch.float16  # Use float16 for faster inference
).to("cuda")


prompt = "Satellite Imagery Residential Houses" # WARNING: DO NOT CHANGE THIS, but feel free to experiment (professional use only)
negative_prompt = ""

@app.route('/inpaint', methods=['POST'])
def inpaint():
    try:
        
        image_file = request.files['image']
        mask_file = request.files['mask']


        image = Image.open(image_file).convert("RGB").resize((1024, 1024))
        mask = Image.open(mask_file).convert("L").resize((1024, 1024))


        with torch.autocast("cuda"):
            output = pipeline(
                prompt=prompt,
                image=image,
                mask_image=mask,
                negative_prompt=negative_prompt, 
                num_inference_steps=50,
                guidance_scale=7.5
            ).images[0]

        img_byte_arr = io.BytesIO()
        output.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)


        return send_file(img_byte_arr, mimetype='image/png')

    except Exception as e:

        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5006, debug=False, threaded=False)
