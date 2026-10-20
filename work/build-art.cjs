const fs = require('fs');
const path = require('path');
const out = path.resolve(__dirname, '../outputs/assets');
let seed = 13;
function random() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
const parts = [];
parts.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 800"><defs>');
parts.push('<radialGradient id="a"><stop offset="0" stop-color="#130d21" stop-opacity="0"/><stop offset=".47" stop-color="#241334" stop-opacity=".15"/><stop offset=".7" stop-color="#7d3cb0" stop-opacity=".2"/><stop offset="1" stop-color="#0b0910" stop-opacity="0"/></radialGradient>');
parts.push('<radialGradient id="hole"><stop offset="0" stop-color="#030305"/><stop offset=".86" stop-color="#030305"/><stop offset=".98" stop-color="#0b0711"/><stop offset="1" stop-color="#1b1029"/></radialGradient>');
parts.push('<linearGradient id="disk"><stop stop-color="#ac80f6" stop-opacity="0"/><stop offset=".2" stop-color="#c3a3ff" stop-opacity=".3"/><stop offset=".47" stop-color="#e2c8ff"/><stop offset=".56" stop-color="#c2a0ff" stop-opacity=".8"/><stop offset=".8" stop-color="#7a49bd" stop-opacity=".4"/><stop offset="1" stop-color="#5e3b90" stop-opacity="0"/></linearGradient>');
parts.push('<filter id="blur"><feGaussianBlur stdDeviation="12"/></filter><filter id="soft"><feGaussianBlur stdDeviation="3"/></filter><filter id="texture" x="-30%" y="-30%" width="160%" height="160%"><feTurbulence type="fractalNoise" baseFrequency=".035 .15" numOctaves="3" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3"/></filter>');
parts.push('</defs><ellipse cx="500" cy="355" rx="460" ry="350" fill="url(#a)"/>');
parts.push('<g transform="rotate(-17 500 355)"><g fill="none" stroke="#a46af5" filter="url(#blur)"><circle cx="500" cy="355" r="163" stroke-width="16" opacity=".5"/><ellipse cx="500" cy="375" rx="350" ry="67" stroke-width="23" opacity=".28"/></g>');
parts.push('<g filter="url(#texture)" fill="none">');
for (let i=0;i<110;i++) {
  const r = 152 + i * .39;
  const opacity = Math.max(.015, .55 * Math.exp(-i/24));
  parts.push('<circle cx="500" cy="355" r="'+r.toFixed(2)+'" stroke="'+(i<8?'#ecdaff':'#ae7cfa')+'" stroke-width="'+(.2+random()*.9).toFixed(2)+'" opacity="'+opacity.toFixed(3)+'"/>');
}
for (let i=0;i<125;i++) {
  const rx = 180+i*1.75;
  const ry = 27+i*.42;
  const op = (.04 + random()*.25)*(1-i/155);
  parts.push('<ellipse cx="500" cy="375" rx="'+rx+'" ry="'+ry+'" stroke="url(#disk)" stroke-width="'+(.3+random()*1.0).toFixed(2)+'" opacity="'+op.toFixed(3)+'"/>');
}
parts.push('</g><circle cx="500" cy="355" r="150" fill="url(#hole)"/><circle cx="500" cy="355" r="151" fill="none" stroke="#e0c6ff" stroke-width="1.1" opacity=".85"/><circle cx="500" cy="355" r="153" fill="none" stroke="#d0a7ff" stroke-width="2" filter="url(#soft)" opacity=".6"/>');
parts.push('<g fill="none" filter="url(#texture)">');
for(let i=0;i<100;i++) {
  const rx = 179+i*2.2, ry = 20+i*.56;
  const opacity = (.08+random()*.4)*(1-i/115);
  parts.push('<path d="M'+(500-rx)+' 375 A'+rx+' '+ry+' 0 0 0 '+(500+rx)+' 375" stroke="url(#disk)" stroke-width="'+(.4+random()*.8).toFixed(2)+'" opacity="'+opacity.toFixed(3)+'"/>');
}
parts.push('</g><path d="M133 376 Q500 441 867 376" fill="none" stroke="#d5b5ff" opacity=".35" stroke-width="1" filter="url(#soft)"/></g>');
for(let i=0;i<200;i++){
  const x=100+random()*800,y=220+random()*300;
  const d=Math.hypot((x-500)/2,y-355);
  if(d>160&&d<280) parts.push('<circle cx="'+x.toFixed(2)+'" cy="'+y.toFixed(2)+'" r="'+(.25+random()*.6).toFixed(2)+'" fill="#d5b8ff" opacity="'+(.08+random()*.25).toFixed(2)+'"/>');
}
parts.push('</svg>');
fs.writeFileSync(path.join(out,'singularity.svg'),parts.join(''));
fs.writeFileSync(path.join(out,'favicon.svg'),'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="18" fill="#121019"/><text x="17" y="48" fill="#d1c2ff" font-family="Arial,sans-serif" font-size="49" font-weight="bold">b</text><circle cx="51" cy="45" r="4" fill="#a78bfa"/></svg>');
console.log('Created local singularity illustration and favicon.');
