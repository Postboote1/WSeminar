import { Engine } from "./engine";
const canvas =document.getElementsByTagName('canvas')[0];
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const renderer = new Engine();

renderer.initialize().then(()=>
{
  renderer.draw();
});