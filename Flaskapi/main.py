import requests
import cv2
import numpy as np
import os
from pathlib import Path
from PIL import Image
import matplotlib.pyplot as plt

def get_confidence_from_user():
    """Prompt user for confidence value with input validation"""
    while True:
        try:
            confidence = float(input("Enter confidence value for house detection (recommended: 5.0): "))
            if 0 < confidence <= 100:
                return confidence
            print("Please enter a value between 0 and 100")
        except ValueError:
            print("Please enter a valid number")

def process_sdxl_inpainting(image_path, mask_path):
    """Send image to SDXL inpainting service"""
    url = "http://localhost:5006/inpaint"
    max_retries = 3
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            with open(image_path, "rb") as img_file, open(mask_path, "rb") as mask_file:
                files = {
                    "image": img_file,
                    "mask": mask_file
                }
                response = requests.post(url, files=files)
                
                if response.status_code == 200:
                    output_path = "sdxl_output.png"
                    with open(output_path, "wb") as f:
                        f.write(response.content)
                    print("✓ SDXL Inpainting completed successfully")
                    return output_path
                else:
                    print(f"Error from SDXL service: {response.text}")
                    
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
        
        retry_count += 1
        if retry_count < max_retries:
            print(f"Retrying... ({retry_count}/{max_retries})")
    
    raise Exception("Failed to complete SDXL inpainting after maximum retries")

def process_gfpgan_and_detection(image_path, confidence):
    """Send image through GFPGAN enhancement and house detection"""
    url = "http://localhost:8000/process"
    
    try:
        with open(image_path, "rb") as image_file:
            files = {"file": image_file}
            data = {"confidence": str(confidence)}
            
            response = requests.post(url, files=files, data=data)
            
            if response.status_code == 200:
                result = response.json()
                output_path = result["processed_image_url"].replace("/final_image/", "temp_pipeline/final_")
                houses_detected = result["total_houses_detected"]
                print(f"✓ Enhancement and detection completed. Found {houses_detected} houses")
                return output_path, houses_detected
            else:
                raise Exception(f"Pipeline error: {response.text}")
                
    except requests.exceptions.RequestException as e:
        raise Exception(f"Failed to process image through pipeline: {e}")

def display_results(original_path, sdxl_path, final_path):
    """Display all three images side by side with proper titles"""
    fig, (ax1, ax2, ax3) = plt.subplots(1, 3, figsize=(15, 5))
    
    # Read and convert images from BGR to RGB
    images = [
        cv2.cvtColor(cv2.imread(path), cv2.COLOR_BGR2RGB) 
        for path in [original_path, sdxl_path, final_path]
    ]
    
    titles = ["Original Image", "SDXL Inpainted", "Final Result"]
    axes = [ax1, ax2, ax3]
    
    for ax, img, title in zip(axes, images, titles):
        ax.imshow(img)
        ax.set_title(title)
        ax.axis('off')
    
    plt.tight_layout()
    plt.show()

def main():
    # Input file paths
    image_path = "input_image.png"
    mask_path = "input_mask.png"
    
    # Validate input files exist
    if not all(Path(p).exists() for p in [image_path, mask_path]):
        print("Error: Make sure both input_image.png and input_mask.png exist in the current directory")
        return
    
    try:
        # Step 1: Get confidence value from user
        print("\n=== Starting Image Processing Pipeline ===")
        confidence = get_confidence_from_user()
        
        # Step 2: Process through SDXL inpainting
        print("\nStep 1/2: SDXL Inpainting")
        sdxl_output = process_sdxl_inpainting(image_path, mask_path)
        
        # Step 3: Process through GFPGAN and house detection
        print("\nStep 2/2: Enhancement and House Detection")
        final_output, houses_detected = process_gfpgan_and_detection(sdxl_output, confidence)
        
        # Display results
        print("\n=== Processing Complete ===")
        print(f"Total houses detected: {houses_detected}")
        print("Displaying results...")
        display_results(image_path, sdxl_output, final_output)
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        print("Pipeline execution failed")

if __name__ == "__main__":
    main()
