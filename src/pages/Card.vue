<script setup lang="ts">
import {ref, onMounted} from 'vue';

import {FillText, Story, Point} from '../types';
import {fillText} from '../utils/canvas';


const cardCanvas = ref<HTMLCanvasElement | null>(null);
const containerRef = ref<HTMLCanvasElement | null>(null);
const layerRef = ref<HTMLCanvasElement | null>(null);
let canvas = document.createElement('canvas');
let containerCanvas = document.createElement('canvas');
let layerCanvas = document.createElement('canvas');

let width = 100;
let height = 100;
const TARGET_PERCENT = 64;
let mobile = false;

const img = new Image();

let canDrag = false;
let showLayer = ref(true);
let point: Point = {
  x: 0,
  y: 0
};

const makeCanvas = (story: Story) => {
  img.onload = async () => {
    containerCanvas = containerRef.value as HTMLCanvasElement;
    containerCanvas.width = width;
    containerCanvas.height = height;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    let rw = img.naturalWidth;
    let rh = img.naturalHeight;

    if (rw > width) {
      rw = width;
      rh = width * img.naturalHeight / img.naturalWidth;
    }
    if (rh > height) {
      rh = height;
      rw = height * img.naturalWidth / img.naturalHeight;
    }

    const offsetX = width - rw;
    const offsetY = height - rh;
    const x = Math.floor(mobile ? offsetX / 2 : Math.random() * offsetX);
    const y = Math.floor(mobile ? offsetY / 2 : Math.random() * offsetY);

    renderImage(story);
    const ctx = containerCanvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.drawImage(canvas, x, y, rw, rh);
  };

  img.onerror = err => {
    console.error(err);
  };

  img.src = "https://qiniu.jie-code.cn/picgo/hh2.png";
};

const makeLayer = () => {
  layerCanvas = layerRef.value as HTMLCanvasElement;
  layerCanvas.width = width;
  layerCanvas.height = height;
  const ctx = layerCanvas.getContext('2d') as CanvasRenderingContext2D;
  renderLayer(ctx);
  showLayer.value = true;
};

const renderImage = (story: Story) => {
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  ctx.drawImage(img, 0, 0);

  const {special, text} = story;
  if (!special) {
    fillText(ctx, canvas.width, text || '', story as FillText);
  }
};

const renderLayer = (ctx: CanvasRenderingContext2D) => {
  ctx.save();
  ctx.fillStyle = '#D9C58E';
  ctx.fillRect(0, 0, width, height);
  ctx.font = '48px sans-serif';
  ctx.fillStyle = '#F3F2E3';
  ctx.textAlign = 'center';
  ctx.fillText('刮 我 试 试 看', width / 2, height / 2);
  ctx.restore();
};

const mousedown = (event: MouseEvent | TouchEvent) => {
  canDrag = true;
  point = getPoint(event, layerCanvas);
};
const mousemove = (event: MouseEvent | TouchEvent) => {
  if (!canDrag) {
    return;
  }

  const ctx = layerCanvas.getContext('2d') as CanvasRenderingContext2D;
  const current = getPoint(event, layerCanvas);
  const dist = Math.sqrt(Math.pow(current.x - point.x, 2) + Math.pow(current.y - point.y, 2));
  const angle = Math.atan2(current.x - point.x, current.y - point.y);

  let x = 0;
  let y = 0;

  for (let i = 0; i < dist; i++) {
    x = point.x + Math.sin(angle) * i;
    y = point.y + Math.cos(angle) * i;
    ctx.globalCompositeOperation = 'destination-out';
    
    ctx.beginPath();
    ctx.fillStyle = '#fff';
    ctx.arc(x, y, 20, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.closePath();
  }

  point = current;
  hiddlePercent();
};
const mouseup = () => {
  canDrag = false;
};

const getPoint = (event: MouseEvent | TouchEvent, canvas: HTMLCanvasElement): Point => {
  let offsetX = 0;
  let offsetY = 0;
  if (canvas.offsetParent !== undefined) {
    do {
      offsetX += canvas.offsetLeft;
      offsetY += canvas.offsetTop;
    } while ((canvas = canvas.offsetParent as HTMLCanvasElement));
  }

  let px = 0;
  let py = 0;
  if (mobile) {
    px = (event as TouchEvent).touches[0].clientX;
    py = (event as TouchEvent).touches[0].clientY;
  } else {
    px = (event as MouseEvent).pageX;
    py = (event as MouseEvent).pageY;
  }

  return {
    x: px - offsetX,
    y: py - offsetY
  };
};

const hiddlePercent = () => {
  const ctx = layerCanvas.getContext('2d') as CanvasRenderingContext2D;
  const imageData = ctx.getImageData(0, 0, width, height);
  const pdata = imageData.data;
  const step = 16;
  let count = 0;
  for (let i = 0; i < pdata.length; i += step) {
    if (parseInt(pdata[i].toString()) === 0) {
      count++;
    }
  }

  const percent = Math.round((count * step / pdata.length) * 100);
  if (percent > TARGET_PERCENT) {
    showLayer.value = false;
  }
};


const setData = () => {
  mobile = /Android|webOS|iPhone|iPod|iPad|BlackBerry|SymbianOS/.test(navigator.userAgent);
  if (!cardCanvas.value) {
    return;
  }
  const {width: _width, height: _height} = cardCanvas.value.getBoundingClientRect();
  width = _width;
  height = _height;
};

const setStory = () => {
  const percent = Math.floor(Math.random() * 100);
  let story: Story = {special: true, image: ''};
  // if (percent < 10) {
  //   story = {
  //     special: true,
  //     image: TOP_IMAGE
  //   };
  // } else {
  //   story = getRandomImage();
  // }

  makeCanvas(story);
};

const resetData = () => {
  canDrag = false;
  showLayer.value = true;
  point = {
    x: 0,
    y: 0
  };
};

const watchLayer = () => {
  if (!layerRef.value || !showLayer.value || !cardCanvas.value) {
    return;
  }
  setInterval(() => {
    const layer = document.getElementsByClassName('canvas-layer');
    if (showLayer.value && (layer.length !== 1)) {
      (cardCanvas.value as HTMLCanvasElement).appendChild(layerRef.value as HTMLCanvasElement);
    }
  }, 300);
};

onMounted(() => {
  setData();
  setStory();
  makeLayer();
  watchLayer();
});

</script>

<template>
  <div class="card">
<!--    <div class="card-btn">-->
<!--      <popular-button u="primary" label="垃圾" @click="comment"/>-->
<!--      <popular-button u="primary" label="点赞" @click="encourage"/>-->
<!--      <popular-button u="primary" label="再来一次" @click="refresh"/>-->
<!--      <popular-button u="primary" label="保存" @click="save"/>-->
<!--    </div>-->
    <div class="card-canvas" ref="cardCanvas">
      <canvas ref="containerRef"/>
      <canvas
        v-show="showLayer"
        ref="layerRef"
        class="canvas-layer"
        @mousedown="mousedown"
        @mousemove="mousemove"
        @mouseup="mouseup"
        @touchstart="mousedown"
        @touchmove="mousemove"
        @touchend="mouseup"
      />
    </div>
  </div>  
</template>

<style lang="less">
@height: 40px;

.card {
  width: 100%;
  height: 100%;
  &-btn {
    height: @height;
    .popular-button {
      float: right;
      margin-left: 10px;
      font-size: 14px;
      &[u~="primary"] {
        background-color: #f4f2e7;
        color: #ec0e2b;
      }
    }
  }
  &-canvas {
    position: relative;
    width: 100%;
    height: calc(100% - @height);
    min-width: 200px;
    min-height: 200px;
    cursor: pointer;
    user-select: none;
  }
  .canvas-layer {
    position: absolute;
    left: 0;
    top: 0;
  }
}
</style>
