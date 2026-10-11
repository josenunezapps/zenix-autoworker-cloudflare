import {test} from 'node:test';
import assert from 'node:assert/strict';
import {screenJobicy} from '../src/contractJobs.js';
const now=Date.parse('2026-10-11T23:00:00Z');
const job={id:3456,jobTitle:'React Frontend Developer',companyName:'Company Example',
 url:'https://jobicy.com/jobs/react-frontend-developer-3456',
 jobType:['Contract','Remote'],jobGeo:'Worldwide',pubDate:'2026-10-10T11:00:00+00:00',
 jobExcerpt:'Build apps and maintain React components',salaryMin:0,salaryMax:0};
test('returns recent remote contractor roles with original attribution',()=>{
 const results=screenJobicy({jobs:[job],success:true},now);
 assert.equal(results.length,1);assert.equal(results[0].source,'Jobicy');
 assert.ok(results[0].url.startsWith('https://jobicy.com/jobs/'));
 assert.match(results[0].note,/No es un microtrabajo garantizado/);
});
test('excludes full-time jobs that are not contracts',()=>{
 assert.equal(screenJobicy({jobs:[{...job,jobType:['Full-Time']}]},now).length,0);
});
test('excludes geographically restricted and stale roles',()=>{
 assert.equal(screenJobicy({jobs:[{...job,jobGeo:'USA only'}]},now).length,0);
 assert.equal(screenJobicy({jobs:[{...job,pubDate:'2026-09-01T00:00:00Z'}]},now).length,0);
});
test('excludes marketing campaigns unrelated to building software',()=>{
 assert.equal(screenJobicy({jobs:[{...job,jobTitle:'iOS UGC Campaign Social Media Lead'}]},now).length,0);
});
test('must not trust arbitrary links from provider',()=>{
 assert.equal(screenJobicy({jobs:[{...job,url:'https://bad.example/jobs/3456'}]},now).length,0);
});
test('does not pretend missing compensation is a guaranteed payout',()=>{
 assert.equal(screenJobicy({jobs:[job]},now)[0].salaryText,'Salario no publicado');
});
test('rejects unexpected provider format',()=>assert.throws(()=>screenJobicy({jobs:null},now)));

test('rejects USA, Italy, and Europe even when location is not marked only',()=>{
 for(const geo of ['USA','Italy','Europe','United States','Canada','UK','North America','EMEA']){
  assert.equal(screenJobicy({jobs:[{...job,jobGeo:geo}]},now).length,0,geo);
 }
});
test('remote roles explicitly open to LATAM, Argentina or worldwide remain listed',()=>{
 for(const geo of ['LATAM','Argentina','Latin America','Worldwide','Anywhere','Global','South America']){
  assert.equal(screenJobicy({jobs:[{...job,jobGeo:geo}]},now).length,1,geo);
 }
});
test('title cannot override geographic exclusion',()=>{
 assert.equal(screenJobicy({jobs:[{...job,jobTitle:'Freelance Software Tester With Smart TVs (Remote in Italy)',jobGeo:'Worldwide'}]},now).length,0);
});
test('missing location is not assumed compatible with Argentina',()=>{
 assert.equal(screenJobicy({jobs:[{...job,jobGeo:''}]},now).length,0);
});
