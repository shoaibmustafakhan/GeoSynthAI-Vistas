from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import FileResponse, JSONResponse
import cv2
import os
import shutil
from pathlib import Path
import uvicorn
import uuid
import sys
import subprocess

# app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# origins = [
#     "http://localhost.tiangolo.com",
#     "https://localhost.tiangolo.com",
#     "http://localhost",
#     "http://localhost:8080",
# ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import the house detection code
sys.path.append('.')
from house_detection import process_image_in_grid

def run_gfpgan(input_path, output_dir):
    """Run GFPGAN on the input image"""
    command = [                                                     # PLEASE MAKE SURE YOU PUT THE GFPGANs MODEL INTO THE SAME FOLDER. CAN BE ACCESSED HERE: https://github.com/TencentARC/GFPGAN
        'python',
        'inference_gfpgan.py',
        '-i', str(input_path),
        '-o', str(output_dir),
        '-v', '1.3'
    ]
    subprocess.run(command, check=True)
    
    result_path = Path(output_dir) / 'restored_imgs' / input_path.name
    return result_path

@app.post("/process")
async def process_image(
    file: UploadFile = File(...),
    confidence: float = Form(5.0)  # Default confidence of 5.0
):
    # Create temporary directories
    temp_dir = Path("temp_pipeline")
    temp_dir.mkdir(exist_ok=True)
    
    # Generate unique filename
    file_extension = file.filename.split('.')[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    temp_path = temp_dir / unique_filename
    
    try:
        # Save uploaded file
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Step 1: Process with house detection (now passing confidence)
        processed_image, total_detections = await process_image_in_grid(temp_path, confidence=confidence)
        intermediate_path = temp_dir / f"house_detected_{unique_filename}"
        cv2.imwrite(str(intermediate_path), processed_image)
        
        # Step 2: Process with GFPGAN
        gfpgan_output_dir = temp_dir / "gfpgan_output"
        gfpgan_output_dir.mkdir(exist_ok=True)
        final_image_path = run_gfpgan(intermediate_path, gfpgan_output_dir)
        
        # Copy final result to a known location
        final_output_path = temp_dir / f"final_{unique_filename}"
        shutil.copy2(final_image_path, final_output_path)
        
        # Prepare response
        response = {
            "total_houses_detected": total_detections,
            "confidence_used": confidence,
            "processed_image_url": f"/final_image/{unique_filename}"
        }
        
        return JSONResponse(content=response)
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@app.get("/final_image/{filename}")
async def get_final_image(filename: str):
    image_path = Path("temp_pipeline") / f"final_{filename}"
    if image_path.exists():
        return FileResponse(image_path)
    return JSONResponse(
        status_code=404,
        content={"error": "Image not found"}
    )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)