class Cone{
    constructor(){
      this.type = 'cone';
      // this.position = [0.0,0.0,0.0];
      this.color = [1.0,1.0,1.0,1.0];
      // this.size = 5.0;
      // this.segments = 10;
      this.matrix = new Matrix4();
    }
  
    render(){
      // var xy = this.position;
      var rgba = this.color;
      // var size = this.size;


      // Pass the color of a point to u_FragColor variable
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      // Paass the matrix to u_ModelMaatrix attribute
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

      // cone
      let angleStep=360/15;
      for(var angle = 0; angle < 360; angle = angle+angleStep){
          let centerPt = [0, 1];
          let angle1 = angle;
          let angle2 = angle+angleStep;
          let vec1=[Math.cos(angle1*Math.PI/180), Math.sin(angle1*Math.PI/180)];
          let vec2=[Math.cos(angle2*Math.PI/180), Math.sin(angle2*Math.PI/180)];
          let pt1 = [centerPt[0]+vec1[0], centerPt[1]+vec1[1]];
          let pt2 = [centerPt[0]+vec2[0], centerPt[1]+vec2[1]];
          drawTriangle3D([0,1,1, pt1[0],pt1[1],0, pt2[0],pt2[1],0]);
          drawTriangle3D([0,1,1, pt1[0],pt1[1],0, pt2[0],pt2[1],0]);
      }
    }
}