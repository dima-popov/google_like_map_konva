class PointFactory {
  Konva: any = null;
  radius: number = 10;
  constructor(Konva: any, radius: number) {
    this.Konva = Konva;
    this.radius = radius;
  }
  circle() {
    return (point: { x: number; y: number }, config: any) => {
      return new this.Konva.Circle({
        name: "hot_point",
        x: point.x,
        y: point.y,
        fill: "red",
        radius: this.radius,
        ...config,
      });
    };
  }
  rect() {
    return (point: { x: number; y: number }, config: any) => {
      return new this.Konva.React({
        name: "hot_point",
        x: point.x,
        y: point.y,
        width: 20,
        height: 20,
        fill: "red",
        ...config,
      });
    };
  }
  createPoint(type: "Circle" | "Rect") {
    switch (type) {
      case "Circle":
        return this.circle();
      case "Rect":
        return this.rect();
      default:
        throw this.circle();
    }
  }
}

class PointAccessories {
  Konva: {
    Arc: new (arg0: any) => any;
    Label: new (arg0: { x: number; y: number; name: string }) => any;
    Text: new (arg0: any) => any;
  } = null;
  constructor(Konva: any) {
    this.Konva = Konva;
  }
  createDirection(
    x: number,
    y: number,
    rot: number,
    radius: number,
    config: any
  ) {
    return new this.Konva.Arc({
      name: "direction_arrow",
      x: x,
      y: y,
      innerRadius: radius - 4,
      outerRadius: radius + radius / 6,
      radius: radius,
      opacity: 1,
      fill: "yellow",
      angle: 40,
      rotation: rot,
      ...config,
    });
  }
  createLabel(
    x: number,
    y: number,
    value: string,
    radius: number,
    config: any
  ) {
    const label = new this.Konva.Label({
      name: "value_label",
      x: x,
      y: y,
    });

    let fontSize = (radius * 1.5) / value.toString().length;

    const text = new this.Konva.Text({
      x: 0,
      y: 0,
      fontSize: fontSize,
      fontFamily: "Arial",
      fill: "black",
      opacity: 1,
      text: value,
      ...config,
    });

    text.attrs.x = -text.textWidth / 2;
    text.attrs.y = -text.textHeight / 2;

    label.add(text);

    return label;
  }
}

class HeatMap {
  width: number = null;
  height: number = null;
  PointFactory: typeof PointFactory = null;
  Konva: any = null;
  config: any = null;
  stage: any = null;
  container: string = null;
  layerImg: any = null;
  layerDots: any = null;
  radius: number = 10;

  constructor(
    width: number,
    height: number,
    Konva: any,
    PointFactoryLoc = PointFactory,
    config: any,
    container: string,
    pointRadius: number = 10
  ) {
    this.width = width;
    this.height = height;
    this.PointFactory = PointFactoryLoc;
    this.Konva = Konva;
    this.config = config;
    this.container = container;
    this.radius = pointRadius;
  }

  init() {
    this.createStage();
    this.addLayers();
    return this;
  }
  createStage() {
    this.stage = new this.Konva.Stage({
      container: this.container,
      width: this.width,
      height: this.height,
      draggable: true,
      ...this.config,
    });
  }
  addLayers() {
    this.layerImg = new this.Konva.Layer();
    this.stage.add(this.layerImg);
    this.layerDots = new this.Konva.Layer();
    this.stage.add(this.layerDots);
  }

  focusedScale(
    e: { evt: { preventDefault: () => void; deltaY: number } },
    scale: number
  ) {
    if (e) {
      e.evt.preventDefault();
    }

    const oldScale = this.stage.scaleX();

    let pointer = this.stage.getPointerPosition();

    if (pointer === null) {
      pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    }

    const mousePointTo = {
      x: (pointer.x - this.stage.x()) / oldScale,
      y: (pointer.y - this.stage.y()) / oldScale,
    };

    let newScale = oldScale;

    if (scale) {
      newScale = scale;
    } else {
      newScale = e.evt.deltaY < 0 ? oldScale * 1.1 : oldScale / 1.1;
    }

    const newPos = {
      x: Number((pointer.x - mousePointTo.x * newScale).toFixed(2)),
      y: Number((pointer.y - mousePointTo.y * newScale).toFixed(2)),
    };

    return { scale: { x: newScale, y: newScale }, pos: newPos };
  }

  refreshObjOnScale(scale: number, obj_: any) {
    for (let i = 0; i < obj_.length; i++) {
      obj_[i].scale({ x: 1 / scale, y: 1 / scale });
    }
  }

  removeAllImages() {
    this.stage.find(".map_img").forEach((img: { destroy: () => void }) => {
      img.destroy();
    });
    return this;
  }

  loadDrawImg(
    src: string,
    scale: number,
    posX: number,
    posY: number,
    config: any
  ) {
    return new Promise((resolve, reject) => {
      if (src) {
        this.Konva.Image.fromURL(
          src,
          function (mapImage: { setAttrs: (arg0: any) => void }) {
            mapImage.setAttrs({
              x: posX,
              y: posY,
              name: "map_img",
              scaleX: scale,
              scaleY: scale,
              ...config,
            });

            resolve([this, mapImage]);
          }.bind(this)
        );
      } else {
        resolve([this]);
      }
    });
  }

  add00Point(config: { [key: string]: any }) {
    this.stage.find(".initial_point").forEach((point: any) => {
      point.destroy();
    });
    this.layerDots.add(
      new this.Konva.Circle({
        name: "initial_point",
        x: 0,
        y: 0,
        fill: "orange",
        radius: 15,
        stroke: "black",
        strokeWidth: 2,
        ...config,
      })
    );
    return this;
  }

  createPoints(points: any[], type: "Circle" | "Rect", config: any) {
    const factory = new this.PointFactory(this.Konva, this.radius);
    const pointConstructor = factory.createPoint(type || "Circle");
    const pointsObj: any = [];
    points.forEach((point: any) => {
      pointsObj.push({
        canvasPointObj: pointConstructor(point, config),
        pointObj: point,
      });
    });

    return pointsObj;
  }
}

export { PointFactory, HeatMap, PointAccessories };
