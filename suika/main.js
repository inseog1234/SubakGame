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
        height: 850
    },
});

const world = engine.world;

const leftWall = Bodies.rectangle(15, 395, 30, 790, {
    isStatic: true,
    render: { fillStyle: '#E68143' }
});

World.add(world, [leftWall]);

Render.run(render);
Render.run(engine);