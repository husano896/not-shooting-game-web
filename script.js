var keypressed = {};

// 常數定義區
var gameLane = document.querySelector('div.game-lane');
var cursorL = document.querySelector('div.laser-cursor-l');
var cursorR = document.querySelector('div.laser-cursor-r');

var laneBTA = document.querySelector('div.bt-a');
var laneBTB = document.querySelector('div.bt-b');
var laneBTC = document.querySelector('div.bt-c');
var laneBTD = document.querySelector('div.bt-d');
var laneFXL = document.querySelector('div.fx-l');
var laneFXR = document.querySelector('div.fx-r');

var camera = document.querySelector('.camera');

var perspective = 128;
var rotateX = 10;
var rotateZ = 0;

var notes = [];

var lanes = ['bt-a', 'bt-b', 'bt-c', 'bt-d', 'fx-l', 'fx-r']
var lastUpdate = 0;
class Note {
	constructor(type) {
		this.el = document.createElement('div')
		this.el.className = type
		this.distance = 2000;
		switch (type) {
			case 'bt-a':
				laneBTA.appendChild(this.el);
				this.el.className = 'bt-chip'
				break;
			case 'bt-b':
				laneBTB.appendChild(this.el);
				this.el.className = 'bt-chip'
				break;
			case 'bt-c':
				laneBTC.appendChild(this.el);
				this.el.className = 'bt-chip'
				break;
			case 'bt-d':
				laneBTD.appendChild(this.el);
				this.el.className = 'bt-chip'
				break;
			case 'fx-l':
				laneFXL.appendChild(this.el);
				this.el.className = 'fx-chip'
				break;
			case 'fx-r':
				laneFXR.appendChild(this.el);
				this.el.className = 'fx-chip'
				break;
		}
	}
	update(delta) {
		if (!this.el) {
			return;
		}
		this.distance -= delta;
		this.el.style.bottom = `${this.distance}px`;
		if (this.distance < 0) {
			this.el.parentElement.removeChild(this.el);
			this.el = null;
		}
	}
}
function update(delta) {
	
	notes.forEach(note => note.update(delta - lastUpdate));
	notes = notes.filter(note => note.el);
	lastUpdate = delta;
	window.requestAnimationFrame(update);
}

function init() {
	document.addEventListener('keydown', (ev) => {
		// console.log(ev);
		ev.preventDefault();
		if (ev.key === 'ArrowUp') {
			perspective -= 1;
		}
		if (ev.key === 'ArrowDown') {
			perspective += 1;
		}
		if (ev.key === 'ArrowLeft') {
			rotateZ -= 1;
		}
		if (ev.key === 'ArrowRight') {
			rotateZ += 1;
		}

		camera.style.perspective = `${perspective}px`;
		gameLane.style.transform = `rotateX(${rotateX}deg) rotateY(0deg) rotateZ(${rotateZ}deg)`;
		keypressed[ev.key] = true;

	});
	document.addEventListener('keyup', (ev) => {
		ev.preventDefault();
		keypressed[ev.key] = false;
	});
	document.addEventListener('pointermove', (ev) => {
		ev.preventDefault();
		cursorL.style.left = `calc(min(${ev.clientX}px, 60vh) - 7.5vh)`
		cursorR.style.left = `calc(min(${ev.clientY}px, 60vh) - 7.5vh)`
	});
	camera.style.perspective = `${perspective}px`;
	gameLane.style.transform = `rotateX(${rotateX}deg) rotateY(0deg) rotateZ(${rotateZ}deg)`;
	update();
}

init()

setInterval(() => {
	notes.push(new Note(lanes[Math.floor(Math.random()* lanes.length )] ))
}, 100)