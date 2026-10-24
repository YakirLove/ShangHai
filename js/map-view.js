export class MapViewport{
 constructor(bounds){this.bounds=bounds;this.reset();}
 reset(){const b=this.bounds;this.x=b[0];this.z=b[1];this.w=b[2]-b[0];this.h=b[3]-b[1];}
 zoom(factor,anchor={x:this.x+this.w/2,z:this.z+this.h/2}){
  const u=(anchor.x-this.x)/this.w,v=(anchor.z-this.z)/this.h;
  const w=Math.max(500,Math.min(this.bounds[2]-this.bounds[0],this.w/factor)),ratio=w/this.w;
  this.w=w;this.h*=ratio;this.x=anchor.x-u*this.w;this.z=anchor.z-v*this.h;this.constrain();
 }
 pan(dx,dz){this.x+=dx;this.z+=dz;this.constrain();}
 centerOn(p,width=5000){this.w=width;this.h=width*(this.bounds[3]-this.bounds[1])/(this.bounds[2]-this.bounds[0]);this.x=p.x-this.w/2;this.z=p.z-this.h/2;this.constrain();}
 constrain(){const b=this.bounds;this.x=Math.max(b[0],Math.min(b[2]-this.w,this.x));this.z=Math.max(b[1],Math.min(b[3]-this.h,this.z));}
 get box(){return [this.x,this.z,this.w,this.h].join(' ');}
}
