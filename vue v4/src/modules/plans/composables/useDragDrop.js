import { ref } from 'vue';

export function useDragDrop() {
    const draggedItemIndex = ref(-1);
    const dropTargetInfo = ref({ index: -1, position: null });

    let dragPreviewElement = null;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    const CSS_CLASSES = {
        dragging: 'dragging',
        spaceBefore: 'space-before',
        spaceAfter: 'space-after',
        chipWrapper: 'chip-wrapper'
    };

    const calculateDistance = (x1, y1, x2, y2) =>
        Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));

    const getChipCenter = (rect) => ({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    });

    const resetState = () => {
        draggedItemIndex.value = -1;
        dropTargetInfo.value = { index: -1, position: null };
    };

    const removeAllClasses = (elements, classes) => {
        elements.forEach((el) => el.classList.remove(...classes));
    };

    const createDragPreview = (draggedElement, event) => {
        removeDragPreview();

        const clone = draggedElement.cloneNode(true);
        const rect = draggedElement.getBoundingClientRect();

        dragOffsetX = event.clientX - rect.left;
        dragOffsetY = event.clientY - rect.top;

        Object.assign(clone.style, {
            id: 'drag-preview',
            position: 'fixed',
            pointerEvents: 'none',
            zIndex: '9999',
            opacity: '0.8',
            margin: '0',
            left: '0',
            top: '0',
            transform: 'translate(0, 0)'
        });

        clone.id = 'drag-preview';
        clone.classList.add('drag-preview');

        document.body.appendChild(clone);
        dragPreviewElement = clone;
        updateDragPreview(event);

        return clone;
    };

    const updateDragPreview = (event) => {
        if (!dragPreviewElement) {
            dragPreviewElement = document.getElementById('drag-preview');
        }

        if (dragPreviewElement) {
            const x = event.clientX - dragOffsetX;
            const y = event.clientY - dragOffsetY;
            dragPreviewElement.style.left = `${x}px`;
            dragPreviewElement.style.top = `${y}px`;
        }
    };

    const removeDragPreview = () => {
        if (dragPreviewElement) {
            dragPreviewElement.remove();
            dragPreviewElement = null;
        } else {
            const preview = document.getElementById('drag-preview');
            preview?.remove();
        }
    };

    const updateDropSpaces = (targetIndex, position, container) => {
        removeDropSpaces();

        dropTargetInfo.value = { index: targetIndex, position };

        const chips = container.querySelectorAll(`.${CSS_CLASSES.chipWrapper}`);
        chips.forEach((chip, index) => {
            chip.classList.remove(
                CSS_CLASSES.spaceBefore,
                CSS_CLASSES.spaceAfter
            );

            if (index === targetIndex) {
                const className =
                    position === 'before'
                        ? CSS_CLASSES.spaceBefore
                        : CSS_CLASSES.spaceAfter;
                chip.classList.add(className);
            }
        });
    };

    const removeDropSpaces = () => {
        const chips = document.querySelectorAll(`.${CSS_CLASSES.chipWrapper}`);
        removeAllClasses(chips, [
            CSS_CLASSES.spaceBefore,
            CSS_CLASSES.spaceAfter
        ]);
        dropTargetInfo.value = { index: -1, position: null };
    };

    const findClosestChip = (chips, mouseX, mouseY, excludeIndex = null) => {
        let closestChip = null;
        let closestDistance = Infinity;
        let closestIndex = -1;

        chips.forEach((chip, index) => {
            if (index === excludeIndex) return;

            const rect = chip.getBoundingClientRect();
            const center = getChipCenter(rect);
            const distance = calculateDistance(
                mouseX,
                mouseY,
                center.x,
                center.y
            );

            if (distance < closestDistance) {
                closestChip = chip;
                closestDistance = distance;
                closestIndex = index;
            }
        });

        return { chip: closestChip, index: closestIndex };
    };

    const calculateDropPosition = (rect, mouseX) =>
        rect.left + rect.width * 0.5 > mouseX ? 'before' : 'after';

    const isInvalidDropPosition = (closestIndex, position, draggedIndex) =>
        closestIndex === draggedIndex ||
        (position === 'before' && closestIndex === draggedIndex + 1) ||
        (position === 'after' && closestIndex === draggedIndex - 1);

    const performCleanup = () => {
        removeDragPreview();
        removeDropSpaces();
        document.removeEventListener('mousemove', updateDragPreview);

        const chips = document.querySelectorAll(`.${CSS_CLASSES.chipWrapper}`);
        removeAllClasses(chips, [
            CSS_CLASSES.dragging,
            CSS_CLASSES.spaceBefore,
            CSS_CLASSES.spaceAfter
        ]);
    };

    const moveItemInArray = (items, fromIndex, toIndex) => {
        const newItems = [...items];
        const [movedItem] = newItems.splice(fromIndex, 1);
        const adjustedToIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
        newItems.splice(adjustedToIndex, 0, movedItem);

        return newItems;
    };

    const handleDragStart = (event, index) => {
        draggedItemIndex.value = index;
        event.dataTransfer.setData('text/plain', index.toString());

        const chipElement =
            event.currentTarget.querySelector('.p-chip') || event.currentTarget;
        createDragPreview(chipElement, event);
        event.currentTarget.classList.add(CSS_CLASSES.dragging);

        document.addEventListener('mousemove', updateDragPreview);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        updateDragPreview(event);
    };

    const handleDrop = (
        event,
        { dropIndex, items, updateItems, afterUpdate }
    ) => {
        event.preventDefault();
        performCleanup();

        if (draggedItemIndex.value === dropIndex) {
            resetState();
            return;
        }

        const newItems = moveItemInArray(
            items,
            draggedItemIndex.value,
            dropIndex
        );
        updateItems(newItems);
        resetState();
        afterUpdate?.();
    };

    const handleDropAtEnd = (event, { items, updateItems, afterUpdate }) => {
        event.preventDefault();
        performCleanup();

        const newItems = [...items];
        const [movedItem] = newItems.splice(draggedItemIndex.value, 1);
        newItems.push(movedItem);

        updateItems(newItems);
        resetState();
        afterUpdate?.();
    };

    const handleAreaDragOver = (event, items) => {
        event.preventDefault();

        if (draggedItemIndex.value === -1) return;

        updateDragPreview(event);

        const dropArea = event.currentTarget;
        const chips = Array.from(
            dropArea.querySelectorAll(`.${CSS_CLASSES.chipWrapper}`)
        );

        if (chips.length === 0 || items.length === 0) return;

        const { chip: closestChip, index: closestIndex } = findClosestChip(
            chips,
            event.clientX,
            event.clientY,
            draggedItemIndex.value
        );

        if (closestChip) {
            const rect = closestChip.getBoundingClientRect();
            const position = calculateDropPosition(rect, event.clientX);

            if (
                isInvalidDropPosition(
                    closestIndex,
                    position,
                    draggedItemIndex.value
                )
            ) {
                removeDropSpaces();
                return;
            }

            updateDropSpaces(closestIndex, position, dropArea);
        } else {
            removeDropSpaces();
        }
    };

    const handleDropArea = (event, { items, updateItems, afterUpdate }) => {
        event.preventDefault();
        performCleanup();

        if (draggedItemIndex.value === -1) return;

        const dropArea = event.currentTarget;
        const chips = Array.from(
            dropArea.querySelectorAll(`.${CSS_CLASSES.chipWrapper}`)
        );

        if (chips.length === 0 || items.length === 0) {
            handleDropAtEnd(event, { items, updateItems, afterUpdate });
            return;
        }

        const { chip: closestChip, index: closestIndex } = findClosestChip(
            chips,
            event.clientX,
            event.clientY
        );

        if (closestChip) {
            const rect = closestChip.getBoundingClientRect();
            const dropBefore =
                calculateDropPosition(rect, event.clientX) === 'before';
            const dropIndex = dropBefore ? closestIndex : closestIndex + 1;

            if (
                draggedItemIndex.value === dropIndex ||
                (draggedItemIndex.value + 1 === dropIndex && !dropBefore)
            ) {
                resetState();
                return;
            }

            const newItems = moveItemInArray(
                items,
                draggedItemIndex.value,
                dropIndex
            );
            updateItems(newItems);
        } else {
            handleDropAtEnd(event, { items, updateItems, afterUpdate });
            return;
        }

        resetState();
        afterUpdate?.();
    };

    const handleDragEnd = () => {
        performCleanup();
        resetState();
    };

    const moveItemBetweenLists = ({
        item,
        sourceList,
        targetList,
        updateSourceList,
        updateTargetList,
        afterUpdate,
        filterFn
    }) => {
        if (filterFn && !filterFn(item)) return;

        const index = sourceList.findIndex((i) => i.id === item.id);
        if (index === -1) return;

        const newSourceList = [...sourceList];
        const newTargetList = [...targetList];
        const [removedItem] = newSourceList.splice(index, 1);

        newTargetList.push(removedItem);

        updateSourceList(newSourceList);
        updateTargetList(newTargetList);
        afterUpdate?.();
    };

    const cleanup = () => {
        performCleanup();
        resetState();
    };

    return {
        draggedItemIndex,
        dropTargetInfo,
        handleDragStart,
        handleDragOver,
        handleAreaDragOver,
        handleDragEnd,
        handleDrop,
        handleDropAtEnd,
        handleDropArea,
        moveItemBetweenLists,
        cleanup
    };
}
