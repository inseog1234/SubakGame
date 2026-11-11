var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    World = Matter.World;

const engine = Engine.create();

const render = Render.create({
    engine,
    element : document.body,
    options: {
        wireframes: false,
        background: '#F7F4C8',
        width: 620,
        height: 800
    },
});

const world = engine.world;

const leftWall = Bodies.rectangle(15, 395, 30, 790, {
    isStatic: true,
    render: { fillStyle: '#E68143' }
});

const rightWall = Bodies.rectangle(605, 395, 30, 790, {
    isStatic: true,
    render: { fillStyle: '#E68143' }
});

const topLine = Bodies.rectangle(310, 40, 620, 15, {
    isStatic: true,
    render: { fillStyle: '#E3E3E34' }
});

const Ground = Bodies.rectangle(310, 790, 620, 30, {
    isStatic: true,
    render: { fillStyle: '#E68143' }
});

World.add(world, [leftWall, rightWall, Ground, topLine]);

// Only the upcoming four fruit images are shown beside the original game.
const fruitTypes = [
    { file: '00_cherry.png', radius: 18 },
    { file: '01_strawberry.png', radius: 24 },
    { file: '02_grape.png', radius: 30 },
    { file: '03_gyool.png', radius: 37 },
    { file: '04_orange.png', radius: 45 }
];
const fruitImages = fruitTypes.map(fruit => {
    const image = new Image();
    image.src = fruit.file;
    return image;
});
const randomFruit = () => Math.floor(Math.random() * fruitTypes.length);
const nextFruits = Array.from({ length: 4 }, randomFruit);
const queueContainer = document.createElement('div');
queueContainer.style.display = 'inline-flex';
queueContainer.style.flexDirection = 'column';
queueContainer.style.verticalAlign = 'top';
queueContainer.style.marginLeft = '16px';
queueContainer.style.gap = '12px';

const previewImages = Array.from({ length: 4 }, () => {
    const image = document.createElement('img');
    image.style.width = '72px';
    image.style.height = '72px';
    image.style.objectFit = 'contain';
    queueContainer.appendChild(image);
    return image;
});

render.canvas.style.verticalAlign = 'top';
render.canvas.insertAdjacentElement('afterend', queueContainer);

function updateFruitQueue() {
    nextFruits.forEach((fruitIndex, index) => {
        previewImages[index].src = fruitTypes[fruitIndex].file;
    });
}
updateFruitQueue();

const spawnedFruits = [];
let lastSpawnTime = -350;

render.canvas.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const now = performance.now();
    if (now - lastSpawnTime < 350) return;

    const rect = render.canvas.getBoundingClientRect();
    const fruitIndex = nextFruits.shift();
    const fruit = fruitTypes[fruitIndex];
    const pointerX = (event.clientX - rect.left) * (620 / rect.width);
    const x = Math.max(30 + fruit.radius, Math.min(590 - fruit.radius, pointerX));

    const body = Bodies.circle(x, 105, fruit.radius, {
        restitution: 0.15,
        friction: 0.6,
        render: { visible: false }
    });
    World.add(world, body);
    spawnedFruits.push({ body, fruitIndex });
    nextFruits.push(randomFruit());
    updateFruitQueue();
    lastSpawnTime = now;
});

// Draw the actual fruit PNGs over their Matter.js physics bodies.
Matter.Events.on(render, 'afterRender', () => {
    const ctx = render.context;
    for (const { body, fruitIndex } of spawnedFruits) {
        const image = fruitImages[fruitIndex];
        if (!image.complete || !image.naturalWidth) continue;
        const radius = fruitTypes[fruitIndex].radius;
        ctx.save();
        ctx.translate(body.position.x, body.position.y);
        ctx.rotate(body.angle);
        ctx.drawImage(image, -radius, -radius, radius * 2, radius * 2);
        ctx.restore();
    }
});

Render.run(render);
Runner.run(Runner.create(), engine);
