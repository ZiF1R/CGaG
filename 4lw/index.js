import { CMatrix } from "./node_modules/cmatrix-cvector/CMatrix.js";

function CreateTranslate2D(dx, dy) {
  let TM = new CMatrix(3, 3);
  TM.Matrix = [
    [1, 0, dx],
    [0, 1, dy],
    [0, 0, 1]
  ];

  return TM;
}

function CreateRotate2D(angle) {
  let fg = angle % 360.0;
  let angleInRadians = (fg / 180.0) * Math.PI;

  let RM = new CMatrix(3, 3);
  RM.Matrix = [
    [Math.cos(angleInRadians), -Math.sin(angleInRadians), 0],
    [Math.sin(angleInRadians), Math.cos(angleInRadians), 0],
    [0, 0, 1]
  ];

  return RM;
}

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

class CSunSystem {
  constructor() {
    this.Sun = {
      element: document.getElementById("sun"),
      x: 500,
      y: 320,
      radius: 40,
    };
    this.Earth = {
      type: "planet",
      element: document.getElementById("earth"),
      radius: 20,
      orbitRadius: 7 * this.Sun.radius,
      speed: 1,
      angle: 0,
      coordinates: new CMatrix(3, 1),
    };
    this.Mars = {
      type: "planet",
      element: document.getElementById("mars"),
      radius: 25,
      orbitRadius: 4 * this.Sun.radius,
      speed: -2,
      angle: 0,
      coordinates: new CMatrix(3, 1),
    };
    this.Moon = {
      type: "satellite",
      targetPlanet: this.Earth,
      element: document.getElementById("moon"),
      radius: 15,
      orbitRadius: 3 * this.Earth.radius,
      speed: 15,
      angle: 0,
      coordinates: new CMatrix(3, 1),
    };
    this.New = {
      type: "satellite",
      targetPlanet: this.Mars,
      element: document.getElementById("new"),
      radius: 15,
      orbitRadius: 3 * this.Mars.radius,
      speed: -8,
      angle: 0,
      coordinates: new CMatrix(3, 1),
    };
    this.St = {
      type: "satellite",
      targetPlanet: this.Mars,
      element: document.getElementById("st"),
      radius: 10,
      orbitRadius: 1.5 * this.Mars.radius,
      speed: 3,
      angle: 0,
      coordinates: new CMatrix(3, 1),
    };

    this.discretizationInterval = 0.3; //ms
    this.planets = [this.Earth, this.Moon, this.New, this.Mars, this.St];

    // draw sun
    this.Sun.element.style.width = this.Sun.radius + 'px';
    this.Sun.element.style.height = this.Sun.radius + 'px';
    this.Sun.element.style.left = this.Sun.x - this.Sun.radius / 2 + 'px';
    this.Sun.element.style.top = this.Sun.y - this.Sun.radius / 2 + 'px';

    this.DrawOrbits();

    let interval = setInterval(() => {
      this.SetNewCoordinates().Draw();
    }, this.discretizationInterval * 100);
  }

  SetNewCoordinates() {
    const getRadians = (angle) => (angle / 180.0) * Math.PI;

    const setCoordinates = (planet) => {
      let radians = getRadians(planet.angle);
      let x = planet.orbitRadius * Math.cos(radians);
      let y = planet.orbitRadius * Math.sin(radians);
      planet.coordinates.Matrix = [[x], [y], [1]];
      planet.angle += this.discretizationInterval * planet.speed;
      planet.coordinates = CreateRotate2D(planet.angle).Multiply(planet.coordinates);
    }

    for (let planet of this.planets)
      setCoordinates(planet);

    return this;
  }

  DrawOrbits() {
    for (let planet of this.planets) {
      let orbit = document.createElement("div");
      orbit.classList.add("orbit", planet.element.id + "-orbit");

      orbit.style.width = planet.orbitRadius * 2 + 'px';
      orbit.style.height = planet.orbitRadius * 2 + 'px';

      orbit.style.left = this.Sun.x - planet.orbitRadius + 'px';
      orbit.style.top = this.Sun.y - planet.orbitRadius + 'px';

      document.body.appendChild(orbit);
    }
  }

  Draw() {
    for (let planet of this.planets) {
      planet.element.style.width = planet.radius + 'px';
      planet.element.style.height = planet.radius + 'px';

      // redraw satellite orbit
      if (planet.type === "satellite") {
        let satelliteOrbit = document.querySelector(`.${planet.element.id}-orbit`);
        let satelliteOrbitCoordinates = [
          this.Sun.x + planet.targetPlanet.coordinates.Matrix[0][0] - planet.orbitRadius,
          this.Sun.y + planet.targetPlanet.coordinates.Matrix[1][0] - planet.orbitRadius
        ];
        satelliteOrbit.style.left = satelliteOrbitCoordinates[0] + 'px';
        satelliteOrbit.style.top = satelliteOrbitCoordinates[1] + 'px';

        planet.element.style.left = satelliteOrbitCoordinates[0] + planet.orbitRadius + planet.coordinates.Matrix[0][0] - planet.radius / 2 + 'px';
        planet.element.style.top = satelliteOrbitCoordinates[1] + planet.orbitRadius + planet.coordinates.Matrix[1][0] - planet.radius / 2 + 'px';
      } else {
        planet.element.style.left = this.Sun.x - planet.radius / 2 + planet.coordinates.Matrix[0][0] + 'px';
        planet.element.style.top = this.Sun.y - planet.radius / 2 + planet.coordinates.Matrix[1][0] + 'px';
      }
    }

    return this;
  }
}

let sunSystem = new CSunSystem();