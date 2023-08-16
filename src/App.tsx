import Canva from "./Canva";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useEffect, useRef, useState } from "react";
import { HeatMap } from "./google_like_map";

const ContentWrapper = styled(Box)({
  "&.cont_wrapper1": {
    display: "grid",
    gridTemplateColumns: "100%",
    ".cont_1_label": {
      inset: "34px 0 0 100%",
    },
  },
  "&.cont_wrapper2": {
    display: "grid",
    gridTemplateColumns: "50% 50%",
    gridAutoRows: "50vh 50vh",
    ".cont_1_label": {
      inset: "34px 0 0 50%",
    },
    ".cont_2_label": {
      inset: "34px 0 0 100%",
    },
    ".cont_3_label": {
      inset: "calc(50vh + 8px) 0 0 50%",
    },
    ".cont_4_label": {
      inset: "calc(50vh + 8px) 0 0 100%",
    },
  },
  "&.cont_wrapper3": {
    display: "grid",
    gridTemplateColumns: "100%",
    gridAutoRows: "50vh 50vh",
    ".cont_1_label": {
      inset: "34px 0 0 100%",
    },
    ".cont_2_label": {
      inset: "calc(50vh + 8px) 0 0 100%",
    },
  },
});

const AreaKPILabel = styled(Box)((arg: any) => {
  return {
    height: "40px",
    width: arg.sx?.width
      ? `${parseInt(arg.sx?.width) + 16}px !important`
      : "50px",
    position: "absolute",
    overflow: "hidden",
    textAlign: "right",
    zIndex: 2,
    marginLeft: arg.sx?.width ? `-${parseInt(arg.sx?.width) + 26}px` : "-80px",
    div: {
      display: "inline-block",
      backgroundColor: "#F5F5DF",
      fontSize: "13px",
      lineHeight: "15px",
      fontWeight: "400",
      borderRadius: "4px",
      border: "1px solid black",
      padding: "4px",
      textAlign: "center",
      overflow: "hidden",
    },
  };
});

function getLayoutClass(type: string) {
  if (type === "layout_area_1") {
    return "cont_wrapper1";
  } else if (type === "layout_area_2") {
    return "cont_wrapper2";
  } else if (type === "layout_area_3") {
    return "cont_wrapper3";
  } else {
    return "cont_wrapper1";
  }
}

let currentLayout = "layout_area_1"; //Changes a layout.

function App() {
  const myWorker = useRef(null);
  const [points, setPoints] = useState([]);
  const [mapState, setMap] = useState(null);
  const canvas1 = useRef(null);
  const canvas2 = useRef(null);
  const canvas3 = useRef(null);
  const canvas4 = useRef(null);

  useEffect(() => {
    updateData(null);
  }, []);

  function updateData(heatmap: HeatMap) {
    if (myWorker.current) {
      myWorker.current.terminate();
    }

    myWorker.current = new Worker("/js/worker.js", { type: "module" });

    if (heatmap) {
      myWorker.current.postMessage([
        heatmap.stage.position().x,
        heatmap.stage.position().y,
        window.innerWidth,
        window.innerHeight,
        heatmap.stage.scale().x,
      ]);
    } else {
      myWorker.current.postMessage([
        0,
        0,
        window.innerWidth,
        window.innerHeight,
        1,
      ]);
    }

    myWorker.current.onmessage = function (e: {
      data: [
        {
          aggregated?: boolean;
          x: number;
          y: number;
          rot: number;
          value: number;
        }[],
        { src: string; posX: number; posY: number; scale: number }[]
      ];
    }) {
      setPoints(e.data[0]);
      setMap(e.data[1]);
    };
  }

  function updatePos(heatmap: HeatMap, areas: { current: HeatMap }[]) {
    areas.forEach((area) => {
      if (area.current) {
        area.current.stage.position(heatmap.stage.position());
        area.current.stage.scale(heatmap.stage.scale());
      }
    });
  }

  return (
    <ContentWrapper className={getLayoutClass(currentLayout)}>
      {currentLayout && (
        <AreaKPILabel
          sx={{
            width: "fps".length * 13 + "px",
          }}
          className="cont_1_label"
        >
          <div>fps</div>
        </AreaKPILabel>
      )}

      <Canva
        stageId="cont_1"
        sx={{ background: "#ddd" }}
        mapState={mapState}
        points={points}
        updateData={(heatmap: HeatMap) => {
          updateData(heatmap);
        }}
        updatePos={(heatmap) => {
          updatePos(heatmap, [canvas2, canvas3, canvas4]);
        }}
        setCanvaObj={(canva: HeatMap) => (canvas1.current = canva)}
      ></Canva>
      {(currentLayout === "layout_area_2" ||
        currentLayout === "layout_area_3") && (
        <>
          {currentLayout && (
            <AreaKPILabel
              className="cont_2_label"
              sx={{
                width: "fps".length * 13 + "px",
              }}
            >
              <div>fps</div>
            </AreaKPILabel>
          )}
          <Canva
            stageId="cont_2"
            sx={{ background: "#aaa" }}
            mapState={mapState}
            points={points}
            updateData={updateData}
            updatePos={(heatmap) => {
              updatePos(heatmap, [canvas1, canvas3, canvas4]);
            }}
            setCanvaObj={(canva: HeatMap) => (canvas2.current = canva)}
          ></Canva>
        </>
      )}
      {currentLayout === "layout_area_2" && (
        <>
          {currentLayout && (
            <AreaKPILabel
              className="cont_3_label"
              sx={{
                width: "fps".length * 13 + "px",
              }}
            >
              <div>fps</div>
            </AreaKPILabel>
          )}
          <Canva
            stageId="cont_3"
            sx={{ background: "#777" }}
            mapState={mapState}
            points={points}
            updateData={updateData}
            updatePos={(heatmap) => {
              updatePos(heatmap, [canvas1, canvas2, canvas4]);
            }}
            setCanvaObj={(canva: HeatMap) => (canvas3.current = canva)}
          ></Canva>
        </>
      )}
      {currentLayout === "layout_area_2" && (
        <>
          {currentLayout && (
            <AreaKPILabel
              className="cont_4_label"
              sx={{
                width: "fps".length * 13 + "px",
              }}
            >
              <div>fps</div>
            </AreaKPILabel>
          )}
          <Canva
            stageId="cont_4"
            sx={{ background: "#444" }}
            mapState={mapState}
            points={points}
            updateData={updateData}
            updatePos={(heatmap) => {
              updatePos(heatmap, [canvas1, canvas2, canvas3]);
            }}
            setCanvaObj={(canva: HeatMap) => (canvas4.current = canva)}
          ></Canva>
        </>
      )}
    </ContentWrapper>
  );
}

export default App;
