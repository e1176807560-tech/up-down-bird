let bgImg = null;
let frames = [];
let frameSources = [];
let currentFrame = 0;
let playing = true;
let lastFrameTime = 0;
let lastMotionTime = 0;

//
// =========================
// 固定画布尺寸：1600 × 900
// =========================
//
let canvasW = 1600;
let canvasH = 900;

const initialBirdW = 260;
const initialBirdH = 88;

let birdX = 800;
let birdY = 450;

let birdScale = 100;
let birdW = initialBirdW;
let birdH = initialBirdH;

let fps = 10;
let glow = 0;
let birdColor = "#ffffff";

//
// 鸟的运动参数
//
const fallSpeed = 100;
const jumpDistance = 50;

let actualSvgSize = {
w: initialBirdW,
h: initialBirdH
};

let sourceSvgName = "bird.svg";

let horizontalDrift = 0;
let lastDriftTime = 0;

// ======================================================
// SETUP
// ======================================================

function setup() {

const c = createCanvas(canvasW, canvasH);

c.parent("canvas-wrap");

imageMode(CORNER);

loadFixedBackground();
loadDefaultSVG();

centerBird();

lastMotionTime = millis();
lastDriftTime = millis();

setRandomDrift();
}

// ======================================================
// DRAW
// ======================================================

function draw() {

background(245);

// =========================
// 背景
// =========================

if (bgImg) {
drawBackgroundCover(bgImg);
}

const now = millis();

// =========================
// 鸟帧动画
// =========================

if (
playing &&
frames.length &&
now - lastFrameTime >= 1000 / fps
) {

```
const steps = Math.max(
  1,
  Math.floor(
    (now - lastFrameTime) / (1000 / fps)
  )
);

currentFrame =
  (currentFrame + steps) % frames.length;

lastFrameTime = now;
```

}

// =========================
// 每秒改变一次左右漂移方向
// =========================

if (now - lastDriftTime >= 1000) {

```
setRandomDrift();

lastDriftTime = now;
```

}

// =========================
// 鸟的下落
// =========================

const previousY = birdY;

const dt = Math.min(
0.1,
(now - lastMotionTime) / 1000
);

const bottomLimit =
height - birdH * 0.5;

if (dt > 0) {

```
birdY += fallSpeed * dt;

if (birdY >= bottomLimit) {

  birdY = bottomLimit;
}
```

}

// =========================
// 左右漂移
// =========================

birdX += horizontalDrift * dt;

birdX = constrain(
birdX,
width / 2 - 300,
width / 2 + 300
);

lastMotionTime = now;

// =========================
// 绘制鸟
// =========================

if (frames.length) {

```
const frame = frames[currentFrame];

if (
  frame &&
  frame.width > 0 &&
  frame.height > 0
) {

  const alpha =
    getBirdAlpha(
      previousY,
      birdY
    );


  drawTintedFrame(
    frame,
    birdX - birdW / 2,
    birdY - birdH / 2,
    birdW,
    birdH,
    alpha
  );
}
```

}
}

// ======================================================
// 背景图片：保持比例铺满画布
// 类似 CSS background-size: cover
// ======================================================

function drawBackgroundCover(img) {

const canvasRatio =
width / height;

const imgRatio =
img.width / img.height;

let drawW;
let drawH;
let drawX;
let drawY;

if (imgRatio > canvasRatio) {

```
// 图片比画布更宽
// 按高度缩放

drawH = height;

drawW =
  img.width *
  (height / img.height);

drawX =
  (width - drawW) / 2;

drawY = 0;
```

} else {

```
// 图片比画布更高
// 按宽度缩放

drawW = width;

drawH =
  img.height *
  (width / img.width);

drawX = 0;

drawY =
  (height - drawH) / 2;
```

}

image(
img,
drawX,
drawY,
drawW,
drawH
);
}

// ======================================================
// 鸟的绘制
// ======================================================

function drawTintedFrame(
img,
x,
y,
w,
h,
alpha = 255
) {

push();

if (glow > 0) {

```
drawingContext.save();

drawingContext.shadowColor =
  birdColor;

drawingContext.shadowBlur =
  glow;

tint(
  255,
  alpha
);

image(
  img,
  x,
  y,
  w,
  h
);

drawingContext.restore();
```

} else {

```
tint(
  255,
  alpha
);

image(
  img,
  x,
  y,
  w,
  h
);
```

}

noTint();

pop();
}

// ======================================================
// 左右随机漂移
// ======================================================

function setRandomDrift() {

horizontalDrift =
random(-30, 30);
}

// ======================================================
// 鸟接近底部时逐渐消失
// ======================================================

function getBirdAlpha(
previousY,
currentY
) {

const bottomThreshold =
height - birdH * 0.5;

const fadeStart =
bottomThreshold - 600;

if (currentY >= bottomThreshold) {

```
return 0;
```

}

if (currentY >= fadeStart) {

```
return Math.round(
  map(
    currentY,
    fadeStart,
    bottomThreshold,
    255,
    0,
    true
  )
);
```

}

return 255;
}

// ======================================================
// 加载固定背景
// ======================================================

function loadFixedBackground() {

const bgUrl =
"background_updown_bird.webp";

loadImage(

```
bgUrl,

img => {

  bgImg = img;


  // 永远保持 1600 × 900

  canvasW = 1600;
  canvasH = 900;

  resizeCanvas(
    canvasW,
    canvasH
  );


  centerBird();
},


() => {

  // 图片加载失败
  // 仍然保持 16:9

  bgImg = null;

  canvasW = 1600;
  canvasH = 900;

  resizeCanvas(
    canvasW,
    canvasH
  );


  centerBird();
}
```

);
}

// ======================================================
// 鸟回到画面中央
// ======================================================

function centerBird() {

birdX = width / 2;

birdY = height / 2;

birdX = constrain(
birdX,
width / 2 - 300,
width / 2 + 300
);

updateBirdSize();
}

// ======================================================
// 更新鸟尺寸
// ======================================================

function updateBirdSize() {

birdW =
actualSvgSize.w;

birdH =
actualSvgSize.h;
}

// ======================================================
// 恢复初始设置
// ======================================================

function resetSettings() {

birdScale = 100;

updateBirdSize();

birdX =
width / 2;

birdY =
height / 2;

fps = 10;

glow = 0;

birdColor = "#ffffff";

playing = true;

currentFrame = 0;

sourceSvgName = "bird.svg";

setRandomDrift();

lastDriftTime =
millis();

loadDefaultSVG();
}

// ======================================================
// 点击画布：鸟向上跳
// ======================================================

document
.querySelector("#canvas-wrap")
.addEventListener(
"click",
e => {

```
  if (
    e.target.tagName.toLowerCase()
    !== "canvas"
  ) {
    return;
  }


  birdY -= jumpDistance;

  lastMotionTime =
    millis();
}
```

);

// ======================================================
// 加载 SVG
// ======================================================

async function loadDefaultSVG() {

try {

```
const r =
  await fetch("bird.svg");


if (!r.ok) {

  throw new Error(
    "bird.svg 加载失败"
  );
}


buildFramesFromSVG(
  await r.text()
);
```

} catch (e) {

```
sourceSvgName =
  "bird.svg";
```

}
}

// ======================================================
// 从 SVG 创建动画帧
// ======================================================

function buildFramesFromSVG(
svgText
) {

try {

```
const parser =
  new DOMParser();


const doc =
  parser.parseFromString(
    svgText,
    "image/svg+xml"
  );


const svg =
  doc.documentElement;


const viewBox =
  svg.getAttribute(
    "viewBox"
  ) ||
  "0 0 1000 1000";


let elements =
  Array.from(
    svg.children
  ).filter(
    el =>
      [
        "path",
        "g",
        "polygon",
        "polyline",
        "rect",
        "circle",
        "ellipse",
        "line"
      ].includes(
        el.tagName.toLowerCase()
      )
  );


if (!elements.length) {

  elements =
    Array.from(
      svg.querySelectorAll(
        "path,polygon,polyline,rect,circle,ellipse,line,g"
      )
    );
}


const numbered =
  elements
    .map(
      (el, index) => {

        const id =
          el.getAttribute("id") ||
          "";

        const matches =
          id.match(/\d+/g);


        return {
          el,
          index,
          num:
            matches
              ? Number(
                  matches[
                    matches.length - 1
                  ]
                )
              : Infinity
        };
      }
    )
    .sort(
      (a, b) =>
        a.num !== b.num
          ? a.num - b.num
          : a.index - b.index
    );


frameSources = [];
frames = [];


const serializer =
  new XMLSerializer();


numbered.forEach(
  item => {

    const ndoc =
      document.implementation
        .createDocument(
          "http://www.w3.org/2000/svg",
          "svg",
          null
        );


    const root =
      ndoc.documentElement;


    root.setAttribute(
      "xmlns",
      "http://www.w3.org/2000/svg"
    );


    root.setAttribute(
      "viewBox",
      viewBox
    );


    if (
      svg.getAttribute("width")
    ) {

      root.setAttribute(
        "width",
        svg.getAttribute("width")
      );
    }


    if (
      svg.getAttribute("height")
    ) {

      root.setAttribute(
        "height",
        svg.getAttribute("height")
      );
    }


    const defs =
      svg.querySelector(
        "defs"
      );


    if (defs) {

      root.appendChild(
        ndoc.importNode(
          defs,
          true
        )
      );
    }


    const frameElement =
      ndoc.importNode(
        item.el,
        true
      );


    frameElement.setAttribute(
      "fill",
      "__BIRD_COLOR__"
    );


    frameElement.setAttribute(
      "stroke",
      "__BIRD_COLOR__"
    );


    root.appendChild(
      frameElement
    );


    frameSources.push(
      serializer.serializeToString(
        ndoc
      )
    );
  }
);


currentFrame = 0;

lastFrameTime =
  millis();


const svgSize =
  getSvgNaturalSize(svg);


if (
  svgSize.width > 0 &&
  svgSize.height > 0
) {

  actualSvgSize = {
    w: svgSize.width,
    h: svgSize.height
  };


  birdW =
    actualSvgSize.w;

  birdH =
    actualSvgSize.h;
}


renderFrames();
```

} catch (err) {

```
frames = [];
```

}
}

// ======================================================
// 获取 SVG 原始尺寸
// ======================================================

function getSvgNaturalSize(svg) {

const width =
Number(
svg.getAttribute("width")
);

const height =
Number(
svg.getAttribute("height")
);

const viewBox =
svg.getAttribute(
"viewBox"
);

if (viewBox) {

```
const values =
  viewBox
    .split(/\s+/)
    .map(Number)
    .filter(
      Number.isFinite
    );


if (values.length === 4) {

  return {
    width: values[2],
    height: values[3]
  };
}
```

}

if (
width > 0 &&
height > 0
) {

```
return {
  width,
  height
};
```

}

return {
width: initialBirdW,
height: initialBirdH
};
}

// ======================================================
// 渲染 SVG 动画帧
// ======================================================

function renderFrames() {

if (
!frameSources.length
) {
return;
}

const renderW =
Math.max(
1,
Math.ceil(
actualSvgSize.w
)
);

const renderH =
Math.max(
1,
Math.ceil(
actualSvgSize.h
)
);

const renderId =
Date.now();

renderFrames.lastId =
renderId;

frames =
new Array(
frameSources.length
);

frameSources.forEach(
(source, index) => {

```
  const colorizedSource =
    source.replace(
      /__BIRD_COLOR__/g,
      birdColor
    );


  const svgText =
    colorizedSource.replace(
      /<svg\b/,
      `<svg width="${renderW}" height="${renderH}"`
    );


  const data =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(
      svgText
    );


  loadImage(
    data,
    img => {

      if (
        renderFrames.lastId !==
        renderId
      ) {
        return;
      }


      frames[index] =
        img;
    }
  );
}
```

);
}

// ======================================================
// RGB 工具
// ======================================================

function hexToR(c) {

return parseInt(
c.substring(1, 3),
16
);
}

function hexToG(c) {

return parseInt(
c.substring(3, 5),
16
);
}

function hexToB(c) {

return parseInt(
c.substring(5, 7),
16
);
}
