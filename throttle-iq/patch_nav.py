import re

with open('index.html', 'r') as f:
    content = f.read()

# Replace New V2 nav button
content = re.sub(
    r'<a class="btn btn-primary" href="/thtorrleiq2/".*?New V2 &rarr;</a>',
    r'<a class="btn btn-primary" href="#demo">Product Demo &darr;</a>',
    content
)

# Insert Product Demo section before "The problem" section
demo_section = """
  <section id="demo" class="wrap">
    <div class="kicker">Product Demo</div>
    <h2>See ThrottleIQ in action.</h2>
    <p class="sec-lede">Explore the core tracking experience of v1 and the newly shipped social and maintenance features of v2.</p>
    <div class="arch">
      <div class="arch-box">
        <h4>v1: Tracking & Safety</h4>
        <p style="color:var(--muted); font-size:14.5px; margin-bottom:12px;">Background ride tracking, crash detection, and offline-first SQLite sync.</p>
        <a class="btn btn-ghost" href="ui.html">View v1 UI</a>
      </div>
      <div class="arch-box">
        <h4>v2: Social & Cloud Maintenance</h4>
        <p style="color:var(--muted); font-size:14.5px; margin-bottom:12px;">Unified media collages, live follower visibility, and per-bike maintenance synced securely to Firestore.</p>
        <a class="btn btn-primary" href="ui.html">View v2 UI</a>
      </div>
    </div>
  </section>
"""

content = content.replace(
    '<section class="wrap">\n    <div class="kicker">The problem</div>',
    demo_section + '\n  <section class="wrap">\n    <div class="kicker">The problem</div>'
)

# Update roadmap v2
content = re.sub(
    r'<h4>v2\.0 — In progress <span class="tag tag-done">BETA</span></h4>\s*<p>Open social graph with audience-tiered sharing, forums, group rides with\s*shared live maps, saved routes with turn-by-turn navigation, per-bike\s*service tracking.</p>',
    r'<h4>v2.0 — Beta <span class="tag tag-done">LIVE BETA</span></h4>\n        <p>Open social graph with live follower visibility, unified media collages, group rides, and per-bike maintenance synced to Firestore.</p>',
    content
)

# Update features to include recent works
content = re.sub(
    r'<li>Service intervals tracked against actual distance ridden</li>\s*<li>13 service types, plus a custom type for anything else</li>',
    r'<li>Service intervals tracked against actual distance ridden</li>\n          <li>13 service types synced directly to Firestore per-bike</li>',
    content
)

with open('index.html', 'w') as f:
    f.write(content)
