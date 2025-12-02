document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    const imageState = {
        a: { wrapper: document.getElementById('image-a-wrapper'), img: document.getElementById('img-a'), x: 0, y: 0, visible: false },
        b: { wrapper: document.getElementById('image-b-wrapper'), img: document.getElementById('img-b'), x: 0, y: 0, visible: false },
        c: { wrapper: document.getElementById('image-c-wrapper'), img: document.getElementById('img-c'), x: 0, y: 0, visible: false },
        d: { wrapper: document.getElementById('image-d-wrapper'), img: document.getElementById('img-d'), x: 0, y: 0, visible: false },
    };
    let selectedImageId = null;
    let masterScaleInfo = null; // To store scale of the first image

    // --- DOM ELEMENTS ---
    const controlBtns = document.querySelectorAll('.image-control-btn');
    const fileInputs = document.querySelectorAll('.hidden-input');
    const arrowBtns = document.querySelectorAll('.arrow-btn');
    const processBtn = document.getElementById('process-btn');
    const resetBtn = document.getElementById('reset-all-btn');
    const intersectionIndicator = document.getElementById('intersection-indicator');
    const container = document.querySelector('.overlap-container');
    const resultsStandard = document.getElementById('results-standard');
    const resultsProcessed = document.getElementById('results-processed');

    // --- CORE FUNCTIONS ---

    const updateButtonStates = () => {
        const visibleImagesCount = Object.values(imageState).filter(s => s.visible).length;
        processBtn.disabled = visibleImagesCount < 2;
    };

    const selectImage = (imageId) => {
        if (!imageState[imageId] || !imageState[imageId].visible) return;

        selectedImageId = imageId;

        controlBtns.forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.imageId === imageId);
        });

        Object.values(imageState).forEach(state => {
            state.wrapper.classList.toggle('selected', state.wrapper.dataset.imageId === imageId);
        });
    };

    const updatePosition = (imageId, newX, newY) => {
        const state = imageState[imageId];
        if (!state) return;

        state.x = newX;
        state.y = newY;
        state.wrapper.style.transform = `translate(${newX}px, ${newY}px)`;
        calculateIntersection();
    };

    const getImageBounds = (imageId) => {
        const state = imageState[imageId];
        if (!state.visible) return null;
        
        return {
            left: state.x,
            top: state.y,
            right: state.x + state.img.offsetWidth,
            bottom: state.y + state.img.offsetHeight,
            width: state.img.offsetWidth,
            height: state.img.offsetHeight
        };
    };

    const calculateIntersection = () => {
        const visibleImages = Object.keys(imageState).filter(id => imageState[id].visible);
        if (visibleImages.length < 2) {
            intersectionIndicator.style.display = 'none';
            return null;
        }

        let intersection = getImageBounds(visibleImages[0]);

        for (let i = 1; i < visibleImages.length; i++) {
            const bounds = getImageBounds(visibleImages[i]);
            intersection.left = Math.max(intersection.left, bounds.left);
            intersection.top = Math.max(intersection.top, bounds.top);
            intersection.right = Math.min(intersection.right, bounds.right);
            intersection.bottom = Math.min(intersection.bottom, bounds.bottom);
        }

        const width = intersection.right - intersection.left;
        const height = intersection.bottom - intersection.top;

        if (width <= 0 || height <= 0) {
            intersectionIndicator.style.display = 'none';
            return null;
        }
        
        intersectionIndicator.style.display = 'block';
        intersectionIndicator.style.left = `${intersection.left}px`;
        intersectionIndicator.style.top = `${intersection.top}px`;
        intersectionIndicator.style.width = `${width}px`;
        intersectionIndicator.style.height = `${height}px`;

        return { ...intersection, width, height };
    };

    const generateAndDisplayCrop = (imageId, resultContainer, intersectionBox, process) => {
        const state = imageState[imageId];
        if (!state.visible || !intersectionBox) return;

        const { img, x, y } = state;
        const scale = img.naturalWidth / img.width;

        const canvas = document.createElement('canvas');
        canvas.width = intersectionBox.width * scale;
        canvas.height = intersectionBox.height * scale;
        const ctx = canvas.getContext('2d');

        const sourceX = (intersectionBox.left - x) * scale;
        const sourceY = (intersectionBox.top - y) * scale;

        ctx.drawImage(img, sourceX, sourceY, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);

        if (process) {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                const avg = 0.2126 * data[i] + 0.7152 * data[i+1] + 0.0722 * data[i+2];
                const inverted = 255 - avg;
                data[i] = data[i + 1] = data[i + 2] = inverted;
            }
            ctx.putImageData(imageData, 0, 0);
        }

        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        resultItem.innerHTML = `<p>Image ${imageId.toUpperCase()}</p><img src="${canvas.toDataURL()}">`;
        resultContainer.appendChild(resultItem);
    };

    const resetAll = () => {
        Object.keys(imageState).forEach(id => {
            const state = imageState[id];
            state.img.src = '';
            state.img.style.width = 'auto';
            state.img.style.height = 'auto';
            state.wrapper.classList.remove('visible', 'selected');
            state.visible = false;
            updatePosition(id, 0, 0);
        });
        controlBtns.forEach(btn => btn.classList.remove('selected'));
        resultsStandard.innerHTML = '';
        resultsProcessed.innerHTML = '';
        selectedImageId = null;
        masterScaleInfo = null; // Reset master scale
        calculateIntersection();
        updateButtonStates();
    };

    // --- EVENT LISTENERS ---

    controlBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (e.target.tagName !== 'LABEL' && e.target.tagName !== 'I') {
                selectImage(btn.dataset.imageId);
            }
        });
    });

    fileInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            const imageId = e.target.id.split('-')[1];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const state = imageState[imageId];
                    state.img.src = event.target.result;
                    state.img.onload = () => {

                        if (!masterScaleInfo) {
                            // This is the first image, establish master scale
                            const scaleX = container.offsetWidth / state.img.naturalWidth;
                            const scaleY = container.offsetHeight / state.img.naturalHeight;
                            const scale = Math.min(scaleX, scaleY);
                            masterScaleInfo = { scale };
                        }
                        
                        // Apply scale
                        const { scale } = masterScaleInfo;
                        state.img.style.width = `${state.img.naturalWidth * scale}px`;
                        state.img.style.height = `${state.img.naturalHeight * scale}px`;
                        
                        // Finalize state and position
                        state.wrapper.classList.add('visible');
                        state.visible = true;

                        // Use a timeout to ensure offsetWidth/Height are correct after style change
                        setTimeout(() => {
                            const initialX = (container.offsetWidth - state.img.offsetWidth) / 2;
                            const initialY = (container.offsetHeight - state.img.offsetHeight) / 2;
                            updatePosition(imageId, initialX, initialY);
                            
                            selectImage(imageId);
                            updateButtonStates();
                            calculateIntersection();
                        }, 0);
                    };
                };
                reader.readAsDataURL(file);
            }
        });
    });

    arrowBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!selectedImageId) return;
            let { x, y } = imageState[selectedImageId];
            const step = 1; // 1px movement
            switch (btn.id) {
                case 'move-up': y -= step; break;
                case 'move-down': y += step; break;
                case 'move-left': x -= step; break;
                case 'move-right': x += step; break;
            }
            updatePosition(selectedImageId, x, y);
        });
    });

    processBtn.addEventListener('click', () => {
        const intersectionBox = calculateIntersection();
        if (!intersectionBox) {
            alert('Images do not overlap sufficiently.');
            return;
        }
        resultsStandard.innerHTML = '';
        resultsProcessed.innerHTML = '';
        Object.keys(imageState).forEach(id => {
            if (imageState[id].visible) {
                generateAndDisplayCrop(id, resultsStandard, intersectionBox, false);
                generateAndDisplayCrop(id, resultsProcessed, intersectionBox, true);
            }
        });
    });

    resetBtn.addEventListener('click', resetAll);

    // --- DRAGGING LOGIC ---
    let isDragging = false;
    let startX, startY, initialX, initialY;

    const startDrag = (e) => {
        const wrapper = e.currentTarget;
        const imageId = wrapper.dataset.imageId;
        if (!imageState[imageId] || !imageState[imageId].visible) return;
        
        selectImage(imageId);
        isDragging = true;
        wrapper.style.cursor = 'grabbing';

        const coords = e.touches ? e.touches[0] : e;
        startX = coords.clientX;
        startY = coords.clientY;
        initialX = imageState[imageId].x;
        initialY = imageState[imageId].y;
        
        e.preventDefault();
    };

    const drag = (e) => {
        if (!isDragging || !selectedImageId) return;

        const coords = e.touches ? e.touches[0] : e;
        const dx = coords.clientX - startX;
        const dy = coords.clientY - startY;

        updatePosition(selectedImageId, initialX + dx, initialY + dy);
    };

    const endDrag = (e) => {
        if (!isDragging || !selectedImageId) return;
        isDragging = false;
        imageState[selectedImageId].wrapper.style.cursor = 'grab';
    };

    Object.values(imageState).forEach(state => {
        state.wrapper.addEventListener('mousedown', startDrag);
        state.wrapper.addEventListener('touchstart', startDrag, { passive: false });
    });

    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);

    // Initial setup
    resetAll();
});
