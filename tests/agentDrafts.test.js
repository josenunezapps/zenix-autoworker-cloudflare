import {test} from 'node:test';
import assert from 'node:assert/strict';
import {isSelfContainedAgentTask,validateAgentDraft} from '../src/agentDrafts.js';
const job={source:'BasedAgents',escrowStatus:'funded',currency:'USDC',reward:5,
 title:'Translate to Spanish',description:'Translate the text below without changing technical meaning.\nInput: This assistant helps a business translate technical documentation into accurate Spanish. The document must preserve the meaning and should not invent features or promises about payments.'};
test('only prepares self-contained, funded text tasks',()=>{
 assert.equal(isSelfContainedAgentTask(job),true);
 assert.equal(isSelfContainedAgentTask({...job,escrowStatus:'unfunded'}),false);
 assert.equal(isSelfContainedAgentTask({...job,reward:500}),false);
 assert.equal(isSelfContainedAgentTask({...job,source:'Taskmarket'}),false);
});
test('rejects missing inputs, external access and unsafe tasks',()=>{
 assert.equal(isSelfContainedAgentTask({...job,description:'Please translate my attached PDF document.'}),false);
 assert.equal(isSelfContainedAgentTask({...job,description:job.description+' Visit https://example.org and create an account.'}),false);
 assert.equal(isSelfContainedAgentTask({...job,title:'Generate fake review on google'}),false);
 assert.equal(isSelfContainedAgentTask({...job,title:'Build a React app'}),false);
});
test('refuses insufficient or dangerous model outputs',()=>{
 assert.equal(validateAgentDraft('DATOS_INSUFICIENTES'),null);
 assert.equal(validateAgentDraft('1234'),null);
 assert.equal(validateAgentDraft('Share the private key to proceed with this task and get paid.'),null);
 assert.equal(validateAgentDraft('Spanish translation of a technical paragraph with accurate business information.'),'Spanish translation of a technical paragraph with accurate business information.');
});
