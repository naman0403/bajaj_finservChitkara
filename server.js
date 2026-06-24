'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

function processData(data) {
  const invalid_entries = [], duplicate_edges = [], seen = new Set(), reported = new Set(), candidates = [];
  for (const raw of data) {
    const value = typeof raw === 'string' ? raw.trim() : '';
    const match = /^([A-Z])->([A-Z])$/.exec(value);
    if (!match || match[1] === match[2]) { invalid_entries.push(typeof raw === 'string' ? raw.trim() : String(raw)); continue; }
    if (seen.has(value)) { if (!reported.has(value)) { duplicate_edges.push(value); reported.add(value); } continue; }
    seen.add(value); candidates.push([match[1], match[2]]);
  }
  const claimed = new Set(), edges = [];
  for (const edge of candidates) { if (!claimed.has(edge[1])) { claimed.add(edge[1]); edges.push(edge); } }
  const nodes = [], known = new Set(), children = new Map(), neighbors = new Map();
  function addNode(n) { if (!known.has(n)) { known.add(n); nodes.push(n); children.set(n, []); neighbors.set(n, []); } }
  for (const [p,c] of edges) { addNode(p); addNode(c); children.get(p).push(c); neighbors.get(p).push(c); neighbors.get(c).push(p); }
  const components = [], visited = new Set();
  for (const start of nodes) { if (visited.has(start)) continue; const group=[], stack=[start]; visited.add(start); while(stack.length){const n=stack.pop(); group.push(n); for(const x of neighbors.get(n)) if(!visited.has(x)){visited.add(x);stack.push(x);}} components.push(group); }
  function cyclic(group) { const inside=new Set(group), state=new Map(); function visit(n){state.set(n,1);for(const c of children.get(n)){if(!inside.has(c))continue;if(state.get(c)===1)return true;if(!state.has(c)&&visit(c))return true;}state.set(n,2);return false;} return group.some(n=>!state.has(n)&&visit(n)); }
  function branch(n){const out={};for(const c of children.get(n))out[c]=branch(c);return out;}
  function depth(n){return children.get(n).length ? 1+Math.max(...children.get(n).map(depth)) : 1;}
  const hierarchies = components.map(group => { const childSet=new Set(edges.filter(e=>group.includes(e[0])).map(e=>e[1])); const roots=group.filter(n=>!childSet.has(n)).sort(); const root=roots[0]||[...group].sort()[0]; return cyclic(group)?{root,tree:{},has_cycle:true}:{root,tree:{[root]:branch(root)},depth:depth(root)}; });
  const trees=hierarchies.filter(h=>!h.has_cycle), largest=[...trees].sort((a,b)=>b.depth-a.depth||a.root.localeCompare(b.root))[0];
  return { hierarchies, invalid_entries, duplicate_edges, summary:{total_trees:trees.length,total_cycles:hierarchies.length-trees.length,largest_tree_root:largest?largest.root:''} };
}

function payload(data){const name=(process.env.FULL_NAME||'Naman').toLowerCase().replace(/[^a-z]/g,'');return {user_id:`${name}_${process.env.DATE_OF_BIRTH||'DDMMYYYY'}`,email_id:process.env.COLLEGE_EMAIL||'naman2160.be23@chitkara.edu.in',college_roll_number:process.env.COLLEGE_ROLL_NUMBER||'YOUR_ROLL_NUMBER',...processData(data)};}
function json(res,status,body){res.writeHead(status,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type'});res.end(JSON.stringify(body));}
const server=http.createServer((req,res)=>{
  if(req.url==='/bfhl'&&req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type'});return res.end();}
  if(req.url==='/bfhl'&&req.method==='POST'){let raw='';req.on('data',c=>raw+=c);return req.on('end',()=>{try{const body=JSON.parse(raw||'{}');if(!Array.isArray(body.data))return json(res,400,{error:'Request body must contain a data array.'});if(body.data.length>50)return json(res,400,{error:'Maximum 50 entries allowed.'});return json(res,200,payload(body.data));}catch{return json(res,400,{error:'Invalid JSON body.'});}});}
  const file=req.url==='/'?'index.html':req.url.slice(1), full=path.join(__dirname,'public',file);
  fs.readFile(full,(err,data)=>{if(err)return json(res,404,{error:'Not found'});const ext=path.extname(full);res.writeHead(200,{'Content-Type':ext==='.css'?'text/css':ext==='.js'?'text/javascript':'text/html'});res.end(data);});
});
if(require.main===module)server.listen(process.env.PORT||3000,()=>console.log('Running at http://localhost:3000'));
module.exports={server,processData};
