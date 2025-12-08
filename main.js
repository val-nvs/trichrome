document.addEventListener('DOMContentLoaded', () => {
    // --- DPI WARNING ---
    if (window.devicePixelRatio > 1) {
        const warning = document.getElementById('dpi-warning');
        if(warning) warning.style.display = 'block';
    }

    // --- COLLAPSIBLE MENU ---
    const menuToggle = document.querySelector('.menu-toggle');
    const menuContent = document.querySelector('.menu-content');

    if (menuToggle && menuContent) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            if (menuContent.style.maxHeight) {
                menuContent.style.maxHeight = null;
            } else {
                menuContent.style.maxHeight = menuContent.scrollHeight + "px";
            }
        });
    }

    // --- STATE MANAGEMENT ---
    const imageState = {
        a: { wrapper: document.getElementById('image-a-wrapper'), img: document.getElementById('img-a'), x: 0, y: 0, visible: false },
        b: { wrapper: document.getElementById('image-b-wrapper'), img: document.getElementById('img-b'), x: 0, y: 0, visible: false },
        c: { wrapper: document.getElementById('image-c-wrapper'), img: document.getElementById('img-c'), x: 0, y: 0, visible: false },
        d: { wrapper: document.getElementById('image-d-wrapper'), img: document.getElementById('img-d'), x: 0, y: 0, visible: false },
    };
    let selectedImageId = null;
    let masterScaleInfo = null;

    // --- DOM ELEMENTS ---
    const controlBtns = document.querySelectorAll('.image-control-btn');
    const fileInputs = document.querySelectorAll('.hidden-input');
    const removeBtns = document.querySelectorAll('.remove-btn');
    const arrowBtns = document.querySelectorAll('.arrow-btn');
    const processBtn = document.getElementById('process-btn');
    const resetBtn = document.getElementById('reset-all-btn');
    const intersectionIndicator = document.getElementById('intersection-indicator');
    const container = document.querySelector('.overlap-container');
    const resultsStandard = document.getElementById('results-standard');
    const resultsProcessed = document.getElementById('results-processed');

    // --- CORE FUNCTIONS ---

    const initializePlaceholders = () => {
        resultsStandard.innerHTML = '';
        resultsProcessed.innerHTML = '';
        for (let i = 0; i < 4; i++) {
            const placeholder = document.createElement('div');
            placeholder.className = 'result-placeholder';
            resultsStandard.appendChild(placeholder.cloneNode());
            resultsProcessed.appendChild(placeholder.cloneNode());
        }
    };

    const updateButtonStates = () => {
        const visibleImagesCount = Object.values(imageState).filter(s => s.visible).length;
        processBtn.disabled = visibleImagesCount < 2;

        let firstEmptySlot = -1;

        controlBtns.forEach((btn, index) => {
            const imageId = btn.dataset.imageId;
            const state = imageState[imageId];
            const removeBtn = btn.querySelector('.remove-btn');
            const uploadText = btn.querySelector('.upload-text');

            btn.classList.remove('selected', 'locked', 'unused');

            if (state.visible) {
                if (selectedImageId === imageId) {
                    btn.classList.add('selected');
                }
                removeBtn.classList.remove('hidden');
                if (uploadText) uploadText.textContent = 'Change';
            } else {
                if (firstEmptySlot === -1) {
                    firstEmptySlot = index;
                }
                removeBtn.classList.add('hidden');
                if (uploadText) uploadText.textContent = 'Upload';
                
                if (index > firstEmptySlot) {
                    btn.classList.add('locked');
                } else {
                    btn.classList.add('unused');
                }
            }
        });
    };

    const selectImage = (imageId) => {
        if (!imageState[imageId] || !imageState[imageId].visible) return;
        selectedImageId = imageId;
        updateButtonStates();

        Object.values(imageState).forEach(state => {
            const isSelected = state.wrapper.dataset.imageId === imageId;
            state.wrapper.classList.toggle('selected', isSelected);
            state.wrapper.style.zIndex = isSelected ? 10 : 1;
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

    const removeImage = (imageId) => {
        const state = imageState[imageId];
        if (!state) return;
    
        state.img.src = '';
        state.wrapper.classList.remove('visible', 'selected');
        state.visible = false;
        updatePosition(imageId, 0, 0);

        if (selectedImageId === imageId) {
            const visibleIds = Object.keys(imageState).filter(id => imageState[id].visible);
            if (visibleIds.length > 0) {
                selectImage(visibleIds[0]);
            } else {
                selectedImageId = null;
            }
        }
    
        calculateIntersection();
        updateButtonStates();
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
        if (!img.complete || img.naturalWidth === 0) return;

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
        
        const placeholder = resultContainer.querySelector(`.result-placeholder[data-image-id-placeholder="${imageId}"]`);
        if (placeholder) {
            resultContainer.replaceChild(resultItem, placeholder);
        } else {
             resultContainer.appendChild(resultItem);
        }
    };

    const resetAll = () => {
        Object.keys(imageState).forEach(id => {
            const state = imageState[id];
            state.img.src = '';
            state.wrapper.classList.remove('visible', 'selected');
            state.visible = false;
            updatePosition(id, 0, 0);
        });
        
        initializePlaceholders();
        selectedImageId = null;
        masterScaleInfo = null;
        calculateIntersection();
        updateButtonStates();
    };

    // --- EVENT LISTENERS ---

    controlBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (btn.classList.contains('locked')) return;
            if (!e.target.closest('.remove-btn') && !e.target.closest('label')) {
                selectImage(btn.dataset.imageId);
            }
        });
    });

    removeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const imageId = e.currentTarget.dataset.imageId;
            removeImage(imageId);
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
                            const scaleX = container.offsetWidth / state.img.naturalWidth;
                            const scaleY = container.offsetHeight / state.img.naturalHeight;
                            const scale = Math.min(scaleX, scaleY);
                            masterScaleInfo = { scale };
                        }
                        
                        const { scale } = masterScaleInfo;
                        state.img.style.width = `${state.img.naturalWidth * scale}px`;
                        state.img.style.height = `${state.img.naturalHeight * scale}px`;
                        
                        state.wrapper.classList.add('visible');
                        state.visible = true;

                        setTimeout(() => {
                            const initialX = (container.offsetWidth - state.img.offsetWidth) / 2;
                            const initialY = (container.offsetHeight - state.img.offsetHeight) / 2;
                            updatePosition(imageId, initialX, initialY);
                            selectImage(imageId);
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
            const step = 10; // 10px movement
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
        
        initializePlaceholders();

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

        const eventX = e.touches ? e.touches[0].clientX : e.clientX;
        const eventY = e.touches ? e.touches[0].clientY : e.clientY;

        startX = eventX;
        startY = eventY;
        initialX = imageState[imageId].x;
        initialY = imageState[imageId].y;
        
        e.preventDefault();
    };

    const drag = (e) => {
        if (!isDragging || !selectedImageId) return;

        const eventX = e.touches ? e.touches[0].clientX : e.clientX;
        const eventY = e.touches ? e.touches[0].clientY : e.clientY;

        const dx = eventX - startX;
        const dy = eventY - startY;

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