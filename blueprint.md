# Blueprint: Image Overlap and Cropping Tool

## Overview

This application is a powerful and interactive Image Overlap and Cropping Tool. It allows users to upload multiple images, position them on a digital canvas, and extract new images from the area where they all overlap. The tool provides both standard and artistically processed (inverted and desaturated) versions of the cropped sections.

## Project Outline

### 1. **Visual Design & Layout**
- **Aesthetics**: Clean, modern interface with a visually balanced layout.
- **Colors**: A vibrant color palette will be used to assign a unique color to each uploaded image (up to four). These colors will be used for borders and identifiers.
- **Typography**: Expressive and clear typography will be used for headings and labels to enhance usability.
- **Layout**:
    - A main header section with the application title.
    - A control panel section for image uploads and the "Generate Crops" button.
    - A central "workspace" or "canvas" area where images are displayed and manipulated.
    - A "results" section at the bottom to display the generated cropped images.
- **Responsiveness**: The application will be mobile-responsive, ensuring it works well on different screen sizes.

### 2. **Core Features**

- **Image Upload**:
    - An input control allows users to select 2 to 4 local image files.
    - Each uploaded image is assigned a letter (A, B, C, D) and a unique color for easy identification.
- **Interactive Workspace**:
    - Uploaded images are rendered in the workspace with semi-transparency (e.g., `opacity: 0.7`) to make overlapping areas visible.
    - Users can select one image at a time. The selected image will have a distinct visual indicator (e.g., a solid border).
    - **Image Manipulation**:
        - **Drag and Drop**: Users can click and drag the selected image to move it around the workspace.
        - **Keyboard Controls**: Users can use the arrow keys for precise, pixel-by-pixel movement of the selected image.
- **Intersection Detection**:
    - The application continuously calculates the rectangular area where **all** uploaded images are currently overlapping.
    - This intersection area is visually highlighted on the workspace with a distinct, noticeable style (e.g., a dashed border or a colored overlay).
    - The highlight dynamically updates in real-time as images are moved. If there is no overlap, the highlight disappears.
- **Image Cropping and Processing**:
    - A "Generate Crops" button initiates the cropping process.
    - For each original image, two new images are generated based on the intersection area:
        1.  **Standard Crop**: A direct crop of the portion of the image within the intersection boundary.
        2.  **Processed Crop**: A stylized version of the crop that is both inverted and desaturated (black and white).
- **Results Display**:
    - All generated crops (both standard and processed) are displayed in the results section.
    - Each resulting image has a colored border corresponding to the color of its original source image, making it easy to trace its origin.

### 3. **Component & Code Structure**

- **`index.html`**:
    - Contains the semantic HTML structure for the header, controls, workspace, and results sections.
    - Links to the `style.css` and `main.js` files.
- **`style.css`**:
    - Implements the full visual design using modern CSS.
    - Uses CSS Custom Properties (`--image-a-color`, etc.) for theming the image identifiers.
    - Styles for transparency, selection highlights, intersection box, and result image borders.
    - Implements responsive design using media queries.
- **`main.js`**:
    - Contains all the application logic, organized into modules or classes.
    - **File Handling**: Manages file input and loading images onto the workspace.
    - **State Management**: Tracks the position, size, and selection state of each image.
    - **Event Handling**: Listens for mouse (drag), keyboard (arrow keys), and button click events.
    - **Intersection Logic**: Implements the algorithm to calculate the intersection of multiple rectangles.
    - **Canvas Manipulation**:
        - Uses the `<canvas>` element to perform the cropping operations.
        - Implements the image processing (inversion and desaturation) using canvas `getImageData` and `putImageData`.
    - **DOM Manipulation**: Dynamically creates and updates elements for the workspace and results section.

## Current Plan

1.  **Create `index.html`**: Set up the basic structure for the application.
2.  **Create `style.css`**: Add initial styling for the layout and core components.
3.  **Create `main.js`**: Implement the file upload and image display functionality.
