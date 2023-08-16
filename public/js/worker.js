import { pointsArr } from "./data.js";

onmessage = function (e) {
  postMessage(
    clusterData(
      e.data[0],
      e.data[1],
      e.data[2],
      e.data[3],
      e.data[4],
      e.data[5],
      e.data[6]
    )
  );
};

function clusterData(x, y, width, height, scale) {
  const mapWidth = 1080;
  const mapHeight = 664;
  let mapScale = 1;

  if (scale >= 2 && scale < 4) {
    mapScale = 2;
  } else if (scale >= 4 && scale < 8) {
    mapScale = 4;
  } else if (scale >= 8 && scale < 16) {
    mapScale = 8;
  } else if (scale >= 16) {
    mapScale = 16;
  }

  function packImages() {
    const arr = [];
    for (let i = 1; i <= mapScale; i++) {
      const absltPosX = x + (mapWidth / mapScale) * scale * (i - 1);
      for (let j = 1; j <= mapScale; j++) {
        const absltPosY = y + (mapHeight / mapScale) * scale * (j - 1);

        const padding = (mapWidth / mapScale) * scale;

        const leftUpCorner =
          absltPosX >= -padding &&
          absltPosX <= width + padding &&
          absltPosY >= -padding &&
          absltPosY <= height + padding;

        if (leftUpCorner) {
          arr.push({
            src: `/img/map/zoom${mapScale}/image${i}x${j}.png`,
            posX: mapWidth * (i - 1),
            posY: mapHeight * (j - 1),
            scale: mapScale,
          });
        }
      }
    }
    return arr;
  }

  const resObj =
    scale > 1
      ? packImages()
      : [{ src: "/img/map/zoom1/map.png", posX: 0, posY: 0, scale: 1 }];

  return [
    aggregation(pointCulling(pointsArr, x, y, width, height, scale), 50, scale),
    resObj,
  ];
}

function pointCulling(pointsArr, x, y, width, height, scale) {
  return pointsArr.filter((point) => {
    const absltPosX = x + point.x * scale;
    const absltPosY = y + point.y * scale;

    const padding = 200;

    return absltPosX > -padding &&
      absltPosX < width + padding &&
      absltPosY > -padding &&
      absltPosY < height + padding
      ? true
      : false;
  });
}

function gen_hash(x, y, radius, scale) {
  return (
    Math.floor((x * scale) / radius) + "_" + Math.floor((y * scale) / radius)
  );
}

function aggregation(points, radius, scale) {
  const dictionary = new Map();

  points.forEach((point) => {
    const hash = gen_hash(point.x, point.y, radius, scale);

    if (dictionary.has(hash) === true) {
      const parentPoint = dictionary.get(hash);
      parentPoint.value += point.value;
      parentPoint.aggregated = true;
    } else {
      dictionary.set(hash, point);
    }
  });
  return Object.values(Object.fromEntries(dictionary));
}
