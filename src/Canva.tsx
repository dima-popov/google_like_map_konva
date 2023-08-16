import { useEffect, useState } from "react";
import { PointFactory, HeatMap, PointAccessories } from "./google_like_map";
import Konva from "./Konva";
import mapHelper from "./mapHelper";
import { Box } from "@mui/material";

const stageConfig = {
  draggable: true,
};

function Canva({
  stageId,
  sx,
  mapState,
  points,
  updateData,
  updatePos,
  setCanvaObj,
}: {
  stageId: string;
  sx: { [key: string]: any };
  mapState: any;
  points: { x: number; y: number; value: number; aggregated?: boolean }[];
  updateData: (heatmap: HeatMap) => void;
  updatePos: (heatmap: HeatMap) => void;
  setCanvaObj: (heatmap: HeatMap) => void;
}) {
  const colorHelper = new mapHelper();
  const [heatmap, setHeatmap] = useState(null);
  const pointAccessoriesObj = new PointAccessories(Konva);

  const initialX = 100;
  const initialY = 100;

  useEffect(() => {
    if (heatmap === null) {
      setHeatmap(
        new HeatMap(
          window.innerWidth,
          window.innerHeight,
          Konva,
          PointFactory,
          stageConfig,
          stageId,
          14
        )
      );
    }
  }, []);

  useEffect(() => {
    if (heatmap !== null) {
      setCanvaObj(heatmap);
      heatmap.init();

      heatmap.stage.dragBoundFunc(function (pos: { x: number; y: number }) {
        return {
          x: pos.x,
          y: pos.y,
        };
      });

      heatmap.stage.on("wheel", (e: any) => {
        const scaleObj = heatmap.focusedScale(e);

        heatmap.stage.scale(scaleObj.scale);
        heatmap.stage.position(scaleObj.pos);
        refreshPoints();
        updateData(heatmap);
        updatePos(heatmap);
      });

      heatmap.stage.on("dragstart", (e: any) => {
        updateData(heatmap);
        updatePos(heatmap);
      });
      heatmap.stage.on("dragend", (e: any) => {
        updateData(heatmap);
        updatePos(heatmap);
      });

      heatmap.stage.on("dragmove", (e: any) => {
        updatePos(heatmap);
      });

      heatmap.stage.position({ x: initialX, y: initialY });
    }
  }, [heatmap]);

  useEffect(() => {
    const imgConfig = {};
    if (heatmap) {
      heatmap.add00Point({
        scaleX: 1 / heatmap.stage.scale().x,
        scaleY: 1 / heatmap.stage.scale().y,
      });

      const promises = mapState
        ? mapState.length > 0
          ? loadAll(imgConfig)
          : [heatmap.loadDrawImg(null, null, null, null, imgConfig)]
        : [heatmap.loadDrawImg(null, null, null, null, imgConfig)];

      Promise.all(promises).then((resp) => {
        resp[0][0].removeAllImages();

        const mainPointGroupOnCanvas = heatmap.stage.find(".main_point_group");
        if (mainPointGroupOnCanvas[0]) {
          mainPointGroupOnCanvas[0].attrs.opacity = 0;
        }

        heatmap.stage
          .find(".main_point_group")
          .forEach((obj: { destroy: () => void }) => {
            obj.destroy();
          });

        resp.forEach((arr) => {
          if (arr[1]) {
            arr[0].layerImg.add(arr[1]);
          }
        });

        const pointBoundArr = heatmap.createPoints(points, "Circle", {});

        const mainPointGroup = new Konva.Group({ name: "main_point_group" });

        pointBoundArr.forEach(
          (pointBound: {
            pointObj: {
              aggregated?: boolean;
              x: number;
              y: number;
              rot: number;
              value: number;
            };
            canvasPointObj: {
              radius: (arg0: number) => void;
              fill: (arg0: string) => void;
            };
          }) => {
            const group = new Konva.Group({ name: "point_group" });

            if (pointBound.pointObj.aggregated === true) {
              pointBound.canvasPointObj.radius(20);
            }

            pointBound.canvasPointObj.fill(
              colorHelper.getBudgetColor(pointBound.pointObj.value, {
                budgetMin: 1,
                budgetMax: 100,
                budgetInverse: true,
              })
            );

            group.add(pointBound.canvasPointObj);
            if (pointBound.pointObj.aggregated !== true) {
              group.add(
                pointAccessoriesObj.createDirection(
                  pointBound.pointObj.x,
                  pointBound.pointObj.y,
                  pointBound.pointObj.rot,
                  heatmap.radius,
                  {}
                )
              );
            }
            group.add(
              pointAccessoriesObj.createLabel(
                pointBound.pointObj.x,
                pointBound.pointObj.y,
                String(pointBound.pointObj.value),
                pointBound.pointObj.aggregated === true ? 30 : heatmap.radius,
                {}
              )
            );

            mainPointGroup.add(group);
          }
        );
        heatmap.layerDots.add(mainPointGroup);

        refreshPoints();
      });
    }
  }, [heatmap, points, mapState]);

  function loadAll(imgConfig: {}) {
    return mapState.map(
      (imgObj: { src: string; scale: number; posX: number; posY: number }) => {
        return heatmap.loadDrawImg(
          imgObj.src,
          1 / imgObj.scale,
          imgObj.posX / imgObj.scale,
          imgObj.posY / imgObj.scale,
          imgConfig
        );
      }
    );
  }

  function refreshPoints() {
    if (heatmap) {
      const objToRefresh = [
        ...heatmap.layerDots.find(".hot_point"),
        ...heatmap.layerDots.find(".direction_arrow"),
        ...heatmap.layerDots.find(".value_label"),
      ];
      heatmap.refreshObjOnScale(heatmap.stage.scale().x, objToRefresh);
    }
  }

  return (
    <Box
      id={stageId}
      sx={{
        overflow: "hidden",
        border: "1px solid white",
        cursor: "pointer",
        ...sx,
      }}
    ></Box>
  );
}

export default Canva;
