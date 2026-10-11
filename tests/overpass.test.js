import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fetchProspectsWithFallback,OVERPASS_SERVERS} from '../src/overpass.js';
import {REGIONS} from '../src/prospects.js';
const server=(name)=>({name,url:'https://overpass.example/'+name});
const two=[server('a'),server('b')];
const ok=(obj)=>({ok:true,status:200,text:async()=>JSON.stringify(obj)});
test('fall back to secondary server after HTTP 500',async()=>{
 const calls=[];
 const fetcher=async(url,options)=>{calls.push({url,method:options.method,contentType:options.headers['Content-Type'],body:options.body});return url.endsWith('a')?{ok:false,status:500}:ok({elements:[{type:'node',id:1,tags:{name:'Test'}}]})};
 const result=await fetchProspectsWithFallback(REGIONS[0],fetcher,{servers:two,timeoutMs:5000});
 assert.equal(result.provider,'b');assert.equal(result.data.elements.length,1);
 assert.deepEqual(calls.map(x=>x.method),['POST','POST']);
 assert.ok(calls[0].body.includes('data='));
});
test('rejects malformed success and uses alternate',async()=>{
 const fetcher=async(url)=>url.endsWith('a')?ok({bad:1}):ok({elements:[]});
 const result=await fetchProspectsWithFallback(REGIONS[0],fetcher,{servers:two});
 assert.equal(result.provider,'b');assert.deepEqual(result.data.elements,[]);
});
test('when every public server fails, it returns a useful diagnostic',async()=>{
 const fetcher=async(url)=>{if(url.endsWith('a'))throw Error('network');return {ok:false,status:503}};
 const result=await fetchProspectsWithFallback(REGIONS[0],fetcher,{servers:two});
 assert.equal(result.data,null);assert.match(result.errors.join(' '),/sin conexión/);
 assert.match(result.errors.join(' '),/HTTP 503/);
});
test('default list uses independent HTTPS endpoints',()=>{
 assert.ok(OVERPASS_SERVERS.length>=2);
 assert.ok(OVERPASS_SERVERS.every(x=>x.url.startsWith('https://')));
 assert.equal(new Set(OVERPASS_SERVERS.map(x=>x.url)).size,OVERPASS_SERVERS.length);
});
