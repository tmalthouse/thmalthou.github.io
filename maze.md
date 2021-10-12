---
layout: page
title: Maze
permalink: /personal/maze
---

<script>
console.log("For Nancy");
</script>
 <script src="/assets/js/maze.js"></script> 
 <div id="settings">
 <label for="size">Choose a maze size:</label>
 <select name="Maze Size" id="size">
  <option value="4">4</option>
    <option value="8">8</option>
    <option value="16">16</option>
    <option value="32">32</option>
    <option value="64">64</option>
</select><br>
<label for="genalgo"> Choose a maze generation mode:</label>
 <select name="Maze Generator" id="genalgo">
  <option value="combo">Combo (The best parts of Newest and Random)</option>
    <option value="new">Newest (A classic maze with short corridors)</option>
    <option value="mid">Midpoint (A maze with longer, straighter corridors)</option>
    <option value="rand">Random (A chaotic maze with less uniform features)</option>
</select><br>
<button onclick="init()">Start</button> 
</div>

<div id="mazeblock">
<div id="maze" style="line-height: 1; font-size: 14px; overflow-x: auto; white-space: nowrap;"></div><br>
<div id="message"> </div>
</div>