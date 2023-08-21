const spritezero = require("@elastic/spritezero");
const fs = require("fs");
const glob = require("glob");
const path = require("path");
const rimraf = require("rimraf");

class SpriteCreator {

  constructor() {}

  build(sprites) {
    sprites.forEach((s) => {
      let output_dir = s.output_dir;
      let icons = s.icons;
      let isSDF = s.isSDF || false;
      this.create(output_dir, icons, isSDF);
    });
  }

  create(output_dir, icons, isSDF) {
    const this_ = this;
    let svgs = [];
    icons.forEach((dir) => {
      svgs = svgs.concat(this_.generateSvgs(path.join(dir, "/*.svg")));
    });

    if (fs.existsSync(output_dir)) {
      rimraf.sync(output_dir);
    }
    fs.mkdirSync(output_dir);

    [1, 2, 4].forEach(function (pxRatio) {
      this_.generateSprite(pxRatio, svgs, output_dir, isSDF);
    });
  }

  generateSvgs(input_dir) {
    return glob.sync(path.resolve(input_dir)).map(function (f) {
      return {
        svg: fs.readFileSync(f),
        id: path.basename(f).replace(".svg", ""),
      };
    });
  }

  suffix(pxRatio) {
    if (pxRatio === 1) {
      return "";
    } else {
      return `@${pxRatio}x`;
    }
  }

  generateSprite(pxRatio, svgs, output_dir, isSDF) {
    var pngPath = path.resolve(
      path.join(output_dir, `/sprite${this.suffix(pxRatio)}.png`)
    );
    var jsonPath = path.resolve(
      path.join(output_dir, `/sprite${this.suffix(pxRatio)}.json`)
    );

    // Pass `true` in the layout parameter to generate a data layout
    // suitable for exporting to a JSON sprite manifest file.
    spritezero.generateLayout(
      { imgs: svgs, pixelRatio: pxRatio, sdf: isSDF, format: true },
      function (err, dataLayout) {
        if (err) return;
        fs.writeFileSync(jsonPath, JSON.stringify(dataLayout, null, 2));
      }
    );

    // Pass `false` in the layout parameter to generate an image layout
    // suitable for exporting to a PNG sprite image file.
    spritezero.generateLayout(
      { imgs: svgs, pixelRatio: pxRatio, sdf: isSDF, format: false },
      function (err, imageLayout) {
        if (err) return;
        spritezero.generateImage(imageLayout, function (err, image) {
          if (err) return;
          fs.writeFileSync(pngPath, image);
        });
      }
    );
  }
}

module.exports = SpriteCreator;
