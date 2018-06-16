class Ship {
	constructor() {
		this.pos = new THREE.Vector3(0, 0, 0);
		this.vel = new THREE.Vector3(0, 0, 0);
		this.rotateVel = new THREE.Vector3(0, 0, 0);
		this.quaternion = new THREE.Quaternion(0,0,0,1);

		this.accel = 45;
		this.maxVel = 60;

		this.rotateAccel = Math.PI/2;
		this.maxRotateVel = Math.PI/4;
	}

	rotateShip(x, y, z, w) {
		const currentQuaternion = this.quaternion;
		const multiplyQuaternion = (new THREE.Quaternion(Math.sin(x/2), Math.sin(y/2), Math.sin(z/2), Math.cos(w/2))).normalize();
		currentQuaternion.multiplyQuaternions(currentQuaternion, multiplyQuaternion);
		this.quaternion = currentQuaternion;
	}

	//87: w
    //83: s
    //65: a
    //68: d
    //81: q
    //69: e
    //32: space
	update(dt, keysPressed) {
		if (keysPressed[87] && !keysPressed[83]) this.rotateVel.x += this.rotateAccel*dt;
		else if (keysPressed[83] && !keysPressed[87]) this.rotateVel.x -= this.rotateAccel*dt;

		if (keysPressed[65] && !keysPressed[68]) this.rotateVel.y += this.rotateAccel*dt;
		else if (keysPressed[68] && !keysPressed[65]) this.rotateVel.y -= this.rotateAccel*dt;

		if (keysPressed[81] && !keysPressed[69]) this.rotateVel.z += this.rotateAccel*dt;
		else if (keysPressed[69] && !keysPressed[81]) this.rotateVel.z -= this.rotateAccel*dt;

		if (this.rotateVel.x > this.maxRotateVel) this.rotateVel.x = this.maxRotateVel;
		else if (this.rotateVel.x < -this.maxRotateVel) this.rotateVel.x = -this.maxRotateVel;

		if (this.rotateVel.y > this.maxRotateVel) this.rotateVel.y = this.maxRotateVel;
		else if (this.rotateVel.y < -this.maxRotateVel) this.rotateVel.y = -this.maxRotateVel;

		if (this.rotateVel.z > this.maxRotateVel) this.rotateVel.z = this.maxRotateVel;
		else if (this.rotateVel.z < -this.maxRotateVel) this.rotateVel.z = -this.maxRotateVel;

		const dtRotateVelocity = this.rotateVel.clone().multiplyScalar(dt);
		this.rotateShip(dtRotateVelocity.x, 0, 0, dtRotateVelocity.x);
		this.rotateShip(0, dtRotateVelocity.y, 0, dtRotateVelocity.y);
		this.rotateShip(0, 0, dtRotateVelocity.z, dtRotateVelocity.z);

		if (keysPressed[32]) this.vel.add(((new THREE.Vector3(0,0,-1)).applyQuaternion(this.quaternion)).multiplyScalar(this.accel*dt));
		if (this.vel.length() > this.maxVel) this.vel.multiplyScalar(this.maxVel/this.vel.length());

		this.pos.add(this.vel.clone().multiplyScalar(dt));
	}
}