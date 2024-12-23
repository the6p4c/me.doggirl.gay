import { useState } from "react";
import styles from "./PatternTool.module.css";

const stitchLibrary: Record<string, { consumes: number; produces: number }> = {
  sc: { consumes: 1, produces: 1 },
  inc: { consumes: 1, produces: 2 },
  dec: { consumes: 2, produces: 1 },
};

export default function PatternTool() {
  const [pattern, setPattern] = useState("");
  let stitches;
  try {
    stitches = parsePattern(pattern);
  } catch {
    stitches = [];
  }

  const consumes = stitches.reduce(
    (consumes, { name, count }) =>
      consumes + stitchLibrary[name]!?.consumes * count,
    0
  );
  const produces = stitches.reduce(
    (produces, { name, count }) =>
      produces + stitchLibrary[name]!.produces * count,
    0
  );

  return (
    <section>
      <label className={styles.label}>row/round</label>
      <input
        type="text"
        placeholder="e.g. sc, inc, sc 2, inc 2"
        value={pattern}
        onChange={(e) => setPattern(e.currentTarget.value)}
        className={styles.input}
      />
      <br />
      <br />
      consumes {consumes} stitches, produces {produces} stitches
    </section>
  );
}

function parsePattern(pattern2: string) {
  let pattern = pattern2;

  const consume = <T,>(
    re: RegExp,
    map: (groups: Record<string, string>) => T
  ) => {
    const match = re.exec(pattern);
    if (!match) return null;
    if (!match.groups) return null;

    pattern = pattern.slice(match[0].length);

    return map(match.groups);
  };

  const consumeIgnore = (re: RegExp) => {
    const match = re.exec(pattern);
    if (!match) return false;

    pattern = pattern.slice(match[0].length);

    return true;
  };

  const consumeStitch = () =>
    consume(/^(?<name>sc|inc)(\s+(?<count>\d+))?/, (groups) => ({
      name: groups["name"]!,
      count: groups["count"] ? Number(groups["count"]) : 1,
    }));

  const consumeComma = () => consumeIgnore(/^,\s*/);

  const stitches = [];
  while (pattern.length != 0) {
    const stitch = consumeStitch();
    if (!stitch) throw "what";
    stitches.push(stitch);
    if (!consumeComma()) break;
  }

  return stitches;
}
