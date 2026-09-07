export type LayoutNode = { id: string; x: number; y: number };

// Project overlapping circles apart, keeping the node in the player's hand fixed.
export function separateNodes(nodes: LayoutNode[], held: string): LayoutNode[] {
  const result = nodes.map(n => ({ ...n }));
  const clamp = (n: LayoutNode) => {
    n.x = Math.max(70, Math.min(1730, n.x));
    n.y = Math.max(70, Math.min(1430, n.y));
  };
  result.forEach(clamp);
  for (let pass = 0; pass < 120; pass++) {
    let overlap = 0;
    for (let i = 0; i < result.length; i++) for (let j = i + 1; j < result.length; j++) {
      const a = result[i], b = result[j];
      let dx = b.x - a.x, dy = b.y - a.y;
      const distance = Math.hypot(dx, dy);
      if (distance >= 148) continue;
      if (distance < 0.001) { dx = Math.cos((i + j) * 2.4); dy = Math.sin((i + j) * 2.4); }
      else { dx /= distance; dy /= distance; }
      const push = 148 - distance;
      overlap = Math.max(overlap, push);
      const shareA = a.id === held ? 0 : b.id === held ? 1 : 0.5;
      const shareB = 1 - shareA;
      a.x -= dx * push * shareA; a.y -= dy * push * shareA;
      b.x += dx * push * shareB; b.y += dy * push * shareB;
      clamp(a); clamp(b);
    }
    if (overlap < 0.05) break;
  }
  return result;
}
