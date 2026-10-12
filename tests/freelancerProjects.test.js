import {test} from 'node:test';
import assert from 'node:assert/strict';
import {screenFreelancerProjects,freelanceFeedUrl} from '../src/freelancerProjects.js';
const now=Date.parse('2026-10-11T23:00:00Z');
const base={id:40762757,seo_url:'web-design/Responsive-Personal-Website-Optimization',
 title:'Responsive Personal Website Optimization',preview_description:'My personal website needs a refresh so it renders properly on all screens. Please rebuild responsive page components and optimize performance.',
 status:'active',frontend_project_status:'open',deleted:false,nonpublic:false,local:false,hireme:false,
 type:'fixed',currency:{code:'USD'},budget:{minimum:150,maximum:500},
 bid_stats:{bid_count:6},submitdate:Math.floor((now-60000)/1000)};
test('recognizes live-style client website requests and price',()=>{
 const x=screenFreelancerProjects({status:'success',result:{projects:[base]}},now)[0];
 assert.equal(x.category,'Páginas web');assert.equal(x.budgetMax,500);
 assert.equal(x.competition,'Baja');assert.match(x.url,/freelancer.com\/projects\/web-design/);
});
test('recognizes software and graphic design in distinct categories',()=>{
 const jobs=[
 {...base,id:2,title:'Develop custom software automation',preview_description:'Build an automated inventory data reconciliation tool with reliable tests and documentation.',seo_url:'software/Develop-custom-software-automation'},
 {...base,id:3,title:'Classic Construction Company Logo Design',preview_description:'I need a classic logo for my company with original vector files and multiple color options.',seo_url:'branding/Classic-Construction-Company-Logo-Design'}
 ];
 const r=screenFreelancerProjects({status:'success',result:{projects:jobs}},now);
 assert.deepEqual(new Set(r.map(x=>x.category)),new Set(['Software y apps','Diseño gráfico']));
});
test('rejects stale, closed, marketing-only, unpaid and unsafe listings',()=>{
 const invalid=[
 {...base,status:'closed'}, {...base,frontend_project_status:'closed'},
 {...base,submitdate:Math.floor((now-12*86400000)/1000)},
 {...base,budget:{minimum:0,maximum:0}},
 {...base,title:'Comprehensive E-commerce Marketing',preview_description:'Shopify sales growth and Facebook Ads management for a social media marketing campaign.'},
 {...base,title:'Build betting casino website',preview_description:'Build a website with gambling and casino games.'},
 {...base,seo_url:'https://malicious.site/bad'}
 ];
 assert.equal(screenFreelancerProjects({status:'success',result:{projects:invalid}},now).length,0);
});
test('retains listing with high competition but lowers its ranking',()=>{
 const data=screenFreelancerProjects({status:'success',result:{projects:[
 {...base,id:2,bid_stats:{bid_count:170},seo_url:'web-design/Website-Redesign'},
 {...base,id:3,bid_stats:{bid_count:4},seo_url:'web-design/Website-Refresh'}
 ]}},now);
 assert.equal(data[0].id,'freelancer:3');assert.equal(data[1].competition,'Alta');
});
test('safe fixed URLs and no invented API categories',()=>{
 assert.match(freelanceFeedUrl('logo'),/^https:\/\/www\.freelancer\.com\/api\/projects\//);
 assert.throws(()=>freelanceFeedUrl('https://outside.example'));
 assert.throws(()=>screenFreelancerProjects({result:{projects:[]}},now));
});
