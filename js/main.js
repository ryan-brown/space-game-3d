class Game {
  constructor() {
    this.initScene();
    this.initHUD();
    this.initPhysics();
    this.initGame();
  }

  initScene() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, width/height, 0.01, 10000);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(width, height);
    this.renderer.autoClear = false;
    document.body.appendChild(this.renderer.domElement);

    this.textures = {}
    this.loadTextures();

    this.scene.add(new THREE.DirectionalLight(0xffffff, 1));
    this.scene.add(new THREE.AmbientLight(0x222222));

    this.renderSkybox();
  }

  renderSkybox() {
    const geometry = new THREE.CubeGeometry(10000, 10000, 10000);
    const material = new THREE.MeshBasicMaterial({map: this.textures['space'] })
    this.skybox = new THREE.Mesh(geometry, material);
    this.skybox.material.side = THREE.BackSide;

    this.scene.add(this.skybox);
  }

  initHUD() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.hudCanvas = document.createElement('canvas');
    this.hudCanvas.width = width;
    this.hudCanvas.height = height;

    this.hudContext = this.hudCanvas.getContext('2d');

    this.cameraHUD = new THREE.OrthographicCamera(-width/2, width/2, height/2, -height/2, 0, 30);
    this.sceneHUD = new THREE.Scene();

    this.hudTexture = new THREE.Texture(this.hudCanvas);
    const material = new THREE.MeshBasicMaterial( {map: this.hudTexture } );
    material.transparent = true;

    var planeGeometry = new THREE.PlaneGeometry( width, height );
    var plane = new THREE.Mesh(planeGeometry, material);
    this.sceneHUD.add(plane);

    this.crosshair = new THREE.Vector2(0, 0);
  }

  initPhysics() {
    this.ship = new Ship();
    this.bullets = [];
    this.asteroids = [];
    this.generateAsteroids(2000, new THREE.MeshLambertMaterial({map: this.textures['asteroid']}));
  }

  initGame() {
    this.keysPressed = {}
    this.lastTime = 0;
    this.lastDts = [];
    this.fps = 0;
    this.renderLoop(0);
  }

  resizeWindow() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);

    this.hudCanvas.width = width;
    this.hudCanvas.height = height;
  }

  loadTextures() {
    const loader = new THREE.TextureLoader();
    this.textures['asteroid'] = loader.load('images/rock-texture.jpg');
    this.textures['space'] = loader.load('images/space-texture.jpg');
  }

  mouseMove(event) {
    const mouseMoveVector = new THREE.Vector2(event.movementX, event.movementY);
    this.crosshair.add(mouseMoveVector);
    if (this.crosshair.length() > 100) {
      this.crosshair.normalize().multiplyScalar(100);
    }
  }

  generateAsteroids(n, material) {
    for (let i = 0; i < n; i++) {
      const randX = 4000*Math.random() - 2000;
      const randY = 4000*Math.random() - 2000;
      const randZ = 4000*Math.random() - 2000;
      const pos = new THREE.Vector3(randX, randY, randZ)

      const r = 45*Math.random() + 5;

      const randVelX = 1*Math.random() - 0.1;
      const randVelY = 1*Math.random() - 0.1;
      const randVelZ = 1*Math.random() - 0.1;
      const vel = new THREE.Vector3(randVelX, randVelY, randVelZ)

      const randAxisX = Math.random();
      const randAxisY = Math.random();
      const randAxisZ = Math.random();
      const axis = (new THREE.Vector3(randVelX, randVelY, randVelZ)).normalize();

      const angle = Math.PI/2*Math.random() - Math.PI/4;

      const asteroid = new Asteroid(pos, r, vel, axis, angle, material);

      this.asteroids.push(asteroid);
      this.scene.add(asteroid.mesh);
    }
  }

  fire() {
    let dir = (new THREE.Vector3(0,0,-1)).applyQuaternion(this.ship.quaternion);
    let bullet = new Bullet(this.ship.pos.clone(), this.ship.vel.clone(), dir);
    this.bullets.push(bullet)
    this.scene.add(bullet.mesh);
  }

  updatePhysics(dt) {
    for (let i = 0; i < this.asteroids.length; i++) {
      this.asteroids[i].update(dt);
    }

    for (let i = this.bullets.length - 1; i >= 0; i--) {
      let bullet = this.bullets[i]
      bullet.update(dt);
      if (bullet.lifetime <= 0) {
        this.scene.remove(bullet.mesh);
        this.bullets.splice(i, 1);
      }
    }

    for (let i = this.bullets.length - 1; i >= 0; i--) {
      for (let j = this.asteroids.length - 1; j >= 0; j--) {
        let bullet = this.bullets[i];
        let asteroid = this.asteroids[j];

        if ((bullet.pos.clone().sub(asteroid.pos.clone())).length() <= asteroid.r) {
          this.scene.remove(bullet.mesh);
          this.scene.remove(asteroid.mesh);
          this.bullets.splice(i, 1);
          this.asteroids.splice(j, 1);
          break;
        }
      }
    }

    this.ship.update(dt, this.keysPressed);
  }

  render3D() {
    this.camera.setRotationFromQuaternion(this.ship.quaternion);
    this.camera.position.copy(this.ship.pos);
    this.skybox.position.copy(this.ship.pos);

    this.renderer.render(this.scene, this.camera);
  }

  renderCrosshair() {
    this.hudContext.fillStyle = 'red';
    
    this.hudContext.beginPath();
    this.hudContext.arc(window.innerWidth/2+this.crosshair.x, window.innerHeight/2+this.crosshair.y, 3, 0, 2 * Math.PI);
    this.hudContext.fill();
    this.hudContext.closePath();

    this.hudContext.strokeStyle = 'green';
    this.hudContext.lineWidth = 2;

    this.hudContext.beginPath();
    this.hudContext.arc(window.innerWidth/2, window.innerHeight/2, 100, 0, 2 * Math.PI);
    this.hudContext.stroke();
    this.hudContext.closePath();
  }

  vectorToString(vector) {
    return "{"+vector.x.toFixed(2)+", "+vector.y.toFixed(2)+", "+vector.z.toFixed(2)+"}";
  }

  quaternionToString(quaternion) {
    return "{"+quaternion.x.toFixed(2)+", "+quaternion.y.toFixed(2)+", "+quaternion.z.toFixed(2)+", "+quaternion.w.toFixed(2)+"}";
  }

  renderHUD() {
    this.hudContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
    this.renderCrosshair();
    this.hudTexture.needsUpdate = true;

    this.hudContext.font = "16px Arial";
    this.hudContext.fillStyle = "white";
    this.hudContext.textAlign = "start";
    this.hudContext.textBaseline = "bottom";


    this.hudContext.fillText("FPS: " + Math.round(this.fps), 5, this.hudCanvas.height - 85); 
    this.hudContext.fillText("Postition: " + this.vectorToString(this.ship.pos), 5, this.hudCanvas.height - 65); 
    this.hudContext.fillText("Velocity: " + this.vectorToString(this.ship.vel), 5, this.hudCanvas.height - 45); 
    this.hudContext.fillText("Rotation Velocity: " + this.vectorToString(this.ship.rotateVel), 5, this.hudCanvas.height - 25); 
    this.hudContext.fillText("Orientation: " + this.quaternionToString(this.ship.quaternion), 5, this.hudCanvas.height - 5); 

    this.renderer.render(this.sceneHUD, this.cameraHUD);
  }

  calculateFPS(dt) {
    if (this.lastDts.length > 10) this.lastDts.shift();
    this.lastDts.push(dt);

    let sum = 0;
    for( var i = 0; i < this.lastDts.length; i++ ){
        sum += this.lastDts[i];
    }

    this.fps = this.lastDts.length/sum;
  }

  renderLoop(ts) {
    requestAnimationFrame((timestamp) => this.renderLoop(timestamp));
    const dt = (ts - this.lastTime)/1000;
    this.lastTime = ts;

    this.calculateFPS(dt);

    this.updatePhysics(dt);

    this.render3D();
    this.renderHUD();
  }
}



let game = new Game();

addEventListener("resize", () => game.resizeWindow());

addEventListener("keyup", (event) => {
  game.keysPressed[event.keyCode] = false;
});
addEventListener("keydown", (event) => {
  if(event.keyCode == 32) event.preventDefault();
  if(event.keyCode == 82) {
    game.ship = new Ship();
  }

  game.keysPressed[event.keyCode] = true;
});

addEventListener("click", () => game.fire());

addEventListener("click", function() {
  const element = document.body;
  element.requestPointerLock = element.requestPointerLock ||
                    element.mozRequestPointerLock ||
                    element.webkitRequestPointerLock;
  element.requestPointerLock();
});

addEventListener("mousemove", (event) => game.mouseMove(event), false);




