import { CMatrix } from "./node_modules/cmatrix-cvector/CMatrix.js";

// функция для рассчета новых координат при вращении на заданный угол
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

class CSunSystem {
  // определяем в конструкторе обьекты солнечной системы и их параметры
  // а также запускаем интервал чтобы обьекты системы сами вращались
  // (перерисовывались с новыми координатами через определенный промежуток времени)
  constructor() {
    this.Sun = {
      element: document.getElementById("sun"),
      x: 500,
      y: 320,
      radius: 40,
    };
    this.Earth = {
      type: "planet", // тип обьекта солнечной системы, помимо этого типа есть спутники планет
      element: document.getElementById("earth"), // елемент из html, представляющий данный объект, которому заранее задан только цвет в css
      radius: 20, // радиус планеты
      orbitRadius: 7 * this.Sun.radius, // радиус орбиты
      speed: 1, // угловая скорость
      angle: 0, // начальное положение на орбите
      coordinates: new CMatrix(3, 1), // матрица координат
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
      targetPlanet: this.Earth, // планета для которой данный обьект является спутником
      element: document.getElementById("moon"),
      radius: 15,
      orbitRadius: 3 * this.Earth.radius,
      speed: 15,
      angle: 0,
      coordinates: new CMatrix(3, 1),
    };
    this.New = {
      type: "satellite",
      targetPlanet: this.Mars, // планета для которой данный обьект является спутником
      element: document.getElementById("new"),
      radius: 15,
      orbitRadius: 3 * this.Mars.radius,
      speed: -8,
      angle: 0,
      coordinates: new CMatrix(3, 1),
    };
    this.St = {
      type: "satellite",
      targetPlanet: this.Mars, // планета для которой данный обьект является спутником
      element: document.getElementById("st"),
      radius: 10,
      orbitRadius: 1.5 * this.Mars.radius,
      speed: 3,
      angle: 0,
      coordinates: new CMatrix(3, 1),
    };

    // время через которое будет производится перерисовка
    this.discretizationInterval = 0.3; //ms
    this.planets = [this.Earth, this.Moon, this.New, this.Mars, this.St];

    // draw sun
    this.Sun.element.style.width = this.Sun.radius + 'px';
    this.Sun.element.style.height = this.Sun.radius + 'px';
    this.Sun.element.style.left = this.Sun.x - this.Sun.radius / 2 + 'px';
    this.Sun.element.style.top = this.Sun.y - this.Sun.radius / 2 + 'px';

    this.DrawOrbits();

    // запускаем интервал с которым будет происходит перерисовка
    let interval = setInterval(() => {
      this.SetNewCoordinates().Draw();
    }, this.discretizationInterval * 100);
  }

  // задает новые координаты
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

  // рисует орбиты планет
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

  // рисует планеты
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

        // сложные расчеты чтобы правильно спозиционировать элемент относительно орбиты т.к елемент строится с верхнего левого угла
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