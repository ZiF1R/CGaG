import { CMatrix } from "./node_modules/computer-graphics-utils/CMatrix.js";
import { CVector } from "./node_modules/computer-graphics-utils/CVector.js";
import { CosBetweenVectors, ModOfVector, ScalarMult, VectorMult } from "./node_modules/computer-graphics-utils/AdditionalOperations.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

class CPoint {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class CPyramid {
  constructor() {
    this.Vertexes = new CMatrix(4, 6);

    // Default coordinates for pyramid vertexes.
    // First row contains x coordinates,
    // in second - y coordinates,
    // in third - z coordinates,
    // e.g. point A -> first column => (6, 0, 0)

    this.Vertexes.Matrix = [
      [16, 0, 3, 7, 0, 1],
      [3, -16, 0, 1, -7, 0],
      [0, 0, 0, 3, 3, 3],
      [1, 1, 1, 1, 1, 1]
    ];

    this.Color = {
      red: 90,
      green: 215,
      blue: 150,
    };

    this.WinArea = [[150, 50], [600, 500]];
    this.SetDrawMode(this.DrawWithoutInvisibleLines);
    // this.ColorDraw(new CVector(3));
    this.PView = new CVector(3);
    this.PView.Matrix = [
      [100],
      [0],
      [60]
    ];
    this.DrawLightSphere(1, this.PView, new CVector(3), this.WinArea, this.Color);
  }

  SetWinArea(dx, dy) {
    this.WinArea = [[150, 50], [600, 500]];
    this.WinArea[0][0] += dx;
    this.WinArea[1][0] -= dx;

    this.WinArea[0][1] += dy;
    this.WinArea[1][1] -= dy;
  }

  CalculatePointsCoordinates(viewPoint) {
    let VM = CreateViewCoord(
      viewPoint.Matrix[0][0],
      viewPoint.Matrix[1][0],
      viewPoint.Matrix[2][0],
    );

    let viewVertexes = VM.Multiply(this.Vertexes);

    let y_max = Math.max(...viewVertexes.Matrix[1]),
      y_min = Math.min(...viewVertexes.Matrix[1]),
      x_max = Math.max(...viewVertexes.Matrix[0]),
      x_min = Math.min(...viewVertexes.Matrix[0]);

    let MW = SpaceToWindow(
      [[x_min, y_min], [x_max, y_max]],
      this.WinArea
    );

    // go through the vertexes
    let temp = new CVector(3);
    let points = [];
    for (let i = 0; i < this.Vertexes.Matrix[0].length; i++) {
      temp.Matrix = [
        [viewVertexes.Matrix[0][i]],
        [viewVertexes.Matrix[1][i]],
        [1]
      ];
      temp = MW.Multiply(temp);
      points.push(new CPoint(temp.Matrix[0][0], temp.Matrix[1][0]));
    }

    return points;
  }

  /**
   * @param {CVector} viewPoint contains (x, y, z) coordinates in decart coordinate system
   */
  DrawWithInvisibleLines(viewPoint) {
    ctx.beginPath();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let points = this.CalculatePointsCoordinates(viewPoint);

    // draw the pyramid
    ctx.moveTo(points[2].x, points[2].y);
    for (let i = 0; i < 3; i++)
      ctx.lineTo(points[i].x, points[i].y);

    ctx.moveTo(points[5].x, points[5].y);
    for (let i = 3; i < 6; i++)
      ctx.lineTo(points[i].x, points[i].y);
    
    for (let i = 0; i < 3; i++){
      ctx.moveTo(points[i].x, points[i].y);
      ctx.lineTo(points[i + 3].x, points[i + 3].y);
    }

    ctx.lineWidth = "1";
    ctx.strokeStyle = "#000";
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.closePath();
  }

  /**
   * @param {CVector} viewPoint contains (x, y, z) coordinates in decart coordinate system
   */
  DrawWithoutInvisibleLines(viewPoint) {
    let ViewDecart = SphereToDecart(viewPoint);
    ctx.beginPath();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let points = this.CalculatePointsCoordinates(viewPoint);
    
    let R1 = new CVector(3),
      R2 = new CVector(3);
    let refractiveCoefficient = 0;
    for (let i = 0; i < 3; i++) {
      let VE = new CVector(3);
      VE.Matrix = [
        [this.Vertexes.Matrix[0][i + 3]],
        [this.Vertexes.Matrix[1][i + 3]],
        [this.Vertexes.Matrix[2][i + 3]],
      ];

      let k = i === 2 ? 0 : i + 1;

      R1.Matrix = [
        [this.Vertexes.Matrix[0][i]],
        [this.Vertexes.Matrix[1][i]],
        [this.Vertexes.Matrix[2][i]],
      ];
      R2.Matrix = [
        [this.Vertexes.Matrix[0][k]],
        [this.Vertexes.Matrix[1][k]],
        [this.Vertexes.Matrix[2][k]],
      ];

      let V1 = R2.Subtract(R1);
      let V2 = VE.Subtract(R1);

      let VN = VectorMult(V2, V1);
      refractiveCoefficient = ScalarMult(VN, ViewDecart);
      if (refractiveCoefficient > -1) {
        ctx.moveTo(points[i].x, points[i].y);
        ctx.lineTo(points[k].x, points[k].y);
        ctx.lineTo(points[k + 3].x, points[k + 3].y);
        ctx.lineTo(points[i + 3].x, points[i + 3].y);
        ctx.lineTo(points[i].x, points[i].y);
      }
    }

    if (ViewDecart.Matrix[2][0] >= 0) {
      ctx.moveTo(points[5].x, points[5].y);
      for (let i = 3; i < 6; i++)
        ctx.lineTo(points[i].x, points[i].y);
    } else {
      ctx.moveTo(points[2].x, points[2].y);
      for (let i = 0; i < 3; i++)
        ctx.lineTo(points[i].x, points[i].y);
    }

    ctx.lineWidth = "1";
    ctx.strokeStyle = "#000";
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.closePath();
  }

  /**
   * 
   * @param {CMatrix} viewPoint contains (x, y, z) coordinates in decart coordinate system
   * @param {Object} Color
   */
  ColorDraw(viewPoint, Color = this.Color) {
    ctx.beginPath();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let red = Color.red,
      green = Color.green,
      blue = Color.blue;
    
    let ViewDecart = SphereToDecart(viewPoint);
    let MV = CreateViewCoord(
      viewPoint.Matrix[0][0],
      viewPoint.Matrix[1][0],
      viewPoint.Matrix[2][0],
    );
    let ViewVertexes = MV.Multiply(this.Vertexes);

    let y_max = Math.max(...ViewVertexes.Matrix[1]),
      y_min = Math.min(...ViewVertexes.Matrix[1]),
      x_max = Math.max(...ViewVertexes.Matrix[0]),
      x_min = Math.min(...ViewVertexes.Matrix[0]);

    let MW = SpaceToWindow(
      [[x_min, y_min], [x_max, y_max]],
      this.WinArea
    );

    let points = [];
    for (let i = 0; i < 6; i++) {
      let V = new CVector(3);
      V.Matrix = [
        [ViewVertexes.Matrix[0][i]],
        [ViewVertexes.Matrix[1][i]],
        [1]
      ];
      V = MW.Multiply(V);
      points.push(new CPoint(V.Matrix[0][0], V.Matrix[1][0]));
    }

    let R1 = new CVector(3),
      R2 = new CVector(3),
      VN = new CVector(3);

    let refractiveCoefficient = 0;
    for (let i = 0; i < 3; i++) {
      let VE = new CVector(3);
      VE.Matrix = [
        [this.Vertexes.Matrix[0][i + 3]],
        [this.Vertexes.Matrix[1][i + 3]],
        [this.Vertexes.Matrix[2][i + 3]]
      ];
      let k = i === 2 ? 0 : i + 1;

      R1.Matrix = [
        [this.Vertexes.Matrix[0][i]],
        [this.Vertexes.Matrix[1][i]],
        [this.Vertexes.Matrix[2][i]],
      ];
      R2.Matrix = [
        [this.Vertexes.Matrix[0][k]],
        [this.Vertexes.Matrix[1][k]],
        [this.Vertexes.Matrix[2][k]],
      ];
      
      let V1 = R2.Subtract(R1);
      let V2 = VE.Subtract(R1);

      VN = VectorMult(V2, V1);
      refractiveCoefficient = CosBetweenVectors(VN, ViewDecart);
      ctx.beginPath();
      let r = Math.pow(refractiveCoefficient, 2) * red,
        g = Math.pow(refractiveCoefficient, 2) * green,
        b = Math.pow(refractiveCoefficient, 2) * blue;
      if (refractiveCoefficient >= 0) {
        ctx.beginPath();
        ctx.moveTo(points[i].x, points[i].y);
        ctx.lineTo(points[k].x, points[k].y);
        ctx.lineTo(points[k + 3].x, points[k + 3].y);
        ctx.lineTo(points[i + 3].x, points[i + 3].y);
        ctx.lineTo(points[i].x, points[i].y);
        ctx.closePath();
      }
        
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fill();
      ctx.closePath();
    }

    VN = VectorMult(R1, R2);
    refractiveCoefficient = CosBetweenVectors(VN, ViewDecart);
    if (refractiveCoefficient >= 0) {
      ctx.beginPath();
      let r = refractiveCoefficient * 0.3,
        g = refractiveCoefficient * 0.3,
        b = refractiveCoefficient * 0.3;
        
      ctx.moveTo(points[5].x, points[5].y);
      for (let i = 3; i < 6; i++)
        ctx.lineTo(points[i].x, points[i].y);

      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fill();
      ctx.closePath();
    }
    else {
      ctx.beginPath();
      let r = refractiveCoefficient * 0.7,
        g = refractiveCoefficient * 0.7,
        b = refractiveCoefficient * 0.7;
      
      ctx.moveTo(points[2].x, points[2].y);
      for (let i = 0; i < 3; i++)
        ctx.lineTo(points[i].x, points[i].y);

      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fill();
      ctx.closePath();
    }

    ctx.lineWidth = "1";
    ctx.strokeStyle = "#000";
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.closePath();
  }

  /**
   * @param {number} radius 
   * @param {CVector} viewPoint 
   * @param {CVector} lightPoint 
   * @param {Array<Array<number>>} winArea 
   * @param {Object} Color 
   * @param {boolean} isDiffusedMode 
   */
  DrawLightSphere(radius, viewPoint, lightPoint, winArea = this.WinArea, Color = this.Color) {
    ctx.beginPath();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let red = Color.red,
      green = Color.green,
      blue = Color.blue;

    let df = 0.9,
      dq = 0.6,
      kLight;

    let VR = SphereToDecart(viewPoint),
      VS = SphereToDecart(lightPoint),
      MW = SpaceToWindow([[-radius, radius], [radius, -radius]], winArea),
      MV = CreateViewCoord(
        viewPoint.Matrix[0][0],
        viewPoint.Matrix[1][0],
        viewPoint.Matrix[2][0]
      );

    for (let azimuth = 0; azimuth <= 360.0; azimuth += df) {
      for (let angle = 0; angle <= 180.0; angle += dq) {
        let VSphere = new CVector(3);
        VSphere.Matrix = [
          [radius],
          [azimuth],
          [angle]
        ];

        let VSphereNorm = new CVector(3);
        let VDecart = SphereToDecart(VSphere);
        VSphereNorm.Matrix = VDecart.Matrix;

        let PV = new CVector(4),
          cos_RN = CosBetweenVectors(VR, VSphereNorm);

        PV.Matrix = [
          [VDecart.Matrix[0][0]],
          [VDecart.Matrix[1][0]],
          [VDecart.Matrix[2][0]],
          [1]
        ];

        PV = MV.Multiply(PV);

        VDecart.Matrix = [
          [PV.Matrix[0][0]],
          [PV.Matrix[1][0]],
          [1]
        ];
        VDecart = MW.Multiply(VDecart);
        let VP = VS.Subtract(VR);
        let cos_PN = CosBetweenVectors(VP, VSphereNorm);

        if (cos_PN > 0) {
          kLight = cos_PN * cos_RN;
          ctx.beginPath();
          ctx.arc(
            VDecart.Matrix[0][0],
            VDecart.Matrix[1][0],
            radius,
            0,
            2 * Math.PI
          );

          kLight = -kLight;
          ctx.strokeStyle = `rgb(${kLight * red}, ${kLight * green}, ${kLight * blue})`;
          ctx.lineWidth = "1";
          ctx.stroke();
          ctx.closePath();
        }
      }
    }

    ctx.closePath();
  }

  SetDrawMode(fn) {
    if (
      fn !== this.DrawWithInvisibleLines &&
      fn !== this.DrawWithoutInvisibleLines
    ) throw new Error();

    this.CurrentDrawModeFunction = (...args) => fn.call(this, ...args);
  }
}

/**
 * @param {Array<Array<number>>} areaInWorldCoordinates two dimentional array, contains coordinates of top left and bottom right corners
 * @param {Array<Array<number>>} areaInWindowCoordinates two dimentional array, contains coordinates of top left and bottom right corners
 */
function SpaceToWindow(areaInWorldCoordinates, areaInWindowCoordinates) {
  let [x_min, y_min] = areaInWorldCoordinates[0];
  let [x_max, y_max] = areaInWorldCoordinates[1];

  let dXw = areaInWindowCoordinates[1][0] - areaInWindowCoordinates[0][0],
    dYw = areaInWindowCoordinates[1][1] - areaInWindowCoordinates[0][1],
    dX = x_max - x_min,
    dY = y_max - y_min;

  let Kx = dXw / dX,
    Ky = dYw / dY;

  let Tsw = new CMatrix(3, 3);
  Tsw.Matrix = [
    [Kx, 0, areaInWindowCoordinates[0][0] - Kx * x_min],
    [0, -Ky, areaInWindowCoordinates[1][1] + Ky * y_min],
    [0, 0, 1],
  ];

  return Tsw;
}

const pyramid = new CPyramid();
let viewPoint = new CVector(3);
viewPoint.Matrix = [[20], [0], [0]];

let newViewPoint = new CVector(3);
function rotatePyramid(e) {
  let x = viewPoint.Matrix[1][0] + (clickCoordinates.x - e.clientX);
  let y = viewPoint.Matrix[2][0] + (clickCoordinates.y - e.clientY);

  x %= 360;
  y %= 360;

  newViewPoint.Matrix = [[20], [x], [y]];
  // pyramid.DrawWithoutInvisibleLines(newViewPoint);
  pyramid.ColorDraw(newViewPoint);
}

let clickCoordinates = {};
canvas.addEventListener("mousedown", (e) => {
  clickCoordinates = { x: e.clientX, y: e.clientY};

  canvas.addEventListener("mousemove", rotatePyramid);
  canvas.addEventListener("mouseup", mouseUp);

  function mouseUp() {
    viewPoint.Matrix = newViewPoint.Matrix;
    canvas.removeEventListener("mousemove", rotatePyramid);
    canvas.removeEventListener("mouseup", mouseUp);
  }
});

/**
 * @param {number} r
 * @param {number} azimuth - from X axis
 * @param {number} angle - from Z axis
 */
function CreateViewCoord(r, azimuth, angle) {
  let fg = azimuth % 360.0;
  let azimuthInRadians = (fg / 180.0) * Math.PI;

  fg = angle % 360.0;
  let angleInRadians = (fg / 180.0) * Math.PI;

  let VM = new CMatrix(4, 4);
  VM.Matrix = [
    [-Math.sin(azimuthInRadians), Math.cos(azimuthInRadians), 0, 0],
    [-Math.cos(angleInRadians) * Math.cos(azimuthInRadians), -Math.cos(angleInRadians) * Math.sin(azimuthInRadians), Math.sin(angleInRadians), 0],
    [-Math.sin(angleInRadians) * Math.cos(azimuthInRadians), -Math.sin(angleInRadians) * Math.sin(azimuthInRadians), -Math.cos(angleInRadians), r],
    [0, 0, 0, 1],
  ];

  return VM;
}

/**
 * @param {CMatrix} viewPoint contains (x, y, z) coordinates in decart coordinate system
 */
function SphereToDecart(viewPoint) {
  let r = viewPoint.Matrix[0][0],
    azimuth = viewPoint.Matrix[1][0],
    angle = viewPoint.Matrix[2][0];

  let azimuthInRadians = (azimuth / 180.0) * Math.PI,
    angleInRadians = (angle / 180.0) * Math.PI;

  let viewPointInDecart = new CVector(3);
  viewPointInDecart.Matrix = [
    [r * Math.sin(angleInRadians) * Math.cos(azimuthInRadians)], // x coordinate of view point
    [r * Math.sin(angleInRadians) * Math.sin(azimuthInRadians)], // y coordinate of view point
    [r * Math.cos(angleInRadians)] // z coordinate of view point
  ];

  return viewPointInDecart;
}