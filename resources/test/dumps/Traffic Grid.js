var AgentModel = tortoise_require('agentmodel');
var ColorModel = tortoise_require('engine/core/colormodel');
var Exception = tortoise_require('util/exception');
var Link = tortoise_require('engine/core/link');
var LinkSet = tortoise_require('engine/core/linkset');
var Meta = tortoise_require('meta');
var NLMath = tortoise_require('util/nlmath');
var NLType = tortoise_require('engine/core/typechecker');
var PatchSet = tortoise_require('engine/core/patchset');
var PenBundle = tortoise_require('engine/plot/pen');
var Plot = tortoise_require('engine/plot/plot');
var PlotOps = tortoise_require('engine/plot/plotops');
var Random = tortoise_require('shim/random');
var StrictMath = tortoise_require('shim/strictmath');
var Tasks = tortoise_require('engine/prim/tasks');
var Turtle = tortoise_require('engine/core/turtle');
var TurtleSet = tortoise_require('engine/core/turtleset');
var notImplemented = tortoise_require('util/notimplemented');
var { DeathInterrupt, StopInterrupt } = tortoise_require('util/interrupts');

var linkShapes = {"default":{"name":"default","direction-indicator":{"name":"link direction","editableColorIndex":0,"rotate":true,"elements":[{"x1":150,"y1":150,"x2":90,"y2":180,"type":"line","color":"rgba(141, 141, 141, 1)","filled":false,"marked":true},{"x1":150,"y1":150,"x2":210,"y2":180,"type":"line","color":"rgba(141, 141, 141, 1)","filled":false,"marked":true}]},"curviness":0,"lines":[{"x-offset":-0.2,"is-visible":false,"dash-pattern":[0,1]},{"x-offset":0,"is-visible":true,"dash-pattern":[1,0]},{"x-offset":0.2,"is-visible":false,"dash-pattern":[0,1]}]}};
var turtleShapes = {"default":{"name":"default","editableColorIndex":0,"rotate":true,"elements":[{"xcors":[150,40,150,260],"ycors":[5,250,205,250],"type":"polygon","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true}]},"airplane":{"name":"airplane","editableColorIndex":0,"rotate":true,"elements":[{"xcors":[150,135,120,120,15,15,120,135,105,120,150,180,210,165,180,285,285,180,180,165],"ycors":[0,15,60,105,165,195,180,240,270,285,270,285,270,240,180,195,165,105,60,15],"type":"polygon","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true}]},"arrow":{"name":"arrow","editableColorIndex":0,"rotate":true,"elements":[{"xcors":[150,0,105,105,195,195,300],"ycors":[0,150,150,293,293,150,150],"type":"polygon","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true}]},"box":{"name":"box","editableColorIndex":0,"rotate":false,"elements":[{"xcors":[150,285,285,150],"ycors":[285,225,75,135],"type":"polygon","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"xcors":[150,15,150,285],"ycors":[135,75,15,75],"type":"polygon","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"xcors":[15,15,150,150],"ycors":[75,225,285,135],"type":"polygon","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"x1":150,"y1":285,"x2":150,"y2":135,"type":"line","color":"rgba(0, 0, 0, 1)","filled":false,"marked":false},{"x1":150,"y1":135,"x2":15,"y2":75,"type":"line","color":"rgba(0, 0, 0, 1)","filled":false,"marked":false},{"x1":150,"y1":135,"x2":285,"y2":75,"type":"line","color":"rgba(0, 0, 0, 1)","filled":false,"marked":false}]},"bug":{"name":"bug","editableColorIndex":0,"rotate":true,"elements":[{"x":96,"y":182,"diam":108,"type":"circle","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"x":110,"y":127,"diam":80,"type":"circle","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"x":110,"y":75,"diam":80,"type":"circle","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"x1":150,"y1":100,"x2":80,"y2":30,"type":"line","color":"rgba(141, 141, 141, 1)","filled":false,"marked":true},{"x1":150,"y1":100,"x2":220,"y2":30,"type":"line","color":"rgba(141, 141, 141, 1)","filled":false,"marked":true}]},"butterfly":{"name":"butterfly","editableColorIndex":0,"rotate":true,"elements":[{"xcors":[150,209,225,225,195,165,150],"ycors":[165,199,225,255,270,255,240],"type":"polygon","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"xcors":[150,89,75,75,105,135,150],"ycors":[165,198,225,255,270,255,240],"type":"polygon","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"xcors":[139,100,55,25,10,10,25,40,85,139],"ycors":[148,105,90,90,105,135,180,195,194,163],"type":"polygon","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"xcors":[162,200,245,275,290,290,275,260,215,162],"ycors":[150,105,90,90,105,135,180,195,195,165],"type":"polygon","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"xcors":[150,135,120,135,150,165,180,165],"ycors":[255,225,150,120,105,120,150,225],"type":"polygon","color":"rgba(0, 0, 0, 1)","filled":true,"marked":false},{"x":135,"y":90,"diam":30,"type":"circle","color":"rgba(0, 0, 0, 1)","filled":true,"marked":false},{"x1":150,"y1":105,"x2":195,"y2":60,"type":"line","color":"rgba(0, 0, 0, 1)","filled":false,"marked":false},{"x1":150,"y1":105,"x2":105,"y2":60,"type":"line","color":"rgba(0, 0, 0, 1)","filled":false,"marked":false}]},"car":{"name":"car","editableColorIndex":0,"rotate":true,"elements":[{"xcors":[180,164,144,135,132,106,84,63,50,50,60,150,165,225,225,180],"ycors":[15,21,39,60,74,87,97,115,141,165,225,285,285,285,15,15],"type":"polygon","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"x":180,"y":30,"diam":90,"type":"circle","color":"rgba(0, 0, 0, 1)","filled":true,"marked":false},{"x":180,"y":180,"diam":90,"type":"circle","color":"rgba(0, 0, 0, 1)","filled":true,"marked":false},{"xcors":[80,78,135,135,105,96,89],"ycors":[138,168,166,91,106,111,120],"type":"polygon","color":"rgba(0, 0, 0, 1)","filled":true,"marked":false},{"x":195,"y":195,"diam":58,"type":"circle","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"x":195,"y":47,"diam":58,"type":"circle","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true}]},"circle":{"name":"circle","editableColorIndex":0,"rotate":false,"elements":[{"x":0,"y":0,"diam":300,"type":"circle","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true}]},"circle 2":{"name":"circle 2","editableColorIndex":0,"rotate":false,"elements":[{"x":0,"y":0,"diam":300,"type":"circle","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"x":30,"y":30,"diam":240,"type":"circle","color":"rgba(0, 0, 0, 1)","filled":true,"marked":false}]},"cow":{"name":"cow","editableColorIndex":0,"rotate":false,"elements":[{"xcors":[200,197,179,177,166,140,93,78,72,49,48,37,25,25,45,103,179,198,252,272,293,285,255,242,224],"ycors":[193,249,249,196,187,189,191,179,211,209,181,149,120,89,72,84,75,76,64,81,103,121,121,118,167],"type":"polygon","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"xcors":[73,86,62,48],"ycors":[210,251,249,208],"type":"polygon","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"xcors":[25,16,9,23,25,39],"ycors":[114,195,204,213,200,123],"type":"polygon","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true}]},"cylinder":{"name":"cylinder","editableColorIndex":0,"rotate":false,"elements":[{"x":0,"y":0,"diam":300,"type":"circle","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true}]},"dot":{"name":"dot","editableColorIndex":0,"rotate":false,"elements":[{"x":90,"y":90,"diam":120,"type":"circle","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true}]},"face happy":{"name":"face happy","editableColorIndex":0,"rotate":false,"elements":[{"x":8,"y":8,"diam":285,"type":"circle","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"x":60,"y":75,"diam":60,"type":"circle","color":"rgba(0, 0, 0, 1)","filled":true,"marked":false},{"x":180,"y":75,"diam":60,"type":"circle","color":"rgba(0, 0, 0, 1)","filled":true,"marked":false},{"xcors":[150,90,62,47,67,90,109,150,192,210,227,251,236,212],"ycors":[255,239,213,191,179,203,218,225,218,203,181,194,217,240],"type":"polygon","color":"rgba(0, 0, 0, 1)","filled":true,"marked":false}]},"face neutral":{"name":"face neutral","editableColorIndex":0,"rotate":false,"elements":[{"x":8,"y":7,"diam":285,"type":"circle","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"x":60,"y":75,"diam":60,"type":"circle","color":"rgba(0, 0, 0, 1)","filled":true,"marked":false},{"x":180,"y":75,"diam":60,"type":"circle","color":"rgba(0, 0, 0, 1)","filled":true,"marked":false},{"xmin":60,"ymin":195,"xmax":240,"ymax":225,"type":"rectangle","color":"rgba(0, 0, 0, 1)","filled":true,"marked":false}]},"face sad":{"name":"face sad","editableColorIndex":0,"rotate":false,"elements":[{"x":8,"y":8,"diam":285,"type":"circle","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"x":60,"y":75,"diam":60,"type":"circle","color":"rgba(0, 0, 0, 1)","filled":true,"marked":false},{"x":180,"y":75,"diam":60,"type":"circle","color":"rgba(0, 0, 0, 1)","filled":true,"marked":false},{"xcors":[150,90,62,47,67,90,109,150,192,210,227,251,236,212],"ycors":[168,184,210,232,244,220,205,198,205,220,242,229,206,183],"type":"polygon","color":"rgba(0, 0, 0, 1)","filled":true,"marked":false}]},"fish":{"name":"fish","editableColorIndex":0,"rotate":false,"elements":[{"xcors":[44,21,15,0,15,0,13,20,45],"ycors":[131,87,86,120,150,180,214,212,166],"type":"polygon","color":"rgba(255, 255, 255, 1)","filled":true,"marked":false},{"xcors":[135,119,95,76,46,60],"ycors":[195,235,218,210,204,165],"type":"polygon","color":"rgba(255, 255, 255, 1)","filled":true,"marked":false},{"xcors":[75,83,71,86,166,135],"ycors":[45,77,103,114,78,60],"type":"polygon","color":"rgba(255, 255, 255, 1)","filled":true,"marked":false},{"xcors":[30,151,226,280,292,292,287,270,195,151,30],"ycors":[136,77,81,119,146,160,170,195,210,212,166],"type":"polygon","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"x":215,"y":106,"diam":30,"type":"circle","color":"rgba(0, 0, 0, 1)","filled":true,"marked":false}]},"flag":{"name":"flag","editableColorIndex":0,"rotate":false,"elements":[{"xmin":60,"ymin":15,"xmax":75,"ymax":300,"type":"rectangle","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"xcors":[90,270,90],"ycors":[150,90,30],"type":"polygon","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"x1":75,"y1":135,"x2":90,"y2":135,"type":"line","color":"rgba(141, 141, 141, 1)","filled":false,"marked":true},{"x1":75,"y1":45,"x2":90,"y2":45,"type":"line","color":"rgba(141, 141, 141, 1)","filled":false,"marked":true}]},"flower":{"name":"flower","editableColorIndex":0,"rotate":false,"elements":[{"xcors":[135,165,180,180,150,165,195,195,165],"ycors":[120,165,210,240,300,300,240,195,135],"type":"polygon","color":"rgba(89, 176, 60, 1)","filled":true,"marked":false},{"x":85,"y":132,"diam":38,"type":"circle","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"x":130,"y":147,"diam":38,"type":"circle","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"x":192,"y":85,"diam":38,"type":"circle","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"x":85,"y":40,"diam":38,"type":"circle","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"x":177,"y":40,"diam":38,"type":"circle","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"x":177,"y":132,"diam":38,"type":"circle","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"x":70,"y":85,"diam":38,"type":"circle","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"x":130,"y":25,"diam":38,"type":"circle","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"x":96,"y":51,"diam":108,"type":"circle","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"x":113,"y":68,"diam":74,"type":"circle","color":"rgba(0, 0, 0, 1)","filled":true,"marked":false},{"xcors":[189,219,249,279,234],"ycors":[233,188,173,188,218],"type":"polygon","color":"rgba(89, 176, 60, 1)","filled":true,"marked":false},{"xcors":[180,150,105,75,135],"ycors":[255,210,210,240,240],"type":"polygon","color":"rgba(89, 176, 60, 1)","filled":true,"marked":false}]},"house":{"name":"house","editableColorIndex":0,"rotate":false,"elements":[{"xmin":45,"ymin":120,"xmax":255,"ymax":285,"type":"rectangle","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"xmin":120,"ymin":210,"xmax":180,"ymax":285,"type":"rectangle","color":"rgba(0, 0, 0, 1)","filled":true,"marked":false},{"xcors":[15,150,285],"ycors":[120,15,120],"type":"polygon","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"x1":30,"y1":120,"x2":270,"y2":120,"type":"line","color":"rgba(0, 0, 0, 1)","filled":false,"marked":false}]},"leaf":{"name":"leaf","editableColorIndex":0,"rotate":false,"elements":[{"xcors":[150,135,120,60,30,60,60,15,30,15,40,45,60,90,105,120,105,120,135,150,165,180,195,180,195,210,240,255,263,285,270,285,240,240,270,240,180,165],"ycors":[210,195,210,210,195,180,165,135,120,105,104,90,90,105,120,120,60,60,30,15,30,60,60,120,120,105,90,90,104,105,120,135,165,180,195,210,210,195],"type":"polygon","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"xcors":[135,135,120,105,105,135,165,165],"ycors":[195,240,255,255,285,285,240,195],"type":"polygon","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true}]},"line":{"name":"line","editableColorIndex":0,"rotate":true,"elements":[{"x1":150,"y1":0,"x2":150,"y2":300,"type":"line","color":"rgba(141, 141, 141, 1)","filled":false,"marked":true}]},"line half":{"name":"line half","editableColorIndex":0,"rotate":true,"elements":[{"x1":150,"y1":0,"x2":150,"y2":150,"type":"line","color":"rgba(141, 141, 141, 1)","filled":false,"marked":true}]},"pentagon":{"name":"pentagon","editableColorIndex":0,"rotate":false,"elements":[{"xcors":[150,15,60,240,285],"ycors":[15,120,285,285,120],"type":"polygon","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true}]},"person":{"name":"person","editableColorIndex":0,"rotate":false,"elements":[{"x":110,"y":5,"diam":80,"type":"circle","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"xcors":[105,120,90,105,135,150,165,195,210,180,195],"ycors":[90,195,285,300,300,225,300,300,285,195,90],"type":"polygon","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"xmin":127,"ymin":79,"xmax":172,"ymax":94,"type":"rectangle","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"xcors":[195,240,225,165],"ycors":[90,150,180,105],"type":"polygon","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"xcors":[105,60,75,135],"ycors":[90,150,180,105],"type":"polygon","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true}]},"plant":{"name":"plant","editableColorIndex":0,"rotate":false,"elements":[{"xmin":135,"ymin":90,"xmax":165,"ymax":300,"type":"rectangle","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"xcors":[135,90,45,75,135],"ycors":[255,210,195,255,285],"type":"polygon","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"xcors":[165,210,255,225,165],"ycors":[255,210,195,255,285],"type":"polygon","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"xcors":[135,90,45,75,135],"ycors":[180,135,120,180,210],"type":"polygon","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"xcors":[165,165,225,255,210],"ycors":[180,210,180,120,135],"type":"polygon","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"xcors":[135,90,45,75,135],"ycors":[105,60,45,105,135],"type":"polygon","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"xcors":[165,165,225,255,210],"ycors":[105,135,105,45,60],"type":"polygon","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"xcors":[135,120,150,180,165],"ycors":[90,45,15,45,90],"type":"polygon","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true}]},"square":{"name":"square","editableColorIndex":0,"rotate":false,"elements":[{"xmin":30,"ymin":30,"xmax":270,"ymax":270,"type":"rectangle","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true}]},"square 2":{"name":"square 2","editableColorIndex":0,"rotate":false,"elements":[{"xmin":30,"ymin":30,"xmax":270,"ymax":270,"type":"rectangle","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"xmin":60,"ymin":60,"xmax":240,"ymax":240,"type":"rectangle","color":"rgba(0, 0, 0, 1)","filled":true,"marked":false}]},"star":{"name":"star","editableColorIndex":0,"rotate":false,"elements":[{"xcors":[151,185,298,207,242,151,59,94,3,116],"ycors":[1,108,108,175,282,216,282,175,108,108],"type":"polygon","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true}]},"target":{"name":"target","editableColorIndex":0,"rotate":false,"elements":[{"x":0,"y":0,"diam":300,"type":"circle","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"x":30,"y":30,"diam":240,"type":"circle","color":"rgba(0, 0, 0, 1)","filled":true,"marked":false},{"x":60,"y":60,"diam":180,"type":"circle","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"x":90,"y":90,"diam":120,"type":"circle","color":"rgba(0, 0, 0, 1)","filled":true,"marked":false},{"x":120,"y":120,"diam":60,"type":"circle","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true}]},"tree":{"name":"tree","editableColorIndex":0,"rotate":false,"elements":[{"x":118,"y":3,"diam":94,"type":"circle","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"xmin":120,"ymin":195,"xmax":180,"ymax":300,"type":"rectangle","color":"rgba(157, 110, 72, 1)","filled":true,"marked":false},{"x":65,"y":21,"diam":108,"type":"circle","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"x":116,"y":41,"diam":127,"type":"circle","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"x":45,"y":90,"diam":120,"type":"circle","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"x":104,"y":74,"diam":152,"type":"circle","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true}]},"triangle":{"name":"triangle","editableColorIndex":0,"rotate":false,"elements":[{"xcors":[150,15,285],"ycors":[30,255,255],"type":"polygon","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true}]},"triangle 2":{"name":"triangle 2","editableColorIndex":0,"rotate":false,"elements":[{"xcors":[150,15,285],"ycors":[30,255,255],"type":"polygon","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"xcors":[151,225,75],"ycors":[99,223,224],"type":"polygon","color":"rgba(0, 0, 0, 1)","filled":true,"marked":false}]},"truck":{"name":"truck","editableColorIndex":0,"rotate":false,"elements":[{"xmin":4,"ymin":45,"xmax":195,"ymax":187,"type":"rectangle","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"xcors":[296,296,259,244,208,207],"ycors":[193,150,134,104,104,194],"type":"polygon","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"xmin":195,"ymin":60,"xmax":195,"ymax":105,"type":"rectangle","color":"rgba(255, 255, 255, 1)","filled":true,"marked":false},{"xcors":[238,252,219,218],"ycors":[112,141,141,112],"type":"polygon","color":"rgba(0, 0, 0, 1)","filled":true,"marked":false},{"x":234,"y":174,"diam":42,"type":"circle","color":"rgba(0, 0, 0, 1)","filled":true,"marked":false},{"xmin":181,"ymin":185,"xmax":214,"ymax":194,"type":"rectangle","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"x":144,"y":174,"diam":42,"type":"circle","color":"rgba(0, 0, 0, 1)","filled":true,"marked":false},{"x":24,"y":174,"diam":42,"type":"circle","color":"rgba(0, 0, 0, 1)","filled":true,"marked":false},{"x":24,"y":174,"diam":42,"type":"circle","color":"rgba(141, 141, 141, 1)","filled":false,"marked":true},{"x":144,"y":174,"diam":42,"type":"circle","color":"rgba(141, 141, 141, 1)","filled":false,"marked":true},{"x":234,"y":174,"diam":42,"type":"circle","color":"rgba(141, 141, 141, 1)","filled":false,"marked":true}]},"turtle":{"name":"turtle","editableColorIndex":0,"rotate":true,"elements":[{"xcors":[215,240,246,228,215,193],"ycors":[204,233,254,266,252,210],"type":"polygon","color":"rgba(89, 176, 60, 1)","filled":true,"marked":false},{"xcors":[195,225,245,260,269,261,240,225,210],"ycors":[90,75,75,89,108,124,105,105,105],"type":"polygon","color":"rgba(89, 176, 60, 1)","filled":true,"marked":false},{"xcors":[105,75,55,40,31,39,60,75,90],"ycors":[90,75,75,89,108,124,105,105,105],"type":"polygon","color":"rgba(89, 176, 60, 1)","filled":true,"marked":false},{"xcors":[132,134,107,108,150,192,192,169,172],"ycors":[85,64,51,17,2,18,52,65,87],"type":"polygon","color":"rgba(89, 176, 60, 1)","filled":true,"marked":false},{"xcors":[85,60,54,72,85,107],"ycors":[204,233,254,266,252,210],"type":"polygon","color":"rgba(89, 176, 60, 1)","filled":true,"marked":false},{"xcors":[119,179,209,224,220,175,128,81,74,88],"ycors":[75,75,101,135,225,261,261,224,135,99],"type":"polygon","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true}]},"wheel":{"name":"wheel","editableColorIndex":0,"rotate":false,"elements":[{"x":3,"y":3,"diam":294,"type":"circle","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"x":30,"y":30,"diam":240,"type":"circle","color":"rgba(0, 0, 0, 1)","filled":true,"marked":false},{"x1":150,"y1":285,"x2":150,"y2":15,"type":"line","color":"rgba(141, 141, 141, 1)","filled":false,"marked":true},{"x1":15,"y1":150,"x2":285,"y2":150,"type":"line","color":"rgba(141, 141, 141, 1)","filled":false,"marked":true},{"x":120,"y":120,"diam":60,"type":"circle","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"x1":216,"y1":40,"x2":79,"y2":269,"type":"line","color":"rgba(141, 141, 141, 1)","filled":false,"marked":true},{"x1":40,"y1":84,"x2":269,"y2":221,"type":"line","color":"rgba(141, 141, 141, 1)","filled":false,"marked":true},{"x1":40,"y1":216,"x2":269,"y2":79,"type":"line","color":"rgba(141, 141, 141, 1)","filled":false,"marked":true},{"x1":84,"y1":40,"x2":221,"y2":269,"type":"line","color":"rgba(141, 141, 141, 1)","filled":false,"marked":true}]},"x":{"name":"x","editableColorIndex":0,"rotate":false,"elements":[{"xcors":[270,225,30,75],"ycors":[75,30,225,270],"type":"polygon","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true},{"xcors":[30,75,270,225],"ycors":[75,30,225,270],"type":"polygon","color":"rgba(141, 141, 141, 1)","filled":true,"marked":true}]}};
var modelConfig =
  (
    (typeof global !== "undefined" && global !== null) ? global :
    (typeof window !== "undefined" && window !== null) ? window :
    {}
  ).modelConfig || {};
var modelPlotOps = (typeof modelConfig.plotOps !== "undefined" && modelConfig.plotOps !== null) ? modelConfig.plotOps : {};
modelConfig.plots = [(function() {
  var name    = 'Average Wait Time of Cars';
  var plotOps = (typeof modelPlotOps[name] !== "undefined" && modelPlotOps[name] !== null) ? modelPlotOps[name] : new PlotOps(function() {}, function() {}, function() {}, function() { return function() {}; }, function() { return function() {}; }, function() { return function() {}; }, function() { return function() {}; });
  var pens    = [new PenBundle.Pen('default', plotOps.makePenOps, false, new PenBundle.State(0, 1, PenBundle.DisplayMode.Line), function() {}, function() {
    return ProcedurePrims.runInPlotContext('Average Wait Time of Cars', 'default', function() {
      plotManager.plotValue(PrimChecks.list.mean(PrimChecks.validator.checkArg('MEAN', 8, PrimChecks.agentset.of(world.turtles(), function() { return PrimChecks.turtle.getVariable("wait-time"); }))));;
    });
  })];
  var setup   = function() {};
  var update  = function() {};
  return new Plot(name, pens, plotOps, "Time", "Average Wait", false, true, 0, 100, 0, 5, setup, update);
})(), (function() {
  var name    = 'Average Speed of Cars';
  var plotOps = (typeof modelPlotOps[name] !== "undefined" && modelPlotOps[name] !== null) ? modelPlotOps[name] : new PlotOps(function() {}, function() {}, function() {}, function() { return function() {}; }, function() { return function() {}; }, function() { return function() {}; }, function() { return function() {}; });
  var pens    = [new PenBundle.Pen('default', plotOps.makePenOps, false, new PenBundle.State(0, 1, PenBundle.DisplayMode.Line), function() {}, function() {
    return ProcedurePrims.runInPlotContext('Average Speed of Cars', 'default', function() {
      plotManager.plotValue(PrimChecks.list.mean(PrimChecks.validator.checkArg('MEAN', 8, PrimChecks.agentset.of(world.turtles(), function() { return PrimChecks.turtle.getVariable("speed"); }))));;
    });
  })];
  var setup   = function() {
    return ProcedurePrims.runInPlotContext('Average Speed of Cars', undefined, function() { plotManager.setYRange(0, world.observer.getGlobal("speed-limit"));; });
  };
  var update  = function() {};
  return new Plot(name, pens, plotOps, "Time", "Average Speed", false, true, 0, 100, 0, 1, setup, update);
})(), (function() {
  var name    = 'Stopped Cars';
  var plotOps = (typeof modelPlotOps[name] !== "undefined" && modelPlotOps[name] !== null) ? modelPlotOps[name] : new PlotOps(function() {}, function() {}, function() {}, function() { return function() {}; }, function() { return function() {}; }, function() { return function() {}; }, function() { return function() {}; });
  var pens    = [new PenBundle.Pen('default', plotOps.makePenOps, false, new PenBundle.State(0, 1, PenBundle.DisplayMode.Line), function() {}, function() {
    return ProcedurePrims.runInPlotContext('Stopped Cars', 'default', function() { plotManager.plotValue(world.observer.getGlobal("num-cars-stopped"));; });
  })];
  var setup   = function() {
    return ProcedurePrims.runInPlotContext('Stopped Cars', undefined, function() { plotManager.setYRange(0, world.observer.getGlobal("num-cars"));; });
  };
  var update  = function() {};
  return new Plot(name, pens, plotOps, "Time", "Stopped Cars", false, true, 0, 100, 0, 100, setup, update);
})()];
var workspace = tortoise_require('engine/workspace')(modelConfig)([])(["speed", "up-car?", "wait-time"], [])('globals [   grid-x-inc               ;; the amount of patches in between two roads in the x direction   grid-y-inc               ;; the amount of patches in between two roads in the y direction   acceleration             ;; the constant that controls how much a car speeds up or slows down by if                            ;; it is to accelerate or decelerate   phase                    ;; keeps track of the phase   num-cars-stopped         ;; the number of cars that are stopped during a single pass thru the go procedure   current-light            ;; the currently selected light    ;; patch agentsets   intersections ;; agentset containing the patches that are intersections   roads         ;; agentset containing the patches that are roads ]  turtles-own [   speed     ;; the speed of the turtle   up-car?   ;; true if the turtle moves downwards and false if it moves to the right   wait-time ;; the amount of time since the last time a turtle has moved ]  patches-own [   intersection?   ;; true if the patch is at the intersection of two roads   green-light-up? ;; true if the green light is above the intersection.  otherwise, false.                   ;; false for a non-intersection patches.   my-row          ;; the row of the intersection counting from the upper left corner of the                   ;; world.  -1 for non-intersection patches.   my-column       ;; the column of the intersection counting from the upper left corner of the                   ;; world.  -1 for non-intersection patches.   my-phase        ;; the phase for the intersection.  -1 for non-intersection patches.   auto?           ;; whether or not this intersection will switch automatically.                   ;; false for non-intersection patches. ]   ;;;;;;;;;;;;;;;;;;;;;; ;; Setup Procedures ;; ;;;;;;;;;;;;;;;;;;;;;;  ;; Initialize the display by giving the global and patch variables initial values. ;; Create num-cars of turtles if there are enough road patches for one turtle to ;; be created per road patch. Set up the plots. to setup   clear-all   setup-globals    ;; First we ask the patches to draw themselves and set up a few variables   setup-patches   make-current one-of intersections   label-current    set-default-shape turtles \"car\"    if (num-cars > count roads)   [     user-message (word \"There are too many cars for the amount of \"                        \"road.  Either increase the amount of roads \"                        \"by increasing the GRID-SIZE-X or \"                        \"GRID-SIZE-Y sliders, or decrease the \"                        \"number of cars by lowering the NUMBER slider.\ \"                        \"The setup has stopped.\")     stop   ]    ;; Now create the turtles and have each created turtle call the functions setup-cars and set-car-color   create-turtles num-cars   [     setup-cars     set-car-color     record-data   ]    ;; give the turtles an initial speed   ask turtles [ set-car-speed ]    reset-ticks end  ;; Initialize the global variables to appropriate values to setup-globals   set current-light nobody ;; just for now, since there are no lights yet   set phase 0   set num-cars-stopped 0   set grid-x-inc world-width / grid-size-x   set grid-y-inc world-height / grid-size-y    ;; don\'t make acceleration 0.1 since we could get a rounding error and end up on a patch boundary   set acceleration 0.099 end  ;; Make the patches have appropriate colors, set up the roads and intersections agentsets, ;; and initialize the traffic lights to one setting to setup-patches   ;; initialize the patch-owned variables and color the patches to a base-color   ask patches   [     set intersection? false     set auto? false     set green-light-up? true     set my-row -1     set my-column -1     set my-phase -1     set pcolor brown + 3   ]    ;; initialize the global variables that hold patch agentsets   set roads patches with     [(floor((pxcor + max-pxcor - floor(grid-x-inc - 1)) mod grid-x-inc) = 0) or     (floor((pycor + max-pycor) mod grid-y-inc) = 0)]   set intersections roads with     [(floor((pxcor + max-pxcor - floor(grid-x-inc - 1)) mod grid-x-inc) = 0) and     (floor((pycor + max-pycor) mod grid-y-inc) = 0)]    ask roads [ set pcolor white ]   setup-intersections end  ;; Give the intersections appropriate values for the intersection?, my-row, and my-column ;; patch variables.  Make all the traffic lights start off so that the lights are red ;; horizontally and green vertically. to setup-intersections   ask intersections   [     set intersection? true     set green-light-up? true     set my-phase 0     set auto? true     set my-row floor((pycor + max-pycor) / grid-y-inc)     set my-column floor((pxcor + max-pxcor) / grid-x-inc)     set-signal-colors   ] end  ;; Initialize the turtle variables to appropriate values and place the turtle on an empty road patch. to setup-cars  ;; turtle procedure   set speed 0   set wait-time 0   put-on-empty-road   ifelse intersection?   [     ifelse random 2 = 0     [ set up-car? true ]     [ set up-car? false ]   ]   [     ; if the turtle is on a vertical road (rather than a horizontal one)     ifelse (floor((pxcor + max-pxcor - floor(grid-x-inc - 1)) mod grid-x-inc) = 0)     [ set up-car? true ]     [ set up-car? false ]   ]   ifelse up-car?   [ set heading 180 ]   [ set heading 90 ] end  ;; Find a road patch without any turtles on it and place the turtle there. to put-on-empty-road  ;; turtle procedure   move-to one-of roads with [not any? turtles-on self] end   ;;;;;;;;;;;;;;;;;;;;;;;; ;; Runtime Procedures ;; ;;;;;;;;;;;;;;;;;;;;;;;;  ;; Run the simulation to go    update-current    ;; have the intersections change their color   set-signals   set num-cars-stopped 0    ;; set the turtles speed for this time thru the procedure, move them forward their speed,   ;; record data for plotting, and set the color of the turtles to an appropriate color   ;; based on their speed   ask turtles [     set-car-speed     fd speed     record-data     set-car-color   ]    ;; update the phase and the global clock   next-phase   tick end  to choose-current   if mouse-down?   [     let x-mouse mouse-xcor     let y-mouse mouse-ycor     if [intersection?] of patch x-mouse y-mouse     [       update-current       unlabel-current       make-current patch x-mouse y-mouse       label-current       stop     ]   ] end  ;; Set up the current light and the interface to change it. to make-current [light]   set current-light light   set current-phase [my-phase] of current-light   set current-auto? [auto?] of current-light end  ;; update the variables for the current light to update-current   ask current-light [     set my-phase current-phase     set auto? current-auto?   ] end  ;; label the current light to label-current   ask current-light   [     ask patch-at -1 1     [       set plabel-color black       set plabel \"current\"     ]   ] end  ;; unlabel the current light (because we\'ve chosen a new one) to unlabel-current   ask current-light   [     ask patch-at -1 1     [       set plabel \"\"     ]   ] end  ;; have the traffic lights change color if phase equals each intersections\' my-phase to set-signals   ask intersections with [auto? and phase = floor ((my-phase * ticks-per-cycle) / 100)]   [     set green-light-up? (not green-light-up?)     set-signal-colors   ] end  ;; This procedure checks the variable green-light-up? at each intersection and sets the ;; traffic lights to have the green light up or the green light to the left. to set-signal-colors  ;; intersection (patch) procedure   ifelse power?   [     ifelse green-light-up?     [       ask patch-at -1 0 [ set pcolor red ]       ask patch-at 0 1 [ set pcolor green ]     ]     [       ask patch-at -1 0 [ set pcolor green ]       ask patch-at 0 1 [ set pcolor red ]     ]   ]   [     ask patch-at -1 0 [ set pcolor white ]     ask patch-at 0 1 [ set pcolor white ]   ] end  ;; set the turtles\' speed based on whether they are at a red traffic light or the speed of the ;; turtle (if any) on the patch in front of them to set-car-speed  ;; turtle procedure   ifelse pcolor = red   [ set speed 0 ]   [     ifelse up-car?     [ set-speed 0 -1 ]     [ set-speed 1 0 ]   ] end  ;; set the speed variable of the car to an appropriate value (not exceeding the ;; speed limit) based on whether there are cars on the patch in front of the car to set-speed [ delta-x delta-y ]  ;; turtle procedure   ;; get the turtles on the patch in front of the turtle   let turtles-ahead turtles-at delta-x delta-y    ;; if there are turtles in front of the turtle, slow down   ;; otherwise, speed up   ifelse any? turtles-ahead   [     ifelse any? (turtles-ahead with [ up-car? != [up-car?] of myself ])     [       set speed 0     ]     [       set speed [speed] of one-of turtles-ahead       slow-down     ]   ]   [ speed-up ] end  ;; decrease the speed of the turtle to slow-down  ;; turtle procedure   ifelse speed <= 0  ;;if speed < 0   [ set speed 0 ]   [ set speed speed - acceleration ] end  ;; increase the speed of the turtle to speed-up  ;; turtle procedure   ifelse speed > speed-limit   [ set speed speed-limit ]   [ set speed speed + acceleration ] end  ;; set the color of the turtle to a different color based on how fast the turtle is moving to set-car-color  ;; turtle procedure   ifelse speed < (speed-limit / 2)   [ set color blue ]   [ set color cyan - 2 ] end  ;; keep track of the number of stopped turtles and the amount of time a turtle has been stopped ;; if its speed is 0 to record-data  ;; turtle procedure   ifelse speed = 0   [     set num-cars-stopped num-cars-stopped + 1     set wait-time wait-time + 1   ]   [ set wait-time 0 ] end  to change-current   ask current-light   [     set green-light-up? (not green-light-up?)     set-signal-colors   ] end  ;; cycles phase to the next appropriate value to next-phase   ;; The phase cycles from 0 to ticks-per-cycle, then starts over.   set phase phase + 1   if phase mod ticks-per-cycle = 0     [ set phase 0 ] end   ; Copyright 2003 Uri Wilensky. ; See Info tab for full copyright and license.')([{"left":327,"top":10,"right":668,"bottom":352,"dimensions":{"minPxcor":-18,"maxPxcor":18,"minPycor":-18,"maxPycor":18,"patchSize":9,"wrappingAllowedInX":true,"wrappingAllowedInY":true},"fontSize":12,"updateMode":"TickBased","showTickCounter":true,"tickCounterLabel":"ticks","frameRate":30,"type":"view","compilation":{"success":true,"messages":[]}}, {"compiledSetupCode":"function() {}","compiledUpdateCode":"function() {}","compiledPens":[{"compiledSetupCode":"function() {}","compiledUpdateCode":"function() {   return ProcedurePrims.runInPlotContext('Average Wait Time of Cars', 'default', function() {     plotManager.plotValue(PrimChecks.list.mean(PrimChecks.validator.checkArg('MEAN', 8, PrimChecks.agentset.of(world.turtles(), function() { return PrimChecks.turtle.getVariable(\"wait-time\"); }))));;   }); }","display":"default","interval":1,"mode":0,"color":-16777216,"inLegend":true,"setupCode":"","updateCode":"plot mean [wait-time] of turtles","type":"pen","compilation":{"success":true,"messages":[]}}],"display":"Average Wait Time of Cars","left":453,"top":377,"right":671,"bottom":541,"xAxis":"Time","yAxis":"Average Wait","xmin":0,"xmax":100,"ymin":0,"ymax":5,"autoPlotOn":true,"legendOn":false,"setupCode":"","updateCode":"","pens":[{"display":"default","interval":1,"mode":0,"color":-16777216,"inLegend":true,"setupCode":"","updateCode":"plot mean [wait-time] of turtles","type":"pen"}],"type":"plot","compilation":{"success":true,"messages":[]}}, {"compiledSetupCode":"function() {   return ProcedurePrims.runInPlotContext('Average Speed of Cars', undefined, function() { plotManager.setYRange(0, world.observer.getGlobal(\"speed-limit\"));; }); }","compiledUpdateCode":"function() {}","compiledPens":[{"compiledSetupCode":"function() {}","compiledUpdateCode":"function() {   return ProcedurePrims.runInPlotContext('Average Speed of Cars', 'default', function() {     plotManager.plotValue(PrimChecks.list.mean(PrimChecks.validator.checkArg('MEAN', 8, PrimChecks.agentset.of(world.turtles(), function() { return PrimChecks.turtle.getVariable(\"speed\"); }))));;   }); }","display":"default","interval":1,"mode":0,"color":-16777216,"inLegend":true,"setupCode":"","updateCode":"plot mean [speed] of turtles","type":"pen","compilation":{"success":true,"messages":[]}}],"display":"Average Speed of Cars","left":228,"top":377,"right":444,"bottom":542,"xAxis":"Time","yAxis":"Average Speed","xmin":0,"xmax":100,"ymin":0,"ymax":1,"autoPlotOn":true,"legendOn":false,"setupCode":"set-plot-y-range 0 speed-limit","updateCode":"","pens":[{"display":"default","interval":1,"mode":0,"color":-16777216,"inLegend":true,"setupCode":"","updateCode":"plot mean [speed] of turtles","type":"pen"}],"type":"plot","compilation":{"success":true,"messages":[]}}, {"compiledMin":"1","compiledMax":"9","compiledStep":"1","variable":"grid-size-y","left":108,"top":35,"right":205,"bottom":68,"display":"grid-size-y","min":"1","max":"9","default":5,"step":"1","direction":"horizontal","type":"slider","compilation":{"success":true,"messages":[]}}, {"compiledMin":"1","compiledMax":"9","compiledStep":"1","variable":"grid-size-x","left":12,"top":35,"right":106,"bottom":68,"display":"grid-size-x","min":"1","max":"9","default":5,"step":"1","direction":"horizontal","type":"slider","compilation":{"success":true,"messages":[]}}, {"variable":"power?","left":12,"top":107,"right":107,"bottom":140,"display":"power?","on":true,"type":"switch","compilation":{"success":true,"messages":[]}}, {"compiledMin":"1","compiledMax":"400","compiledStep":"1","variable":"num-cars","left":12,"top":71,"right":293,"bottom":104,"display":"num-cars","min":"1","max":"400","default":200,"step":"1","direction":"horizontal","type":"slider","compilation":{"success":true,"messages":[]}}, {"compiledSetupCode":"function() {   return ProcedurePrims.runInPlotContext('Stopped Cars', undefined, function() { plotManager.setYRange(0, world.observer.getGlobal(\"num-cars\"));; }); }","compiledUpdateCode":"function() {}","compiledPens":[{"compiledSetupCode":"function() {}","compiledUpdateCode":"function() {   return ProcedurePrims.runInPlotContext('Stopped Cars', 'default', function() { plotManager.plotValue(world.observer.getGlobal(\"num-cars-stopped\"));; }); }","display":"default","interval":1,"mode":0,"color":-16777216,"inLegend":true,"setupCode":"","updateCode":"plot num-cars-stopped","type":"pen","compilation":{"success":true,"messages":[]}}],"display":"Stopped Cars","left":5,"top":376,"right":219,"bottom":540,"xAxis":"Time","yAxis":"Stopped Cars","xmin":0,"xmax":100,"ymin":0,"ymax":100,"autoPlotOn":true,"legendOn":false,"setupCode":"set-plot-y-range 0 num-cars","updateCode":"","pens":[{"display":"default","interval":1,"mode":0,"color":-16777216,"inLegend":true,"setupCode":"","updateCode":"plot num-cars-stopped","type":"pen"}],"type":"plot","compilation":{"success":true,"messages":[]}}, {"compiledSource":"var R = ProcedurePrims.callCommand(\"go\"); if (R === StopInterrupt) { return R; }","source":"go","left":221,"top":184,"right":285,"bottom":217,"display":"Go","forever":true,"buttonKind":"Observer","disableUntilTicksStart":true,"type":"button","compilation":{"success":true,"messages":[]}}, {"compiledSource":"var R = ProcedurePrims.callCommand(\"setup\"); if (R === StopInterrupt) { return R; }","source":"setup","left":208,"top":35,"right":292,"bottom":68,"display":"Setup","forever":false,"buttonKind":"Observer","disableUntilTicksStart":false,"type":"button","compilation":{"success":true,"messages":[]}}, {"compiledMin":"0.1","compiledMax":"1","compiledStep":"0.1","variable":"speed-limit","left":11,"top":177,"right":165,"bottom":210,"display":"speed-limit","min":"0.1","max":"1","default":1,"step":"0.1","direction":"horizontal","type":"slider","compilation":{"success":true,"messages":[]}}, {"compiledSource":"world.observer.getGlobal(\"phase\")","source":"phase","left":205,"top":132,"right":310,"bottom":177,"display":"Current Phase","precision":3,"fontSize":11,"type":"monitor","compilation":{"success":true,"messages":[]}}, {"compiledMin":"1","compiledMax":"100","compiledStep":"1","variable":"ticks-per-cycle","left":11,"top":143,"right":165,"bottom":176,"display":"ticks-per-cycle","min":"1","max":"100","default":20,"step":"1","direction":"horizontal","type":"slider","compilation":{"success":true,"messages":[]}}, {"compiledMin":"0","compiledMax":"99","compiledStep":"1","variable":"current-phase","left":146,"top":256,"right":302,"bottom":289,"display":"current-phase","min":"0","max":"99","default":0,"step":"1","units":"%","direction":"horizontal","type":"slider","compilation":{"success":true,"messages":[]}}, {"compiledSource":"var R = ProcedurePrims.callCommand(\"change-current\"); if (R === StopInterrupt) { return R; }","source":"change-current","left":9,"top":292,"right":143,"bottom":325,"display":"Change light","forever":false,"buttonKind":"Observer","disableUntilTicksStart":true,"type":"button","compilation":{"success":true,"messages":[]}}, {"variable":"current-auto?","left":9,"top":256,"right":144,"bottom":289,"display":"current-auto?","on":true,"type":"switch","compilation":{"success":true,"messages":[]}}, {"compiledSource":"var R = ProcedurePrims.callCommand(\"choose-current\"); if (R === StopInterrupt) { return R; }","source":"choose-current","left":145,"top":292,"right":300,"bottom":325,"display":"Select intersection","forever":true,"buttonKind":"Observer","disableUntilTicksStart":true,"type":"button","compilation":{"success":true,"messages":[]}}])(tortoise_require("extensions/all").porters())(["grid-size-y", "grid-size-x", "power?", "num-cars", "speed-limit", "ticks-per-cycle", "current-phase", "current-auto?", "grid-x-inc", "grid-y-inc", "acceleration", "phase", "num-cars-stopped", "current-light", "intersections", "roads"], ["grid-size-y", "grid-size-x", "power?", "num-cars", "speed-limit", "ticks-per-cycle", "current-phase", "current-auto?"], ["intersection?", "green-light-up?", "my-row", "my-column", "my-phase", "auto?"], -18, 18, -18, 18, 9, true, true, turtleShapes, linkShapes, function(){});
var Extensions = tortoise_require('extensions/all').initialize(workspace);
var BreedManager = workspace.breedManager;
var ImportExportPrims = workspace.importExportPrims;
var InspectionPrims = workspace.inspectionPrims;
var LayoutManager = workspace.layoutManager;
var LinkPrims = workspace.linkPrims;
var ListPrims = workspace.listPrims;
var MousePrims = workspace.mousePrims;
var OutputPrims = workspace.outputPrims;
var PrimChecks = workspace.primChecks;
var Prims = workspace.prims;
var PrintPrims = workspace.printPrims;
var ProcedurePrims = workspace.procedurePrims;
var RandomPrims = workspace.randomPrims;
var SelfManager = workspace.selfManager;
var SelfPrims = workspace.selfPrims;
var StringPrims = workspace.stringPrims;
var Updater = workspace.updater;
var UserDialogPrims = workspace.userDialogPrims;
var plotManager = workspace.plotManager;
var world = workspace.world;
ProcedurePrims.defineCommand("setup", 2026, 2945, (function() {
  world.clearAll();
  var R = ProcedurePrims.callCommand("setup-globals"); if (R === DeathInterrupt) { return R; }
  var R = ProcedurePrims.callCommand("setup-patches"); if (R === DeathInterrupt) { return R; }
  var R = ProcedurePrims.callCommand("make-current", PrimChecks.list.oneOf(PrimChecks.validator.checkArg('ONE-OF', 120, world.observer.getGlobal("intersections")))); if (R === DeathInterrupt) { return R; }
  var R = ProcedurePrims.callCommand("label-current"); if (R === DeathInterrupt) { return R; }
  BreedManager.setDefaultShape(world.turtles().getSpecialName(), "car")
  if (Prims.gt(world.observer.getGlobal("num-cars"), PrimChecks.agentset.count(PrimChecks.validator.checkArg('COUNT', 112, world.observer.getGlobal("roads"))))) {
    UserDialogPrims.confirm(StringPrims.word("There are too many cars for the amount of ", "road.  Either increase the amount of roads ", "by increasing the GRID-SIZE-X or ", "GRID-SIZE-Y sliders, or decrease the ", "number of cars by lowering the NUMBER slider. ", "The setup has stopped."));
    return PrimChecks.procedure.stop();
  }
  var R = ProcedurePrims.ask(world.turtleManager.createTurtles(world.observer.getGlobal("num-cars"), ""), function() {
    var R = ProcedurePrims.callCommand("setup-cars"); if (R === DeathInterrupt) { return R; }
    var R = ProcedurePrims.callCommand("set-car-color"); if (R === DeathInterrupt) { return R; }
    var R = ProcedurePrims.callCommand("record-data"); if (R === DeathInterrupt) { return R; }
  }, true); if (R !== undefined) { PrimChecks.procedure.preReturnCheck(R); return R; }
  var R = ProcedurePrims.ask(world.turtles(), function() { var R = ProcedurePrims.callCommand("set-car-speed"); if (R === DeathInterrupt) { return R; } }, true); if (R !== undefined) { PrimChecks.procedure.preReturnCheck(R); return R; }
  world.ticker.reset();
}))
ProcedurePrims.defineCommand("setup-globals", 3010, 3350, (function() {
  world.observer.setGlobal("current-light", Nobody);
  world.observer.setGlobal("phase", 0);
  world.observer.setGlobal("num-cars-stopped", 0);
  world.observer.setGlobal("grid-x-inc", PrimChecks.math.div(world.topology.width, PrimChecks.validator.checkArg('/', 1, world.observer.getGlobal("grid-size-x"))));
  world.observer.setGlobal("grid-y-inc", PrimChecks.math.div(world.topology.height, PrimChecks.validator.checkArg('/', 1, world.observer.getGlobal("grid-size-y"))));
  world.observer.setGlobal("acceleration", 0.099);
}))
ProcedurePrims.defineCommand("setup-patches", 3501, 4221, (function() {
  var R = ProcedurePrims.ask(world.patches(), function() {
    PrimChecks.patch.setVariable("intersection?", false);
    PrimChecks.patch.setVariable("auto?", false);
    PrimChecks.patch.setVariable("green-light-up?", true);
    PrimChecks.patch.setVariable("my-row", -1);
    PrimChecks.patch.setVariable("my-column", -1);
    PrimChecks.patch.setVariable("my-phase", -1);
    PrimChecks.patch.setVariable("pcolor", PrimChecks.math.plus(35, 3));
  }, true); if (R !== undefined) { PrimChecks.procedure.preReturnCheck(R); return R; }
  world.observer.setGlobal("roads", PrimChecks.agentset.with(world.patches(), function() {
    return (Prims.equality(PrimChecks.math.floor(PrimChecks.math.mod(PrimChecks.math.minus(PrimChecks.math.plus(PrimChecks.validator.checkArg('+', 1, PrimChecks.patch.getVariable("pxcor")), world.topology.maxPxcor), PrimChecks.math.floor(PrimChecks.math.minus(PrimChecks.validator.checkArg('-', 1, world.observer.getGlobal("grid-x-inc")), 1))), PrimChecks.validator.checkArg('MOD', 1, world.observer.getGlobal("grid-x-inc")))), 0) || Prims.equality(PrimChecks.math.floor(PrimChecks.math.mod(PrimChecks.math.plus(PrimChecks.validator.checkArg('+', 1, PrimChecks.patch.getVariable("pycor")), world.topology.maxPycor), PrimChecks.validator.checkArg('MOD', 1, world.observer.getGlobal("grid-y-inc")))), 0));
  }));
  world.observer.setGlobal("intersections", PrimChecks.agentset.with(PrimChecks.validator.checkArg('WITH', 112, world.observer.getGlobal("roads")), function() {
    return (Prims.equality(PrimChecks.math.floor(PrimChecks.math.mod(PrimChecks.math.minus(PrimChecks.math.plus(PrimChecks.validator.checkArg('+', 1, PrimChecks.patch.getVariable("pxcor")), world.topology.maxPxcor), PrimChecks.math.floor(PrimChecks.math.minus(PrimChecks.validator.checkArg('-', 1, world.observer.getGlobal("grid-x-inc")), 1))), PrimChecks.validator.checkArg('MOD', 1, world.observer.getGlobal("grid-x-inc")))), 0) && Prims.equality(PrimChecks.math.floor(PrimChecks.math.mod(PrimChecks.math.plus(PrimChecks.validator.checkArg('+', 1, PrimChecks.patch.getVariable("pycor")), world.topology.maxPycor), PrimChecks.validator.checkArg('MOD', 1, world.observer.getGlobal("grid-y-inc")))), 0));
  }));
  var R = ProcedurePrims.ask(PrimChecks.validator.checkArg('ASK', 1904, world.observer.getGlobal("roads")), function() { PrimChecks.patch.setVariable("pcolor", 9.9); }, true); if (R !== undefined) { PrimChecks.procedure.preReturnCheck(R); return R; }
  var R = ProcedurePrims.callCommand("setup-intersections"); if (R === DeathInterrupt) { return R; }
}))
ProcedurePrims.defineCommand("setup-intersections", 4443, 4720, (function() {
  var R = ProcedurePrims.ask(PrimChecks.validator.checkArg('ASK', 1904, world.observer.getGlobal("intersections")), function() {
    PrimChecks.patch.setVariable("intersection?", true);
    PrimChecks.patch.setVariable("green-light-up?", true);
    PrimChecks.patch.setVariable("my-phase", 0);
    PrimChecks.patch.setVariable("auto?", true);
    PrimChecks.patch.setVariable("my-row", PrimChecks.math.floor(PrimChecks.math.div(PrimChecks.math.plus(PrimChecks.validator.checkArg('+', 1, PrimChecks.patch.getVariable("pycor")), world.topology.maxPycor), PrimChecks.validator.checkArg('/', 1, world.observer.getGlobal("grid-y-inc")))));
    PrimChecks.patch.setVariable("my-column", PrimChecks.math.floor(PrimChecks.math.div(PrimChecks.math.plus(PrimChecks.validator.checkArg('+', 1, PrimChecks.patch.getVariable("pxcor")), world.topology.maxPxcor), PrimChecks.validator.checkArg('/', 1, world.observer.getGlobal("grid-x-inc")))));
    var R = ProcedurePrims.callCommand("set-signal-colors"); if (R === DeathInterrupt) { return R; }
  }, true); if (R !== undefined) { PrimChecks.procedure.preReturnCheck(R); return R; }
}))
ProcedurePrims.defineCommand("setup-cars", 4830, 5295, (function() {
  PrimChecks.turtle.setVariable("speed", 0);
  PrimChecks.turtle.setVariable("wait-time", 0);
  var R = ProcedurePrims.callCommand("put-on-empty-road"); if (R === DeathInterrupt) { return R; }
  if (PrimChecks.patch.getVariable("intersection?")) {
    if (Prims.equality(RandomPrims.randomLong(2), 0)) {
      PrimChecks.turtle.setVariable("up-car?", true);
    }
    else {
      PrimChecks.turtle.setVariable("up-car?", false);
    }
  }
  else {
    if (Prims.equality(PrimChecks.math.floor(PrimChecks.math.mod(PrimChecks.math.minus(PrimChecks.math.plus(PrimChecks.validator.checkArg('+', 1, PrimChecks.patch.getVariable("pxcor")), world.topology.maxPxcor), PrimChecks.math.floor(PrimChecks.math.minus(PrimChecks.validator.checkArg('-', 1, world.observer.getGlobal("grid-x-inc")), 1))), PrimChecks.validator.checkArg('MOD', 1, world.observer.getGlobal("grid-x-inc")))), 0)) {
      PrimChecks.turtle.setVariable("up-car?", true);
    }
    else {
      PrimChecks.turtle.setVariable("up-car?", false);
    }
  }
  if (PrimChecks.turtle.getVariable("up-car?")) {
    PrimChecks.turtle.setVariable("heading", 180);
  }
  else {
    PrimChecks.turtle.setVariable("heading", 90);
  }
}))
ProcedurePrims.defineCommand("put-on-empty-road", 5378, 5472, (function() {
  SelfManager.self().moveTo(PrimChecks.agentset.oneOfWith(world.observer.getGlobal("roads"), function() {
    return PrimChecks.math.not(PrimChecks.agentset.any(PrimChecks.agentset.turtlesOn(SelfManager.self())));
  }));
}))
ProcedurePrims.defineCommand("go", 5579, 6043, (function() {
  var R = ProcedurePrims.callCommand("update-current"); if (R === DeathInterrupt) { return R; }
  var R = ProcedurePrims.callCommand("set-signals"); if (R === DeathInterrupt) { return R; }
  world.observer.setGlobal("num-cars-stopped", 0);
  var R = ProcedurePrims.ask(world.turtles(), function() {
    var R = ProcedurePrims.callCommand("set-car-speed"); if (R === DeathInterrupt) { return R; }
    SelfManager.self().fd(PrimChecks.turtle.getVariable("speed"));
    var R = ProcedurePrims.callCommand("record-data"); if (R === DeathInterrupt) { return R; }
    var R = ProcedurePrims.callCommand("set-car-color"); if (R === DeathInterrupt) { return R; }
  }, true); if (R !== undefined) { PrimChecks.procedure.preReturnCheck(R); return R; }
  var R = ProcedurePrims.callCommand("next-phase"); if (R === DeathInterrupt) { return R; }
  world.ticker.tick();
}))
ProcedurePrims.defineCommand("choose-current", 6051, 6320, (function() {
  if (MousePrims.isDown()) {
    let xHmouse = MousePrims.getX(); ProcedurePrims.stack().currentContext().registerStringRunVar("X-MOUSE", xHmouse);
    let yHmouse = MousePrims.getY(); ProcedurePrims.stack().currentContext().registerStringRunVar("Y-MOUSE", yHmouse);
    if (PrimChecks.agentset.of(PrimChecks.validator.checkArg('OF', 1904, world.getPatchAt(PrimChecks.validator.checkArg('PATCH', 1, xHmouse), PrimChecks.validator.checkArg('PATCH', 1, yHmouse))), function() { return PrimChecks.patch.getVariable("intersection?"); })) {
      var R = ProcedurePrims.callCommand("update-current"); if (R === DeathInterrupt) { return R; }
      var R = ProcedurePrims.callCommand("unlabel-current"); if (R === DeathInterrupt) { return R; }
      var R = ProcedurePrims.callCommand("make-current", world.getPatchAt(PrimChecks.validator.checkArg('PATCH', 1, xHmouse), PrimChecks.validator.checkArg('PATCH', 1, yHmouse))); if (R === DeathInterrupt) { return R; }
      var R = ProcedurePrims.callCommand("label-current"); if (R === DeathInterrupt) { return R; }
      return PrimChecks.procedure.stop();
    }
  }
}))
ProcedurePrims.defineCommand("make-current", 6388, 6528, (function(light) {
  world.observer.setGlobal("current-light", light);
  world.observer.setGlobal("current-phase", PrimChecks.agentset.of(PrimChecks.validator.checkArg('OF', 1904, world.observer.getGlobal("current-light")), function() { return PrimChecks.patch.getVariable("my-phase"); }));
  world.observer.setGlobal("current-auto?", PrimChecks.agentset.of(PrimChecks.validator.checkArg('OF', 1904, world.observer.getGlobal("current-light")), function() { return PrimChecks.patch.getVariable("auto?"); }));
}))
ProcedurePrims.defineCommand("update-current", 6582, 6682, (function() {
  var R = ProcedurePrims.ask(PrimChecks.validator.checkArg('ASK', 1904, world.observer.getGlobal("current-light")), function() {
    PrimChecks.patch.setVariable("my-phase", world.observer.getGlobal("current-phase"));
    PrimChecks.patch.setVariable("auto?", world.observer.getGlobal("current-auto?"));
  }, true); if (R !== undefined) { PrimChecks.procedure.preReturnCheck(R); return R; }
}))
ProcedurePrims.defineCommand("label-current", 6717, 6849, (function() {
  var R = ProcedurePrims.ask(PrimChecks.validator.checkArg('ASK', 1904, world.observer.getGlobal("current-light")), function() {
    var R = ProcedurePrims.ask(PrimChecks.validator.checkArg('ASK', 1904, SelfManager.self()._optimalPatchNorthWest()), function() {
      PrimChecks.patch.setVariable("plabel-color", 0);
      PrimChecks.patch.setVariable("plabel", "current");
    }, true); if (R !== undefined) { PrimChecks.procedure.preReturnCheck(R); return R; }
  }, true); if (R !== undefined) { PrimChecks.procedure.preReturnCheck(R); return R; }
}))
ProcedurePrims.defineCommand("unlabel-current", 6919, 7017, (function() {
  var R = ProcedurePrims.ask(PrimChecks.validator.checkArg('ASK', 1904, world.observer.getGlobal("current-light")), function() {
    var R = ProcedurePrims.ask(PrimChecks.validator.checkArg('ASK', 1904, SelfManager.self()._optimalPatchNorthWest()), function() { PrimChecks.patch.setVariable("plabel", ""); }, true); if (R !== undefined) { PrimChecks.procedure.preReturnCheck(R); return R; }
  }, true); if (R !== undefined) { PrimChecks.procedure.preReturnCheck(R); return R; }
}))
ProcedurePrims.defineCommand("set-signals", 7110, 7286, (function() {
  var R = ProcedurePrims.ask(PrimChecks.agentset.with(PrimChecks.validator.checkArg('WITH', 112, world.observer.getGlobal("intersections")), function() {
    return (PrimChecks.validator.checkArg('AND', 2, PrimChecks.patch.getVariable("auto?")) && Prims.equality(world.observer.getGlobal("phase"), PrimChecks.math.floor(PrimChecks.math.div(PrimChecks.math.mult(PrimChecks.validator.checkArg('*', 1, PrimChecks.patch.getVariable("my-phase")), PrimChecks.validator.checkArg('*', 1, world.observer.getGlobal("ticks-per-cycle"))), 100))));
  }), function() {
    PrimChecks.patch.setVariable("green-light-up?", PrimChecks.math.not(PrimChecks.validator.checkArg('NOT', 2, PrimChecks.patch.getVariable("green-light-up?"))));
    var R = ProcedurePrims.callCommand("set-signal-colors"); if (R === DeathInterrupt) { return R; }
  }, true); if (R !== undefined) { PrimChecks.procedure.preReturnCheck(R); return R; }
}))
ProcedurePrims.defineCommand("set-signal-colors", 7459, 7854, (function() {
  if (world.observer.getGlobal("power?")) {
    if (PrimChecks.patch.getVariable("green-light-up?")) {
      var R = ProcedurePrims.ask(PrimChecks.validator.checkArg('ASK', 1904, SelfManager.self()._optimalPatchWest()), function() { PrimChecks.patch.setVariable("pcolor", 15); }, true); if (R !== undefined) { PrimChecks.procedure.preReturnCheck(R); return R; }
      var R = ProcedurePrims.ask(PrimChecks.validator.checkArg('ASK', 1904, SelfManager.self()._optimalPatchNorth()), function() { PrimChecks.patch.setVariable("pcolor", 55); }, true); if (R !== undefined) { PrimChecks.procedure.preReturnCheck(R); return R; }
    }
    else {
      var R = ProcedurePrims.ask(PrimChecks.validator.checkArg('ASK', 1904, SelfManager.self()._optimalPatchWest()), function() { PrimChecks.patch.setVariable("pcolor", 55); }, true); if (R !== undefined) { PrimChecks.procedure.preReturnCheck(R); return R; }
      var R = ProcedurePrims.ask(PrimChecks.validator.checkArg('ASK', 1904, SelfManager.self()._optimalPatchNorth()), function() { PrimChecks.patch.setVariable("pcolor", 15); }, true); if (R !== undefined) { PrimChecks.procedure.preReturnCheck(R); return R; }
    }
  }
  else {
    var R = ProcedurePrims.ask(PrimChecks.validator.checkArg('ASK', 1904, SelfManager.self()._optimalPatchWest()), function() { PrimChecks.patch.setVariable("pcolor", 9.9); }, true); if (R !== undefined) { PrimChecks.procedure.preReturnCheck(R); return R; }
    var R = ProcedurePrims.ask(PrimChecks.validator.checkArg('ASK', 1904, SelfManager.self()._optimalPatchNorth()), function() { PrimChecks.patch.setVariable("pcolor", 9.9); }, true); if (R !== undefined) { PrimChecks.procedure.preReturnCheck(R); return R; }
  }
}))
ProcedurePrims.defineCommand("set-car-speed", 8006, 8153, (function() {
  if (Prims.equality(PrimChecks.patch.getVariable("pcolor"), 15)) {
    PrimChecks.turtle.setVariable("speed", 0);
  }
  else {
    if (PrimChecks.turtle.getVariable("up-car?")) {
      var R = ProcedurePrims.callCommand("set-speed", 0, -1); if (R === DeathInterrupt) { return R; }
    }
    else {
      var R = ProcedurePrims.callCommand("set-speed", 1, 0); if (R === DeathInterrupt) { return R; }
    }
  }
}))
ProcedurePrims.defineCommand("set-speed", 8322, 8792, (function(deltaHx, deltaHy) {
  let turtlesHahead = SelfManager.self().turtlesAt(deltaHx, deltaHy); ProcedurePrims.stack().currentContext().registerStringRunVar("TURTLES-AHEAD", turtlesHahead);
  if (PrimChecks.agentset.any(PrimChecks.validator.checkArg('ANY?', 112, turtlesHahead))) {
    if (PrimChecks.agentset.anyWith(turtlesHahead, function() {
      return !Prims.equality(PrimChecks.turtle.getVariable("up-car?"), PrimChecks.agentset.of(SelfManager.myself(), function() { return PrimChecks.turtle.getVariable("up-car?"); }));
    })) {
      PrimChecks.turtle.setVariable("speed", 0);
    }
    else {
      PrimChecks.turtle.setVariable("speed", PrimChecks.agentset.of(PrimChecks.validator.checkArg('OF', 1904, PrimChecks.list.oneOf(PrimChecks.validator.checkArg('ONE-OF', 120, turtlesHahead))), function() { return PrimChecks.turtle.getVariable("speed"); }));
      var R = ProcedurePrims.callCommand("slow-down"); if (R === DeathInterrupt) { return R; }
    }
  }
  else {
    var R = ProcedurePrims.callCommand("speed-up"); if (R === DeathInterrupt) { return R; }
  }
}))
ProcedurePrims.defineCommand("slow-down", 8836, 8958, (function() {
  if (Prims.lte(PrimChecks.turtle.getVariable("speed"), 0)) {
    PrimChecks.turtle.setVariable("speed", 0);
  }
  else {
    PrimChecks.turtle.setVariable("speed", PrimChecks.math.minus(PrimChecks.validator.checkArg('-', 1, PrimChecks.turtle.getVariable("speed")), PrimChecks.validator.checkArg('-', 1, world.observer.getGlobal("acceleration"))));
  }
}))
ProcedurePrims.defineCommand("speed-up", 9002, 9126, (function() {
  if (Prims.gt(PrimChecks.turtle.getVariable("speed"), world.observer.getGlobal("speed-limit"))) {
    PrimChecks.turtle.setVariable("speed", world.observer.getGlobal("speed-limit"));
  }
  else {
    PrimChecks.turtle.setVariable("speed", PrimChecks.math.plus(PrimChecks.validator.checkArg('+', 1, PrimChecks.turtle.getVariable("speed")), PrimChecks.validator.checkArg('+', 1, world.observer.getGlobal("acceleration"))));
  }
}))
ProcedurePrims.defineCommand("set-car-color", 9225, 9341, (function() {
  if (Prims.lt(PrimChecks.turtle.getVariable("speed"), PrimChecks.math.div(PrimChecks.validator.checkArg('/', 1, world.observer.getGlobal("speed-limit")), 2))) {
    PrimChecks.turtleOrLink.setVariable("color", 105);
  }
  else {
    PrimChecks.turtleOrLink.setVariable("color", PrimChecks.math.minus(85, 2));
  }
}))
ProcedurePrims.defineCommand("record-data", 9466, 9626, (function() {
  if (Prims.equality(PrimChecks.turtle.getVariable("speed"), 0)) {
    world.observer.setGlobal("num-cars-stopped", PrimChecks.math.plus(PrimChecks.validator.checkArg('+', 1, world.observer.getGlobal("num-cars-stopped")), 1));
    PrimChecks.turtle.setVariable("wait-time", PrimChecks.math.plus(PrimChecks.validator.checkArg('+', 1, PrimChecks.turtle.getVariable("wait-time")), 1));
  }
  else {
    PrimChecks.turtle.setVariable("wait-time", 0);
  }
}))
ProcedurePrims.defineCommand("change-current", 9634, 9745, (function() {
  var R = ProcedurePrims.ask(PrimChecks.validator.checkArg('ASK', 1904, world.observer.getGlobal("current-light")), function() {
    PrimChecks.patch.setVariable("green-light-up?", PrimChecks.math.not(PrimChecks.validator.checkArg('NOT', 2, PrimChecks.patch.getVariable("green-light-up?"))));
    var R = ProcedurePrims.callCommand("set-signal-colors"); if (R === DeathInterrupt) { return R; }
  }, true); if (R !== undefined) { PrimChecks.procedure.preReturnCheck(R); return R; }
}))
ProcedurePrims.defineCommand("next-phase", 9799, 9954, (function() {
  world.observer.setGlobal("phase", PrimChecks.math.plus(PrimChecks.validator.checkArg('+', 1, world.observer.getGlobal("phase")), 1));
  if (Prims.equality(PrimChecks.math.mod(PrimChecks.validator.checkArg('MOD', 1, world.observer.getGlobal("phase")), PrimChecks.validator.checkArg('MOD', 1, world.observer.getGlobal("ticks-per-cycle"))), 0)) {
    world.observer.setGlobal("phase", 0);
  }
}))
world.observer.setGlobal("grid-size-y", 5);
world.observer.setGlobal("grid-size-x", 5);
world.observer.setGlobal("power?", true);
world.observer.setGlobal("num-cars", 200);
world.observer.setGlobal("speed-limit", 1);
world.observer.setGlobal("ticks-per-cycle", 20);
world.observer.setGlobal("current-phase", 0);
world.observer.setGlobal("current-auto?", true);