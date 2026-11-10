import test from 'node:test';
import assert from 'node:assert/strict';
import {ThirdPersonControllerManager} from '../js/controllers.js';

const module=await import('../js/touch-controls.js').catch(()=>({}));
function input(){
 assert.equal(typeof module.TouchInputState,'function','mobile movement input is missing');
 const controller=Object.create(ThirdPersonControllerManager.prototype);
 controller.keys={forward:false,backward:false,left:false,right:false,up:false,down:false,boost:false};
 controller._touchKeys={};controller._keyboardKeys={};controller._gamepadKeys={};controller._pressedCodes=new Set();
 return {controller,state:new module.TouchInputState(controller)};
}

test('one thumb can drive forward and steer diagonally, with a neutral centre',()=>{
 assert.equal(typeof module.wheelActions,'function','steering wheel mapping is missing');
 assert.deepEqual(module.wheelActions(-.7,-.7),{forward:true,backward:false,left:true,right:false});
 assert.deepEqual(module.wheelActions(.7,.7),{forward:false,backward:true,left:false,right:true});
 assert.deepEqual(module.wheelActions(.1,-.1),{forward:false,backward:false,left:false,right:false});
});
test('a held direction reaches the real controller and lifting the finger releases it',()=>{
 const {controller,state}=input();state.hold(1,{forward:true,left:true});
 assert.equal(controller.keys.forward,true);assert.equal(controller.keys.left,true);
 state.release(1);assert.equal(controller.keys.forward,false);assert.equal(controller.keys.left,false);
});
test('moving a held finger from forward to reverse clears its old direction',()=>{
 const {controller,state}=input();state.hold(1,{forward:true});state.hold(1,{backward:true});
 assert.equal(controller.keys.forward,false);assert.equal(controller.keys.backward,true);
});
test('releasing one finger preserves another finger on the same action and on boost',()=>{
 const {controller,state}=input();state.hold(1,{forward:true});state.hold(2,{forward:true,boost:true});
 state.release(1);assert.equal(controller.keys.forward,true);assert.equal(controller.keys.boost,true);
 state.release(2);assert.equal(controller.keys.forward,false);assert.equal(controller.keys.boost,false);
});
test('touch release preserves an independently held keyboard or gamepad action',()=>{
 const {controller,state}=input();controller._keyboardKeys.forward=true;controller.setGamepadInput('left',.6);
 state.hold(1,{forward:true,left:true});state.release(1);
 assert.equal(controller.keys.forward,true);assert.equal(controller.keys.left,.6);
});
test('reset cancels movement and altitude inputs without resurrecting an old finger',()=>{
 const {controller,state}=input();state.hold(1,{forward:true});state.hold(2,{up:true});state.reset();
 state.hold(3,{boost:true});
 assert.equal(controller.keys.forward,false);assert.equal(controller.keys.up,false);assert.equal(controller.keys.boost,true);
});
