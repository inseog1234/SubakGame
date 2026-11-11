const { Engine, Render, Runner, Bodies, Composite, Events } = Matter;

const WIDTH = 620;
const HEIGHT = 800;
const WALL = 30;
const FLOOR_Y = 785;
const SPAWN_Y = 90;
const DROP_DELAY_MS = 350;

// The first five fruit types can be dropped. Future fruit types can be added here.
const fruits = [
  { name: '체리', file: '00_cherry.png', radius: 18 },
  { name: '딸기', file: '01_strawberry.png', radius: 24 },
  { name: '포도', file: '02_grape.png', radius: 30 },
  { name: '귤', file: '03_gyool.png', radius: 37 },
  { name: '오렌지', file: '04_orange.png', radius: 45 }
];

const engine = Engine.create();
const render = Render.create({
  engine,
  element: document.getElementById('game'),
  options: { width: WIDTH, height: HEIGHT, wireframes: false, background: '#F7F4C8' }
});

const wallStyle = { isStatic: true, render: { fillStyle: '#E68143' } };
Composite.add(engine.world, [
  Bodies.rectangle(WALL / 2, HEIGHT / 2, WALL, HEIGHT, wallStyle),
  Bodies.rectangle(WIDTH - WALL / 2, HEIGHT / 2, WALL, HEIGHT, wallStyle),
  Bodies.rectangle(WIDTH / 2, FLOOR_Y, WIDTH, WALL, wallStyle)
]);

const images = fruits.map(fruit => {
  const image = new Image();
  image.src = fruit.file;
  return image;
});

const queueContainer = document.getElementById('fruit-queue');
const slots = Array.from({ length: 4 }, (_, i) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'queue-slot';
  const image = document.createElement('img');
  const label = document.createElement('span');
  label.textContent = i === 0 ? 'NEXT' : String(i + 1);
  wrapper.append(image, label);
  queueContainer.append(wrapper);
  return image;
});

const randomFruit = () => Math.floor(Math.random() * fruits.length);
const queue = Array.from({ length: 4 }, randomFruit);
const droppedFruits = [];
let aimX = WIDTH / 2;
let lastDropTime = -DROP_DELAY_MS;

function updateQueue() {
  queue.forEach((index, i) => {
    slots[i].src = fruits[index].file;
    slots[i].alt = fruits[index].name;
  });
}

function clampAim(x) {
  const radius = fruits[queue[0]].radius;
  return Math.max(WALL + radius, Math.min(WIDTH - WALL - radius, x));
}

function pointToAim(event) {
  const rect = render.canvas.getBoundingClientRect();
  aimX = clampAim((event.clientX - rect.left) * WIDTH / rect.width);
}

function dropFruit() {
  const now = performance.now();
  if (now - lastDropTime < DROP_DELAY_MS) return;
  lastDropTime = now;

  const fruitIndex = queue.shift();
  const fruit = fruits[fruitIndex];
  const x = Math.max(WALL + fruit.radius, Math.min(WIDTH - WALL - fruit.radius, aimX));
  const body = Bodies.circle(x, SPAWN_Y, fruit.radius, {
    restitution: 0.15,
    friction: 0.6,
    frictionStatic: 0.8,
    render: { visible: false }
  });
  Composite.add(engine.world, body);
  droppedFruits.push({ body, fruitIndex });

  queue.push(randomFruit());
  aimX = clampAim(aimX);
  updateQueue();
}

render.canvas.addEventListener('pointermove', pointToAim);
render.canvas.addEventListener('pointerdown', event => {
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  pointToAim(event);
  dropFruit();
});

Events.on(render, 'afterRender', () => {
  const ctx = render.context;
  for (const { body, fruitIndex } of droppedFruits) {
    const fruit = fruits[fruitIndex];
    const image = images[fruitIndex];
    if (!image.complete || image.naturalWidth === 0) continue;
    ctx.save();
    ctx.translate(body.position.x, body.position.y);
    ctx.rotate(body.angle);
    ctx.drawImage(image, -fruit.radius, -fruit.radius, fruit.radius * 2, fruit.radius * 2);
    ctx.restore();
  }

  const nextFruit = fruits[queue[0]];
  const preview = images[queue[0]];
  const x = clampAim(aimX);
  ctx.save();
  ctx.strokeStyle = '#987e5b';
  ctx.setLineDash([5, 7]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, SPAWN_Y + nextFruit.radius);
  ctx.lineTo(x, FLOOR_Y - 16);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 0.65;
  if (preview.complete && preview.naturalWidth > 0) {
    ctx.drawImage(preview, x - nextFruit.radius, SPAWN_Y - nextFruit.radius,
      nextFruit.radius * 2, nextFruit.radius * 2);
  }
  ctx.restore();
});

updateQueue();
Render.run(render);
Runner.run(Runner.create(), engine);
