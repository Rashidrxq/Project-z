// Both backends return premultiplied color and use the same normalized camera.
async function shaderSource(name) {
  const response = await fetch(new URL(name, import.meta.url));
  if (!response.ok) throw Error('Shader unavailable');
  return response.text();
}

export async function createWebGPU(canvas, image, lost) {
  const adapter = await navigator.gpu?.requestAdapter({powerPreference:'low-power'});
  if (!adapter) throw Error('No WebGPU adapter');
  const device = await adapter.requestDevice();
  let disposed = false;
  try {
    const ctx = canvas.getContext('webgpu');
    if (!ctx) throw Error('No WebGPU canvas');
    const format = navigator.gpu.getPreferredCanvasFormat();
    ctx.configure({device,format,alphaMode:'premultiplied'});
    const module = device.createShaderModule({code:await shaderSource('orbit.wgsl')});
    const pipeline = await device.createRenderPipelineAsync({layout:'auto',vertex:{module,entryPoint:'vs'},fragment:{module,entryPoint:'fs',targets:[{format}]},primitive:{topology:'triangle-list'}});
    const texture = device.createTexture({size:[image.width,image.height],format:'rgba8unorm',usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST|GPUTextureUsage.RENDER_ATTACHMENT});
    device.queue.copyExternalImageToTexture({source:image},{texture},[image.width,image.height]);
    const buffer = device.createBuffer({size:32,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});
    const group = device.createBindGroup({layout:pipeline.getBindGroupLayout(0),entries:[
      {binding:0,resource:{buffer}},{binding:1,resource:texture.createView()},{binding:2,resource:device.createSampler({magFilter:'linear',minFilter:'linear'})}
    ]});
    device.lost.then(()=>{if (!disposed) lost()});
    return {name:'WebGPU',draw(values){
      device.queue.writeBuffer(buffer,0,values);
      const enc=device.createCommandEncoder();
      const pass=enc.beginRenderPass({colorAttachments:[{view:ctx.getCurrentTexture().createView(),clearValue:{r:0,g:0,b:0,a:0},loadOp:'clear',storeOp:'store'}]});
      pass.setPipeline(pipeline);pass.setBindGroup(0,group);pass.draw(3);pass.end();device.queue.submit([enc.finish()]);
    },release(){disposed=true;ctx.unconfigure();device.destroy()}};
  } catch(error){disposed=true;device.destroy();throw error}
}

export async function createWebGL(canvas, image, lost) {
  const gl=canvas.getContext('webgl2',{alpha:true,antialias:false,premultipliedAlpha:true,depth:false,powerPreference:'low-power'});
  if (!gl) throw Error('No WebGL2 context');
  let disposed=false;
  const release=()=>{disposed=true;gl.getExtension('WEBGL_lose_context')?.loseContext()};
  try {
    const compile=(type,source)=>{
      const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);
      if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(shader));
      return shader;
    };
    const program=gl.createProgram();
    const vert='#version 300 es\nvoid main(){vec2 t=vec2((gl_VertexID<<1)&2,gl_VertexID&2);gl_Position=vec4(t*2.-1.,0.,1.);}';
    gl.attachShader(program,compile(gl.VERTEX_SHADER,vert));
    gl.attachShader(program,compile(gl.FRAGMENT_SHADER,await shaderSource('orbit.glsl')));
    gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS)) throw Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
    for(const param of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,param,gl.LINEAR);
    for(const param of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,param,gl.CLAMP_TO_EDGE);
    const frame=gl.getUniformLocation(program,'frame'),flight=gl.getUniformLocation(program,'flight');
    canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();if(!disposed)lost()});
    return {name:'WebGL2',draw(values){gl.viewport(0,0,canvas.width,canvas.height);gl.uniform4fv(frame,values.subarray(0,4));gl.uniform4fv(flight,values.subarray(4));gl.drawArrays(gl.TRIANGLES,0,3)},release};
  }catch(error){release();throw error}
}
