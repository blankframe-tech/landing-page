'use strict';

const DESC = 'r1_Fuel is independently funded and is not seeking donations or grants.';

function body() {
  return `
<header class="hero" style="padding-bottom:20px;">
  <div class="wrap">
    <div class="eyebrow"><span class="dot"></span> Funding</div>
    <h1 class="display">Independently funded.</h1>
    <p class="lede">
      r1_Fuel is independently funded. It is not asking for donations or grants, and earlier funding requests on
      this page have been withdrawn.
    </p>
    <p class="lede-sm">
      If you can host a study, lead a strand or offer a correction, the
      <a href="/research/r1_Fuel/collaborate/" style="color:var(--accent)">collaborate page</a> says what is open, or
      email <a href="mailto:hello@blankframe.tech?subject=r1_Fuel" style="color:var(--accent)">hello@blankframe.tech</a>.
    </p>
  </div>
</header>
`;
}

module.exports = { body, DESC };
