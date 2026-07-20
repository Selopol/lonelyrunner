/* Exponential-sum ink curves: z(t) = Σ_j exp(2πi · v_j · t).
   Every certified speed tuple draws its own curve. Real math, no decor:
   the tuple IS the artwork. */

function expSumPoints(speeds, samples = 2400) {
  const pts = [];
  for (let s = 0; s <= samples; s++) {
    const t = s / samples;
    let x = 0, y = 0;
    for (const v of speeds) {
      x += Math.cos(2 * Math.PI * v * t);
      y += Math.sin(2 * Math.PI * v * t);
    }
    pts.push([x, y]);
  }
  return pts;
}

/* Fit transform for a tuple's point cloud into a size×size box. */
function expSumFit(speeds, size = 300, margin = 24, samples = 2400) {
  const pts = expSumPoints(speeds, samples);
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const [x, y] of pts) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const span = Math.max(maxX - minX, maxY - minY) || 1;
  const k = (size - 2 * margin) / span;
  const ox = (size - k * (maxX - minX)) / 2 - k * minX;
  const oy = (size - k * (maxY - minY)) / 2 - k * minY;
  return { k, ox, oy };
}

/* Fit points into a size×size box with margin, return an SVG path string. */
function expSumPath(speeds, size = 300, margin = 24, samples = 2400) {
  const pts = expSumPoints(speeds, samples);
  const { k, ox, oy } = expSumFit(speeds, size, margin, samples);
  let d = "";
  for (let i = 0; i < pts.length; i++) {
    const x = (k * pts[i][0] + ox).toFixed(2);
    const y = (k * pts[i][1] + oy).toFixed(2);
    d += (i === 0 ? "M" : "L") + x + " " + y;
  }
  return d + "Z";
}

/* A ready <svg> element for a tuple. Class hooks: .specimen-curve */
function curveSVG(speeds, size = 300) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
  svg.classList.add("specimen-curve");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", expSumPath(speeds, size));
  path.setAttribute("fill", "none");
  svg.appendChild(path);
  return svg;
}
