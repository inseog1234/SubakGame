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

// A thin dotted guide replaces the original solid top wall.
const SPAWN_LINE_Y = 135;
const SPAWN_Y = 85;

const Ground = Bodies.rectangle(310, 790, 620, 30, {
    isStatic: true,
    render: { fillStyle: '#E68143' }
});

World.add(world, [leftWall, rightWall, Ground]);

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
let previewX = 310;

function fruitX(clientX, fruitIndex) {
    const rect = render.canvas.getBoundingClientRect();
    const radius = fruitTypes[fruitIndex].radius;
    const canvasX = (clientX - rect.left) * (620 / rect.width);
    return Math.max(30 + radius, Math.min(590 - radius, canvasX));
}

render.canvas.addEventListener('pointermove', event => {
    previewX = fruitX(event.clientX, nextFruits[0]);
});

render.canvas.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const now = performance.now();
    if (now - lastSpawnTime < 350) return;

    // Drop exactly the fruit currently shown above the dotted line.
    previewX = fruitX(event.clientX, nextFruits[0]);
    const fruitIndex = nextFruits.shift();
    const fruit = fruitTypes[fruitIndex];
    const body = Bodies.circle(previewX, SPAWN_Y, fruit.radius, {
        restitution: 0.15,
        friction: 0.6,
        render: { visible: false }
    });
    World.add(world, body);
    spawnedFruits.push({ body, fruitIndex });
    nextFruits.push(randomFruit());
    updateFruitQueue();
    previewX = Math.max(30 + fruitTypes[nextFruits[0]].radius,
        Math.min(590 - fruitTypes[nextFruits[0]].radius, previewX));
    lastSpawnTime = now;
});

// Draw the actual fruit PNGs over their Matter.js physics bodies.
Matter.Events.on(render, 'afterRender', () => {
    const ctx = render.context;

    // Only the line's position and stroke change; the game canvas stays the same.
    ctx.save();
    ctx.strokeStyle = '#E3E3E3';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(30, SPAWN_LINE_Y);
    ctx.lineTo(590, SPAWN_LINE_Y);
    ctx.stroke();
    ctx.restore();

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

    // Show the next fruit fully opaque, above the dotted line.
    const upcomingIndex = nextFruits[0];
    const upcomingImage = fruitImages[upcomingIndex];
    if (upcomingImage.complete && upcomingImage.naturalWidth) {
        const radius = fruitTypes[upcomingIndex].radius;
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.drawImage(upcomingImage, previewX - radius, SPAWN_Y - radius,
            radius * 2, radius * 2);
        ctx.restore();
    }
});

Render.run(render);
Runner.run(Runner.create(), engine);
