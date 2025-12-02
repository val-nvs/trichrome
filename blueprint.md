# Blueprint: Image Overlap and Cropping Tool

## Overview

This application is a powerful and interactive Image Overlap and Cropping Tool. It allows users to upload multiple images, position them on a digital canvas, and extract new images from the area where they all overlap. The tool provides both standard and artistically processed (inverted and desaturated) versions of the cropped sections.

## Project Outline

### 1. **Visual Design & Layout**

-   **Aesthetics**: Clean, modern interface with a visually balanced layout.
-   **Colors**: A vibrant color palette will be used to assign a unique color to each uploaded image (up to four). These colors will be used for borders and identifiers.
-   **Typography**: Expressive and clear typography will be used for headings and labels to enhance usability.
-   **Layout**:
    -   A main header section with the application title: "Overlap & Dynamic Crop Tool".
    -   A control panel section with:
        -   Individual upload controls for "Image A" and "Image B".
        -   An "Add Image" button to add more image uploaders (up to 4 total).
        -   A "Remove All Photos" button.
        -   A "Generate Crops Where Images Intersect" button.
        -   A "Reset Scale & Position" button.
    -   A central "workspace" or "canvas" area where images are displayed and manipulated.
    -   A "results" section at the bottom to display the generated cropped images.
-   **Responsiveness**: The application will be mobile-responsive, ensuring it works well on different screen sizes.

### 2. **Core Features**

-   **Image Upload**:
    -   Users can upload 2 to 4 images using individual "Upload" buttons.
    -   The "Add Image" button dynamically adds more upload slots.
    -   Each uploaded image is assigned a letter (A, B, C, D) and a unique color.
-   **Interactive Workspace**:
    -   Uploaded images are rendered in the workspace with semi-transparency.
    -   Users can select, drag, and move images.
    -   Keyboard controls for precise movement.
-   **Intersection Detection**:
    -   The application calculates and highlights the overlapping area of all images in real-time.
-   **Image Cropping and Processing**:
    -   The "Generate Crops..." button extracts the intersection area from each image.
    -   Creates a standard crop and a processed (inverted, desaturated) crop for each.
-   **Results Display**:
    -   Displays all generated crops with a colored border corresponding to their source image.
-   **Controls**:
    -   "Remove All Photos" clears the workspace and results.
    -   "Reset Scale & Position" moves all images back to their original positions.

### 3. **Component & Code Structure**

-   **`index.html`**: Contains the semantic HTML for the new layout.
-   **`style.css`**: Styles the new layout and components.
-   **`main.js`**: Implements the application logic, including the new button functionalities.

## Current Plan

1.  **Update `index.html`**: Modify the HTML to create the new user interface with the requested buttons and text.
2.  **Update `style.css`**: Adjust the CSS to style the new layout and ensure it is visually appealing and responsive.
3.  **Update `main.js`**: Rewrite the JavaScript to handle the new individual upload buttons, the "Add Image", "Remove All Photos", and "Reset Scale & Position" functionalities, while maintaining the core drag-and-drop and intersection logic.
