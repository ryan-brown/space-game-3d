class Bullet {
	constructor(pos, shipVel, dir) {
		this.pos = pos;
		this.vel = shipVel.add(dir.multiplyScalar(500));
		this.lifetime = 3;

		const geometry = new THREE.SphereGeometry(0.2)
		const material = new THREE.MeshBasicMaterial({color: 0xcccc00})

		this.mesh = new THREE.Mesh(geometry, material);
		this.mesh.position.copy(this.pos);
	}

	update(dt) {
		this.lifetime -= dt;
		this.pos.add(this.vel.clone().multiplyScalar(dt));
		this.mesh.position.copy(this.pos);
	}
}