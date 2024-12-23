# README.md

## **AI-Powered Satellite Imagery for Urban Planning**

### **Overview**

This project revolutionizes urban planning by utilizing advanced generative AI models to produce and enhance satellite imagery for development purposes. Traditionally, urban planning required investments of tens of thousands of dollars and years of effort to produce even an initial working draft. This process involved detailed feasibility studies, manual designs, and repetitive revisions. With this project, generating an urban plan on satellite imagery takes under 60 seconds and costs less than a dollar—primarily for hosting and VRAM usage for image generation.

At its core, this project uses a finely tuned **Stable Diffusion XL (SDXL) Inpainting model** alongside **GFPGAN** for enhancement and a custom-trained rooftop detection model for actionable outputs. It simplifies the complexities of urban planning and delivers outputs that are both visually coherent and practically relevant for decision-making in urban development.

---

### **Important Prerequisites**

1. **Local Weights**: 
   - The project was designed to work with locally saved weights from the GANs-based fine-tuning methodology. These weights need to be prepared beforehand.
   - However, for demonstration purposes, the default SDXL Inpainting weights should be downloaded into your environment *before running the project*. 

2. **GFPGAN Installation**: 
   - GFPGAN must also be downloaded and set up for image enhancement capabilities.

---

### **How It Works**

The project is modular and operates through Flask APIs to enable flexible integration. Here’s how the workflow is structured:

1. **Core Files**:
   - **`inference1.py`**:
     - Handles the **SDXL Inpainting model**.
     - Runs as a Flask API waiting for user inputs: an image and a corresponding mask.
     - The prompt for inpainting is predefined and must not be modified.
   - **`pipeline.py`**:
     - Contains the inference logic for **GFPGAN** enhancement and **rooftop detection**.
     - Also runs as a Flask API for integration.

2. **Master Control**:
   - **`main.py`**:
     - Acts as the central file for running the AI pipeline.
     - Sends requests to `inference1.py` for SDXL inpainting and then processes the output through `pipeline.py` for enhancement and rooftop detection.
     - **Important**: Ensure both `inference1.py` and `pipeline.py` are running before executing `main.py`.

3. **Supporting Files**:
   - **Sample Images and Masks**:
     - Included in the `flaskapi` folder to help users test the pipeline easily.
     - These can be used directly to send data to `inference1.py` and `pipeline.py` through `main.py`.

4. **Web Interface**:
   - The project includes the **`backend`** and **`geoaivista`** folders for hosting a user-friendly web interface. While these folders allow for demonstration purposes, the core AI generation can function independently using the Flask APIs in the `flaskapi` folder.

---

### **How to Use**

Note: PLEASE BE SURE TO READ THE FOLLOWING:
In the Inference1.py code containing the SDXL Model inference, please input the path to your model's downloaded directory.
For the masks and images, please be sure to refer the paths and names of the sample images and their corresponding masks into the `inference1.py` code where asked.
For the pipeline.py code containing the GFPGANs and Roboflow Detection model inference, please make sure to download the GFPGANs model into the `flaskapi` folder.


The list of models can be accessed here:

https://huggingface.co/diffusers/stable-diffusion-xl-1.0-inpainting-0.1
https://github.com/TencentARC/GFPGAN

1. **Set Up**:
   - Ensure the necessary weights and GFPGAN are downloaded and configured.
   - Place `inference1.py`, `pipeline.py`, `main.py`, and the sample images and masks in the `flaskapi` folder.

2. **Run APIs**:
   - Start `inference1.py` and `pipeline.py` as Flask servers:
     ```bash
     python inference1.py
     python pipeline.py
     ```

3. **Execute Main Pipeline**:
   - Once the APIs are running, execute `main.py` to process inputs and generate results:
     ```bash
     python main.py
     ```

4. **View Results**:
   - The generated outputs, enhanced images, and rooftop detection results will be displayed or saved for further use.

5. **Optional Web Interface**:
   - If demonstration via the web is required, use the `backend` and `geoaivista` folders to host the interface.

---

### **Project Highlights**

This project brings unprecedented efficiency and affordability to urban planning by automating the generation, enhancement, and analysis of satellite imagery. The workflow includes:

- **SDXL Inpainting Model**:
  - Generates contextually relevant satellite imagery with user-specified modifications.
- **GFPGAN Enhancement**:
  - Sharpens details and improves structural coherence for professional-grade results.
- **Rooftop Detection**:
  - Provides actionable data for population estimation, zoning analysis, and infrastructure planning.

With this system, urban planners and developers can create, refine, and analyze urban plans in minutes, enabling faster decision-making and reducing costs dramatically. Whether for quick prototyping or detailed development, this AI-powered solution is a game-changer for the industry.
