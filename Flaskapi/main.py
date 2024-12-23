import requests
import cv2
import numpy as np
import os
from pathlib import Path
from PIL import Image
import matplotlib.pyplot as plt

def prompt_user_for_confidence():
    while True:
        try:
            confidence = float(input("Please input the confidence score for rooftop detection (e.g., 5.0): "))
            if confidence > 0:
                return confidence
            else:
                print("Confidence score must be a positive number. Please try again.")
        except ValueError:
            print("Invalid input. Please enter a numerical value.")

def send_to_inference1(image_path, mask_path):
    url = "http://localhost:5006/inpaint"
    with open(image_path, "rb") as image_file, open(mask_path, "rb") as mask_file:
        files = {"image": image_file, "mask": mask_file}
        while True:
            try:
                response = requests.post(url, files=files)
                if response.status_code == 200:
                    output_path = "sdxl_output.png"
                    with open(output_path, "wb") as f:
                        f.write(response.content)
                    print("SDXL Inpainting completed.")
                    return output_path
                else:
                    print(f"Error from SDXL Inpainting: {response.json()} Retrying...")
            except Exception as e:
                print(f"Exception occurred: {e}. Retrying...")

def send_to_pipeline(processed_image_path, confidence):
    url = "http://localhost:8000/process"
    with open(processed_image_path, "rb") as image_file:
        data = {"confidence": confidence}
        files = {"file": image_file}
        try:
            response = requests.post(url, data=data, files=files)
            if response.status_code == 200:
                result = response.json()
                output_image_url = result["processed_image_url"].replace("/final_image/", "temp_pipeline/final_")
                print("Pipeline processing completed.")
                return output_image_url
            else:
                print(f"Error from Pipeline: {response.json()}")
        except Exception as e:
            print(f"Exception occurred: {e}")

def show_images(input_image_path, sdxl_output_path, gfpgan_output_path):
    input_image = cv2.imread(input_image_path)
    sdxl_output = cv2.imread(sdxl_output_path)
    gfpgan_output = cv2.imread(gfpgan_output_path)
    
    images = [input_image, sdxl_output, gfpgan_output]
    titles = ["Input Image", "SDXL Output", "Enhanced Output"]

    plt.figure(figsize=(12, 8))
    for i, img in enumerate(images):
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        plt.subplot(1, len(images), i + 1)
        plt.imshow(img)
        plt.title(titles[i])
        plt.axis("off")
    plt.tight_layout()
    plt.show()

def main():
    image_path = "input_image.png"                   #PLEASE ENTER AN IMAGE FROM THE LIST OF IMAGES GIVEN IN THE FOLDER
    mask_path = "input_mask.png"                     #PLEASE ENTER THE CORRESPONDING MASK FROM THE LIST OF MASKS GIVEN IN THE FOLDER

    if not os.path.exists(image_path) or not os.path.exists(mask_path):
        print("Please ensure 'input_image.png' and 'input_mask.png' are in the current directory.")
        return

    confidence = prompt_user_for_confidence()

    print("Sending image and mask to SDXL Inpainting...")
    sdxl_output_path = send_to_inference1(image_path, mask_path)

    print("Sending SDXL output to Pipeline for GFPGAN and Rooftop Detection...")
    final_output_path = send_to_pipeline(sdxl_output_path, confidence)

    if final_output_path:
        print("Displaying results...")
        show_images(image_path, sdxl_output_path, final_output_path)
    else:
        print("Failed to process the pipeline.")

if __name__ == "__main__":
    main()
