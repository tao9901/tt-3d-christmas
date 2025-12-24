import { GLTFLoader } from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r146/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r146/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

const renderer = new THREE.WebGLRenderer({ antialias:true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 灯光
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const pointLight = new THREE.PointLight(0xffeecc, 1);
pointLight.position.set(5, 8, 5);
scene.add(pointLight);

// 加载 GLB
const loader = new GLTFLoader();
loader.load("assets/tree.glb", (gltf) => {
  const tree = gltf.scene;
  tree.scale.set(1.3,1.3,1.3);
  scene.add(tree);
});

// 音频分析
const audio = new Audio("assets/music.mp3");
audio.loop = true;
audio.volume = 0.5;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const source = audioCtx.createMediaElementSource(audio);
const analyser = audioCtx.createAnalyser();
source.connect(analyser);
analyser.connect(audioCtx.destination);
analyser.fftSize = 256;
const dataArray = new Uint8Array(analyser.frequencyBinCount);

// 粒子系统
const particleCount = 2000;
const posArr = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount*3; i+=3) {
  posArr[i] = (Math.random()-0.5)*30;
  posArr[i+1] = Math.random()*10 + 2;
  posArr[i+2] = (Math.random()-0.5)*30;
}

const particlesGeo = new THREE.BufferGeometry();
particlesGeo.setAttribute("position", new THREE.BufferAttribute(posArr,3));

const particlesMat = new THREE.PointsMaterial({
  size: 0.15,
  color: 0xffffff,
  transparent: true,
  opacity: 0.75
});

const particles = new THREE.Points(particlesGeo, particlesMat);
scene.add(particles);

// 动画循环
function animate() {
  requestAnimationFrame(animate);

  analyser.getByteFrequencyData(dataArray);
  const bass = dataArray[1]/256;

  particles.scale.set(
    1 + bass * 0.8,
    1 + bass * 0.8,
    1 + bass * 0.8
  );

  pointLight.intensity = 0.8 + bass*1.2;

  controls.update();
  renderer.render(scene, camera);
}

animate();

// 点击播放音乐
document.body.addEventListener("click", () => {
  audioCtx.resume();
  audio.play();
});
