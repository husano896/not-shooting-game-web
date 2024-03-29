const keypressed = {};

// 常數定義區
const gameLane = document.querySelector('div.game-lane');
const cursorL = document.querySelector('div.laser-cursor-l');
const cursorR = document.querySelector('div.laser-cursor-r');

const laneBTA = document.querySelector('div.bt-a');
const laneBTB = document.querySelector('div.bt-b');
const laneBTC = document.querySelector('div.bt-c');
const laneBTD = document.querySelector('div.bt-d');
const laneFXL = document.querySelector('div.fx-l');
const laneFXR = document.querySelector('div.fx-r');

let laserLVal = 0;
let laserRVal = 1000;

const cameraEl = document.querySelector('.camera');

const audioRes = {
	tick1: new Audio('audio/tick1.mp3'),
	tick2: new Audio('audio/tick2.mp3')
}
let keyA = 'a';
let keyB = 'b';
let keyC = 'c';
let keyD = 'd';
let keyL = 'j';
let keyR = 'i';
let keyVolLL = '1';
let keyVolLR = '2';
let keyVolRL = '9';
let keyVolRR = '0';
/* perspective越小, zoom-bottom 越大 zoom-top越小; */
let perspective = 256;

/* rotateX越大, zoom-bottom越大 zoom-top越小 */
let rotateX = 45;
let rotateZ = 0;

let notes = [];

let lanes = ['bt-a', 'bt-b', 'bt-c', 'bt-d', 'fx-l', 'fx-r']
let lastUpdate = 0;

// 音樂所在位置ms
let musicPos = 0;

function getSlamHeight() {
	return 64;
}

// 測試用旋鈕Note
const test_laserNotes = [{
	time: 0,
	pos: 0.0,
	isSlam: true
},
{
	time: 1000,
	pos: 1.0
},
{
	time: 2000,
	pos: 0.0
},
{
	time: 3000,
	pos: 1.0,
	isSlam: true
},
{
	time: 4000,
	pos: 0.0
}
]

const els = test_laserNotes.map((note, index) => {
	const el = document.createElement('div');

	const nextNote = test_laserNotes[index + 1];
	// 如果是直角時
	if (note.isSlam || nextNote?.time === note.time) {

		const timeDiff = nextNote.time - note.time;

		const height = getSlamHeight()
		// 直角寬度根據前後旋鈕Note所在位置判定
		const width = (note.pos - nextNote.pos) * 100;

		el.style.width = `${width}%`;
		el.style.height = `${height}px`;
	}
	if (nextNote) {
		// TODO: 移動變化量 / 時間變化量 * 高度補正
		const height = nextNote.time - note.time;
		const deg = (nextNote.pos - note.pos) / (nextNote.time - note.time);

	}
});

const nautica = {
	fetch: ()=> {
		fetch('https://ksm.dev/app/songs', {headers: {mode: 'no-cors'}})
			.then(resp => resp.json())
			.then(data => console.log(data));
	}
}

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

	// 旋鈕的判定圖案開關
	cursorL.setAttribute('state', laserLVal < 200 ? '' : 'miss')
	cursorR.setAttribute('state', laserRVal > 800 ? '' : 'miss')
	window.requestAnimationFrame(update);
	if (keypressed[keyVolLL]) {
		laserLVal = Math.max(0, Math.min(laserLVal - 10, 1000));
	} else if (keypressed[keyVolLR]) {
		laserLVal = Math.max(0, Math.min(laserLVal + 10, 1000));
	}
	if (keypressed[keyVolRL]) {
		laserRVal = Math.max(0, Math.min(laserRVal - 10, 1000));
	} else if (keypressed[keyVolRR]) {
		laserRVal = Math.max(0, Math.min(laserRVal + 10, 1000));
	}
	cursorL.style.left = `calc(${laserLVal / 10}% - 7.5vh)`
	cursorR.style.left = `calc(${laserRVal / 10}% - 7.5vh)`

	updateCamera();
}


function getTilt() {
	const tilt = (laserLVal) - (1000 - laserRVal);
	// console.log(tilt);
	return tilt / 1000 * 30;
}

function updateCamera() {
	cameraEl.style.perspective = `${perspective}px`;

	/* rotateX越大, zoom-bottom越大 zoom-top越小*/
	/* rotateY為旋鈕導致的左右傾斜 */

	gameLane.style.transform = `rotateX(${rotateX}deg) rotateY(0deg) rotateZ(${getTilt()}deg)`;
}


function judgeKey(key) {
	const judgeEl = document.createElement('div');
	judgeEl.className = 'lane-judge empty';

	const judgeTextEl = document.createElement('div');
	judgeTextEl.className = 'judge-text critical';
	judgeTextEl.innerText = "CRITIAL";

	switch (key) {
		case keyA:
			laneBTA.appendChild(judgeEl);
			laneBTA.appendChild(judgeTextEl);
			setTimeout(() => {
				laneBTA.removeChild(judgeEl);
				laneBTA.removeChild(judgeTextEl);
			}, 500);
			audioRes.tick1.pause();
			audioRes.tick1.currentTime = 0;
			audioRes.tick1.play();
			break;
		case keyB:
			laneBTB.appendChild(judgeEl);
			laneBTB.appendChild(judgeTextEl);
			setTimeout(() => {
				laneBTB.removeChild(judgeEl);
				laneBTB.removeChild(judgeTextEl);
			}, 500);
			audioRes.tick1.pause();
			audioRes.tick1.currentTime = 0;
			audioRes.tick1.play();
			break;
		case keyC:
			laneBTC.appendChild(judgeEl);
			laneBTC.appendChild(judgeTextEl);
			setTimeout(() => {
				laneBTC.removeChild(judgeEl);
				laneBTC.removeChild(judgeTextEl);
			}, 500);
			audioRes.tick1.pause();
			audioRes.tick1.currentTime = 0;
			audioRes.tick1.play();
			break;
		case keyD:
			laneBTD.appendChild(judgeEl);
			laneBTD.appendChild(judgeTextEl);
			setTimeout(() => {
				laneBTD.removeChild(judgeEl);
				laneBTD.removeChild(judgeTextEl);
			}, 500);
			audioRes.tick1.pause();
			audioRes.tick1.currentTime = 0;
			audioRes.tick1.play();
			break;
		case keyL:
			laneFXL.appendChild(judgeEl);
			laneFXL.appendChild(judgeTextEl);
			setTimeout(() => {
				laneFXL.removeChild(judgeEl);
				laneFXL.removeChild(judgeTextEl);
			}, 500);
			audioRes.tick2.pause();
			audioRes.tick2.currentTime = 0;
			audioRes.tick2.play();
			break;
		case keyR:
			laneFXR.appendChild(judgeEl);
			laneFXR.appendChild(judgeTextEl);
			setTimeout(() => {
				laneFXR.removeChild(judgeEl);
				laneFXR.removeChild(judgeTextEl);
			}, 500);
			audioRes.tick2.pause();
			audioRes.tick2.currentTime = 0;
			audioRes.tick2.play();
			break;
	}
}

function onKeyDown(ev) {
	ev.preventDefault();
	switch (ev.key) {
		case 'ArrowUp':
			rotateX -= 0.1;
			break;
		case 'ArrowDown':
			rotateX += 0.1;
			break;
		case 'ArrowLeft':
			rotateZ -= 1;
			break;
		case 'ArrowRight':
			rotateZ += 1;
			break;
		case keyA:
		case keyB:
		case keyC:
		case keyD:
		case keyL:
		case keyR:
			if (keypressed[ev.key]) {
				break;
			}
			judgeKey(ev.key);
			break;
	}

	cameraEl.style.perspective = `${perspective}px`;
	gameLane.style.transform = `rotateX(${rotateX}deg) rotateY(0deg) rotateZ(${rotateZ}deg)`;
	keypressed[ev.key] = true;
}

function onKeyUp(ev) {
	ev.preventDefault();
	keypressed[ev.key] = false;
}

function onPointerMove(ev) {
	ev.preventDefault();
	console.log(ev);
	// 全螢幕模式下還是會輸出movementXY！
	// laserLVal = Math.max(0, Math.min(laserLVal + ev.movementX, 1000));
	// laserRVal = Math.max(0, Math.min(laserRVal + ev.movementY, 1000));
	laserLVal = Math.max(0, Math.min(ev.clientX, 1000));
	laserRVal = Math.max(0, Math.min(ev.clientY, 1000));
	cursorL.style.left = `calc(${laserLVal / 10}% - 7.5vh)`
	cursorR.style.left = `calc(${laserRVal / 10}% - 7.5vh)`
}

function init() {
	document.addEventListener('keydown', onKeyDown);
	document.addEventListener('keyup', onKeyUp);
	document.addEventListener('pointermove', onPointerMove);
	document.addEventListener('touchmove', onPointerMove);
	update();
	updateCamera();
}

function full() {
	// make the element go to full-screen mode
	document.body.requestFullscreen()
		.then(function () {
			// element has entered fullscreen mode successfully
			document.body.requestPointerLock();
		})
		.catch(function (error) {
			// element could not enter fullscreen mode
		});
}
init()

/*
setInterval(() => {
	notes.push(new Note(lanes[Math.floor(Math.random()* lanes.length )] ))
}, 100)*/

if ("serviceWorker" in navigator) {
	window.addEventListener("load", function () {
		navigator.serviceWorker
			.register("/serviceworker.js")
			.then(res => console.log("service worker registered"))
			.catch(err => console.log("service worker not registered", err))
	})
}

nautica.fetch();