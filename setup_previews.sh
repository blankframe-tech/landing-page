#!/bin/bash
mkdir -p ../bft-previews

git worktree add ../bft-previews/big-idea theme-big-idea
git worktree add ../bft-previews/engineered-energy theme-engineered-energy
git worktree add ../bft-previews/contemplative-tech theme-contemplative-tech
git worktree add ../bft-previews/drawing-board theme-drawing-board
git worktree add ../bft-previews/opalescence theme-opalescence
git worktree add ../bft-previews/server-room theme-server-room
git worktree add ../bft-previews/eco-app theme-eco-app
git worktree add ../bft-previews/ethernet theme-ethernet
git worktree add ../bft-previews/smart-home theme-smart-home
git worktree add ../bft-previews/tech-startup theme-tech-startup

cat << 'HTMLEOF' > ../bft-previews/index.html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>BFT Theme Previews (14 Themes)</title>
<style>
  body {
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    grid-auto-rows: 50vh;
    font-family: sans-serif;
    background: #111;
    color: white;
  }
  .frame-container {
    position: relative;
    border: 1px solid #333;
  }
  .label {
    position: absolute;
    top: 10px;
    left: 10px;
    background: rgba(0,0,0,0.8);
    padding: 5px 10px;
    border-radius: 4px;
    z-index: 10;
    font-size: 14px;
    font-weight: bold;
    pointer-events: none;
    box-shadow: 0 2px 4px rgba(0,0,0,0.5);
  }
  iframe {
    width: 100%;
    height: 100%;
    border: none;
    display: block;
  }
  .fullscreen-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(255,255,255,0.2);
    color: white;
    text-decoration: none;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 10;
  }
  .fullscreen-btn:hover {
    background: rgba(255,255,255,0.4);
  }
</style>
</head>
<body>
  <!-- Original 4 -->
  <div class="frame-container"><div class="label">1. The Acid Dirt</div><a href="/acid/" target="_blank" class="fullscreen-btn">Full Screen</a><iframe src="/acid/"></iframe></div>
  <div class="frame-container"><div class="label">2. Industrial Brutalism</div><a href="/industrial/" target="_blank" class="fullscreen-btn">Full Screen</a><iframe src="/industrial/"></iframe></div>
  <div class="frame-container"><div class="label">3. Overgrown Analog</div><a href="/analog/" target="_blank" class="fullscreen-btn">Full Screen</a><iframe src="/analog/"></iframe></div>
  <div class="frame-container"><div class="label">4. Neon Punk & Mud</div><a href="/neon/" target="_blank" class="fullscreen-btn">Full Screen</a><iframe src="/neon/"></iframe></div>
  
  <!-- New 10 -->
  <div class="frame-container"><div class="label">5. Big Idea</div><a href="/big-idea/" target="_blank" class="fullscreen-btn">Full Screen</a><iframe src="/big-idea/" loading="lazy"></iframe></div>
  <div class="frame-container"><div class="label">6. Engineered Energy</div><a href="/engineered-energy/" target="_blank" class="fullscreen-btn">Full Screen</a><iframe src="/engineered-energy/" loading="lazy"></iframe></div>
  <div class="frame-container"><div class="label">7. Contemplative Tech</div><a href="/contemplative-tech/" target="_blank" class="fullscreen-btn">Full Screen</a><iframe src="/contemplative-tech/" loading="lazy"></iframe></div>
  <div class="frame-container"><div class="label">8. Drawing Board</div><a href="/drawing-board/" target="_blank" class="fullscreen-btn">Full Screen</a><iframe src="/drawing-board/" loading="lazy"></iframe></div>
  <div class="frame-container"><div class="label">9. Opalescence</div><a href="/opalescence/" target="_blank" class="fullscreen-btn">Full Screen</a><iframe src="/opalescence/" loading="lazy"></iframe></div>
  <div class="frame-container"><div class="label">10. Server Room</div><a href="/server-room/" target="_blank" class="fullscreen-btn">Full Screen</a><iframe src="/server-room/" loading="lazy"></iframe></div>
  <div class="frame-container"><div class="label">11. Eco App</div><a href="/eco-app/" target="_blank" class="fullscreen-btn">Full Screen</a><iframe src="/eco-app/" loading="lazy"></iframe></div>
  <div class="frame-container"><div class="label">12. Ethernet</div><a href="/ethernet/" target="_blank" class="fullscreen-btn">Full Screen</a><iframe src="/ethernet/" loading="lazy"></iframe></div>
  <div class="frame-container"><div class="label">13. Smart Home</div><a href="/smart-home/" target="_blank" class="fullscreen-btn">Full Screen</a><iframe src="/smart-home/" loading="lazy"></iframe></div>
  <div class="frame-container"><div class="label">14. Tech Startup</div><a href="/tech-startup/" target="_blank" class="fullscreen-btn">Full Screen</a><iframe src="/tech-startup/" loading="lazy"></iframe></div>
</body>
</html>
HTMLEOF
