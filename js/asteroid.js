class Asteroid {
	constructor(pos, r, vel, axis, angle, material) {
		this.pos = pos;
		this.r = r;
		this.vel = vel;
		this.axis = axis;
		this.angle = angle;

		let geometry = new THREE.IcosahedronGeometry(r,1);
		for (var i = 0; i < geometry.vertices.length; i++) {
			geometry.vertices[i].x += (r/3)*Math.random() - (r/6);
			geometry.vertices[i].y += (r/3)*Math.random() - (r/6);
			geometry.vertices[i].z += (r/3)*Math.random() - (r/6);
		}
		this.mesh = new THREE.Mesh(geometry, material);
		this.mesh.position.copy(this.pos);
	}

	update(dt) {
		this.pos.add(this.vel.clone().multiplyScalar(dt));

		this.mesh.rotateOnAxis(this.axis, this.angle*dt)
		this.mesh.position.copy(this.pos);
	}
}