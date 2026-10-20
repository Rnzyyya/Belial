const fs=require('fs'),path=require('path'),{execFile}=require('child_process');
const css=fs.readFileSync(path.join(__dirname,'fonts.css'),'utf8');
const urls=[...css.matchAll(/https:\/\/fonts\.gstatic\.com\/[^)]+/g)].map(m=>m[0]);
const folder=path.resolve(__dirname,'../outputs/assets/fonts');
fs.mkdirSync(folder,{recursive:true});
function download(url,index){return new Promise((resolve,reject)=>{execFile('rtk',['curl.exe','-L','--fail','--silent','--show-error','--connect-timeout','8','--max-time','25',url,'-o',path.join(folder,'font-'+index+'.ttf')],(err,stdout,stderr)=>err?reject(new Error(stderr)):resolve());});}
(async()=>{await Promise.all(urls.map(download));let local=css;urls.forEach((url,index)=>{local=local.replace(url,'assets/fonts/font-'+index+'.ttf');});fs.writeFileSync(path.resolve(__dirname,'../outputs/fonts.css'),local);console.log('Saved all 10 font weights locally.');})().catch(err=>{console.error(err.message);process.exitCode=1;});
