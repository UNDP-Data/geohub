const SpriteCreator = require("./sprite-creator");
const config = require("./config");

const example = () => {
  console.time("sprite-create");
  const spriteCreator = new SpriteCreator();
  spriteCreator.build(config.sprites);
  console.timeEnd("sprite-create");
};

module.exports = example();
