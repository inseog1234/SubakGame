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

Render.run(render);
Render.run(engine);