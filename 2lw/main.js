// Main canvas, contains user image
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Additional canvas,
// will conatain selected part of main canvas image
const partialCanvas = document.createElement("canvas");
partialCanvas.id = "partialCanvas";
const partialCtx = partialCanvas.getContext("2d");

// Position of click when user will select
// area in canvas
let clickX;
let clickY;

ShowBitMap(ctx, "image.bmp", 0, 0);

// Show user image in canvas at specific position
function ShowBitMap(currentCtx, imageSrc, posX, posY, callback = () => {}, callBackParams = []) {
  let img = new Image();
  img.onload = function() {
    currentCtx.drawImage(img, posX, posY);
    callback(...callBackParams);
  };
  img.src = imageSrc;
}

document.body.addEventListener("mousedown", (event) => {
  // if we try to save selected fragment, prevent this function
  if (event.target.classList.contains("selection-area__save"))
    return;

  // if we already have selection area => remove it
  let previousSelection = document.body.querySelector(".selection-area");
  if (previousSelection)
    document.body.removeChild(previousSelection);
  
  // create selection area and calculate
  // coordinates of start click
  let selectionArea = document.createElement("div");
  selectionArea.classList.add("selection-area");
  document.body.appendChild(selectionArea);

  clickX = event.pageX;
  clickY = event.pageY;
  selectionArea.style.top = clickY + 'px';
  selectionArea.style.left = clickX + 'px';
  
  document.body.addEventListener("mousemove", mouseMove);

  document.body.addEventListener("mouseup", (e) => {
    document.body.removeEventListener("mousemove", mouseMove);
    showContextMenu();
  });
});

// Draw selection area
function mouseMove(event) {
  let currentSelection = document.body.querySelector(".selection-area");
  let selectionStyle = currentSelection.style;
  selectionStyle.top = Math.min(clickY, event.pageY) + 'px';
  selectionStyle.left = Math.min(clickX, event.pageX) + 'px';
  selectionStyle.width = Math.abs(event.pageX - clickX) + 'px';
  selectionStyle.height = Math.abs(event.pageY - clickY) + 'px';
}

// When selection ends
// show context menu with action buttons
function showContextMenu() {
  // if already have context menu in DOM => skip function
  let selection = document.body.querySelector(".selection-area");
  if (selection.querySelector(".selection-area__actions"))
    return;

  let menu = document.createElement("div"),
    saveButton = document.createElement("button");

  menu.classList.add("selection-area__actions");
  saveButton.classList.add("selection-area__save");

  saveButton.innerHTML = "Save";
  menu.appendChild(saveButton);

  saveButton.addEventListener("click", (e) => {
    createPartialCanvas();
    document.body.removeChild(selection);
  });

  if (selection)
    selection.appendChild(menu);
}

// When user click 'save' action at the
// context menu => create sub-canvas
// which sizes equal to selection area
function createPartialCanvas() {
  let selectedArea = document.querySelector(".selection-area");
  
  let width = +selectedArea.style.width.replace("px", "");
  let height = +selectedArea.style.height.replace("px", "");
  let top = +selectedArea.style.top.replace("px", "");
  let left = +selectedArea.style.left.replace("px", "");

  partialCanvas.width = width;
  partialCanvas.height = height;
  partialCanvas.style.top = top + 'px';
  partialCanvas.style.left = left + 'px';

  // Create copy of image at main canvas
  // and set position as partial-canvas position
  ShowBitMap(
    partialCtx,
    `image.bmp`,
    -left,
    -top,
    ClientToBmp,
    [partialCanvas, `image-part${Date.now()}.bmp`]
  );

  if (!document.body.contains(partialCanvas))
    document.body.appendChild(partialCanvas);
}

// Save to file content of canvas
function ClientToBmp(canvas, filename) {
  let link = document.createElement('a');
  let event;
  link.download = filename;
  link.href = canvas.toDataURL();

  if (document.createEvent) {
    event = document.createEvent("MouseEvents");
    event.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    link.dispatchEvent(event);
  } else if (link.fireEvent) {
    link.fireEvent("onclick");
  }
}