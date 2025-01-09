from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import cv2
import os
import shutil
from pathlib import Path
import uvicorn
import uuid
import sys
import subprocess
import io
from roboflow import Roboflow
import numpy as np

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def suppress_roboflow_init():
    """Temporarily suppress stdout during Roboflow initialization"""
    temp_stdout = sys.stdout
    sys.stdout = io.StringIO()
    
    # Initialize Roboflow
    rf = Roboflow(api_key="IN8jUrm1UugQNFWFJ6DO")
    project = rf.workspace().project("houses-in-satellite-image-kmz")
    model = project.version(1).model
    
    # Restore stdout
    sys.stdout = temp_stdout
    return model

def split_image(image, grid_size=3):
    """Split image into grid_size x grid_size pieces."""
    h, w = image.shape[:2]
    tile_h, tile_w = h // grid_size, w // grid_size
    
    tiles = []
    positions = []
    
    for i in range(grid_size):
        for j in range(grid_size):
            start_h = i * tile_h
            start_w = j * tile_w
            end_h = start_h + tile_h
            end_w = start_w + tile_w
            
            tile = image[start_h:end_h, start_w:start_w+tile_w]
            tiles.append(tile)
            positions.append((start_h, start_w))
            
    return tiles, positions, (tile_h, tile_w)

def stitch_image(tiles, positions, original_shape, tile_size):
    """Reconstruct image from tiles."""
    full_image = np.zeros(original_shape, dtype=np.uint8)
    tile_h, tile_w = tile_size
    
    for tile, (start_h, start_w) in zip(tiles, positions):
        full_image[start_h:start_h+tile_h, start_w:start_w+tile_w] = tile
        
    return full_image

def process_image_in_grid(image_path, grid_size=3):
    # Initialize Roboflow silently
    model = suppress_roboflow_init()

    # Create temp directory for tiles
    temp_dir = Path("temp_tiles")
    temp_dir.mkdir(exist_ok=True)

    # Load and split image
    image = cv2.imread(str(image_path))
    if image is None:
        raise ValueError("Could not load image")
    
    tiles, positions, tile_size = split_image(image, grid_size)
    
    # Process each tile
    processed_tiles = []
    total_detections = 0
    
    for idx, (tile, pos) in enumerate(zip(tiles, positions)):
        # Save tile temporarily
        tile_path = temp_dir / f"tile_{idx}.jpg"
        cv2.imwrite(str(tile_path), tile)
        
        # Run detection on tile
        predictions = model.predict(str(tile_path), confidence=2, overlap=30).json()
        detections = predictions['predictions']
        total_detections += len(detections)
        
        # Draw predictions on tile
        for pred in detections:
            x = pred['x']
            y = pred['y']
            width = pred['width']
            height = pred['height']
            
            x1 = int(x - width/2)
            y1 = int(y - height/2)
            x2 = int(x + width/2)
            y2 = int(y + height/2)
            
            cv2.rectangle(tile, (x1, y1), (x2, y2), (0, 255, 0), 2)
        
        processed_tiles.append(tile)

    # Stitch image back together
    final_image = stitch_image(processed_tiles, positions, image.shape, tile_size)
    
    # Save result
    output_path = str(Path("temp_pipeline") / f"detected_{Path(image_path).name}")
    cv2.imwrite(output_path, final_image)
    
    # Cleanup
    for file in temp_dir.glob("*.jpg"):
        file.unlink()
    temp_dir.rmdir()
    
    return total_detections, output_path

def run_gfpgan(input_path, output_dir):
    """Run GFPGAN on the input image"""
    command = [
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
    confidence: float = Form(5.0)
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
        
        # Step 1: Process with GFPGAN first
        gfpgan_output_dir = temp_dir / "gfpgan_output"
        gfpgan_output_dir.mkdir(exist_ok=True)
        enhanced_image_path = run_gfpgan(temp_path, gfpgan_output_dir)
        
        # Step 2: Process enhanced image with house detection
        total_detections, output_path = process_image_in_grid(enhanced_image_path)
        
        # Move the final result to our temp directory with unique name
        final_output_path = temp_dir / f"final_{unique_filename}"
        shutil.copy2(output_path, final_output_path)
        
        # Clean up intermediate files
        if os.path.exists(output_path):
            os.remove(output_path)
        
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
    finally:
        # Clean up temporary files
        shutil.rmtree(gfpgan_output_dir, ignore_errors=True)
        if os.path.exists(temp_path):
            os.remove(temp_path)

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
