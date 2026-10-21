import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const output = fileURLToPath(
  new URL("../public/images/features/", import.meta.url),
);
const gradients = `
  <linearGradient id="mint" x1="0" y1="0" x2=".85" y2="1"><stop stop-color="#e3fff0"/><stop offset=".42" stop-color="#a5d7bb"/><stop offset="1" stop-color="#65947f"/></linearGradient>
  <linearGradient id="peach" x1="0" y1="0" x2=".85" y2="1"><stop stop-color="#ffe4cf"/><stop offset=".4" stop-color="#f2b69b"/><stop offset="1" stop-color="#ba735d"/></linearGradient>
  <linearGradient id="gold" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#fff3c9"/><stop offset=".45" stop-color="#f0d08b"/><stop offset="1" stop-color="#c19a54"/></linearGradient>
  <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fffef8"/><stop offset=".65" stop-color="#f8f3e8"/><stop offset="1" stop-color="#d5cbb9"/></linearGradient>
  <linearGradient id="rose" x1="0" y1="0" x2=".85" y2="1"><stop stop-color="#ffe6e1"/><stop offset=".5" stop-color="#eab6b0"/><stop offset="1" stop-color="#b9797c"/></linearGradient>
  <linearGradient id="ink" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#718b7c"/><stop offset="1" stop-color="#3e5549"/></linearGradient>
  <radialGradient id="skin" cx=".32" cy=".25" r=".75"><stop stop-color="#fff2db"/><stop offset=".55" stop-color="#f2c8a2"/><stop offset="1" stop-color="#c78c6c"/></radialGradient>
  <filter id="shadow" x="-40%" y="-35%" width="180%" height="190%"><feDropShadow dx="3" dy="8" stdDeviation="5" flood-color="#514030" flood-opacity=".18"/></filter>
  <filter id="ground"><feGaussianBlur stdDeviation="5"/></filter>
`;
const rect = (x, y, w, h, fill, radius = 12, extra = "") =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" ${extra}/>`;
const star = (x, y, color, scale = 1) =>
  `<path transform="translate(${x} ${y}) scale(${scale})" d="M0 -12 Q2 -2 12 0 Q2 2 0 12 Q-2 2 -12 0 Q-2 -2 0 -12Z" fill="${color}"/>`;
const check = (x, y, scale = 1) =>
  `<path transform="translate(${x} ${y}) scale(${scale})" d="M-13 0 -3 10 16 -12" fill="none" stroke="#fffef7" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`;
const badge = (x, y, fill) =>
  `<g filter="url(#shadow)"><circle cx="${x}" cy="${y + 4}" r="24" fill="#638773"/><circle cx="${x}" cy="${y}" r="24" fill="url(#${fill})"/><path d="M${x - 15} ${y - 12} Q${x} ${y - 26} ${x + 14} ${y - 14}" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"/>${check(x, y + 1, 0.7)}</g>`;
const person = (
  x,
  y,
  fill,
  scale = 1,
) => `<g transform="translate(${x} ${y}) scale(${scale})" filter="url(#shadow)">
  <path d="M-38 66 Q-40 21 0 19 Q40 21 38 66 Q2 84 -38 66Z" fill="url(#${fill})"/>
  <path d="M-26 43 Q-20 31 -11 31" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="4" stroke-linecap="round"/>
  <circle r="24" fill="url(#skin)"/>
  <ellipse cx="-8" cy="-10" rx="9" ry="5" fill="#fff9e9" opacity=".45"/>
  <circle cx="-7" cy="3" r="2" fill="#79604e"/><circle cx="7" cy="3" r="2" fill="#79604e"/>
  <path d="M-4 11 Q0 14 4 11" stroke="#ac765d" stroke-width="2" fill="none" stroke-linecap="round"/>
</g>`;
const scenes = {
  team: `${person(90, 100, "rose", 0.82)}${person(230, 100, "gold", 0.82)}${person(160, 91, "mint", 1.12)}${badge(219, 172, "mint")}${star(61, 63, "#d8b776", 0.7)}${star(258, 70, "#9abdab", 0.5)}`,
  invoice: `<g transform="rotate(-8 153 124)" filter="url(#shadow)">
    ${rect(98, 40, 128, 166, "#c8bda9", 16)}${rect(91, 33, 128, 166, "url(#paper)", 16)}
    ${rect(111, 53, 39, 32, "url(#peach)", 10)}<path d="M120 63h20m-20 9h13" stroke="#fff5e7" stroke-width="4" stroke-linecap="round"/>
    ${rect(163, 61, 35, 6, "#dad2c5", 3)}${rect(163, 74, 24, 5, "#e4ddd1", 2.5)}
    <path d="M111 105h87m-87 19h57m15 0h15m-87 19h57m15 0h15" stroke="#c9d7c9" stroke-width="6" stroke-linecap="round"/>
    ${rect(109, 163, 91, 18, "url(#mint)", 6)}
    <path d="M99 48v124" stroke="#fff" stroke-width="3" stroke-opacity=".6" stroke-linecap="round"/>
  </g>${badge(224, 175, "mint")}${star(63, 105, "#dbb57e", 0.8)}${star(245, 55, "#9bbb9f", 0.6)}`,
  payments: `<g transform="rotate(-6 157 132)" filter="url(#shadow)">
    ${rect(63, 83, 185, 118, "#b87760", 24)}${rect(57, 75, 185, 118, "url(#peach)", 24)}
    ${rect(81, 51, 133, 69, "#7e9d88", 10)}${rect(76, 45, 133, 69, "url(#mint)", 10)}
    <path d="M89 57h105v43H89z" stroke="#e6f7e9" stroke-width="2" fill="none" opacity=".7"/><circle cx="142" cy="78" r="13" fill="#e5efcf"/>
    ${rect(57, 105, 185, 88, "url(#peach)", 19)}
    <path d="M70 119h158" stroke="#ffe3cf" stroke-width="3" opacity=".6" stroke-linecap="round"/>
    ${rect(191, 126, 59, 39, "#ad705d", 12)}${rect(185, 120, 59, 39, "url(#gold)", 12)}<circle cx="204" cy="139" r="5" fill="#a78652"/>
  </g><g transform="rotate(8 116 161)" filter="url(#shadow)">${rect(84, 127, 64, 67, "url(#paper)", 12)}
    <path d="M96 139h13v13H96zm27 0h13v13h-13zm-27 27h13v13H96z" fill="none" stroke="#5e7c68" stroke-width="4"/><path d="M122 163h7v7h7v10h-12v-9h-7v-9" fill="none" stroke="#5e7c68" stroke-width="4"/>
  </g>${star(254, 69, "#cda970", 0.8)}`,
  branding: `<g filter="url(#shadow)">
    <path d="M153 48C90 48 57 91 67 143c9 46 69 76 94 45 13-16-12-28 1-41 13-14 38 7 58-8 37-30-6-91-67-91Z" fill="#ba8a72" transform="translate(4 8)"/>
    <path d="M153 48C90 48 57 91 67 143c9 46 69 76 94 45 13-16-12-28 1-41 13-14 38 7 58-8 37-30-6-91-67-91Z" fill="url(#paper)"/>
    <path d="M82 112Q90 71 130 63" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
    <circle cx="112" cy="94" r="17" fill="url(#mint)"/><circle cx="159" cy="81" r="16" fill="url(#peach)"/><circle cx="194" cy="106" r="15" fill="url(#gold)"/><circle cx="103" cy="144" r="17" fill="url(#rose)"/>
  </g><g transform="rotate(32 217 134)" filter="url(#shadow)">${rect(208, 64, 18, 107, "url(#mint)", 9)}${rect(208, 150, 18, 24, "url(#gold)", 3)}<path d="M208 171Q198 193 217 205Q235 188 226 171Z" fill="url(#ink)"/><path d="M214 77v58" stroke="#e0f2df" stroke-width="3" stroke-linecap="round"/></g>${star(62, 61, "#cba578", 0.7)}`,
  print: `<g filter="url(#shadow)">
    ${rect(110, 42, 111, 95, "#cecabd", 10)}${rect(104, 36, 111, 95, "url(#paper)", 10)}
    <path d="M122 55h74m-74 13h53m-53 13h62" stroke="#c2d2c4" stroke-width="5" stroke-linecap="round"/>
    <path d="M73 101 94 83h149l17 23v79l-17 16H73Z" fill="#73927e"/>
    ${rect(67, 98, 180, 94, "url(#mint)", 20)}
    <path d="M84 111h144" stroke="#e6f7e7" stroke-width="4" stroke-linecap="round" opacity=".7"/>
    ${rect(94, 143, 127, 33, "url(#ink)", 10)}
    <circle cx="222" cy="125" r="5" fill="#faf0bf"/>
    <path d="M112 155h94l-10 53H100Z" fill="#cec6b5"/>
    <path d="M105 152h94l-10 49H93Z" fill="url(#paper)"/>
    <path d="M114 169h61m-64 11h48" stroke="#b4cbb6" stroke-width="4" stroke-linecap="round"/>
  </g>${star(71, 54, "#e5bd83", 0.8)}${star(267, 77, "#93b29a", 0.5)}`,
  catalog: `<g transform="rotate(-8 132 114)" filter="url(#shadow)">
    ${rect(81, 44, 128, 154, "#c5967d", 15)}${rect(75, 37, 128, 154, "url(#peach)", 15)}
    ${rect(65, 51, 128, 154, "#7f9e88", 15)}${rect(59, 44, 128, 154, "url(#mint)", 15)}
    ${rect(72, 60, 101, 42, "url(#paper)", 9)}<circle cx="90" cy="79" r="8" fill="#dbb897"/><path d="M105 73h52m-52 13h35" stroke="#bec9ba" stroke-width="4" stroke-linecap="round"/>
    ${rect(73, 115, 20, 20, "url(#paper)", 5)}${rect(73, 148, 20, 20, "url(#paper)", 5)}<path d="M105 125h54m-54 33h43" stroke="#e9f1df" stroke-width="6" stroke-linecap="round"/>
  </g><g filter="url(#shadow)"><path d="m172 131 44-20 47 22-44 22Z" fill="#ffdfb7"/><path d="m172 131 47 24v51l-47-24Z" fill="url(#peach)"/><path d="m219 155 44-22v52l-44 21Z" fill="#c98768"/><path d="m195 120 46 23v17l-13 6v-17l-46-22Z" fill="#f6e8c8"/><path d="M183 151v24l17 9" stroke="#ffe1c2" stroke-width="3" fill="none" stroke-linecap="round"/></g>${star(240, 63, "#d2ae74", 0.7)}`,
  analytics: `<g transform="rotate(-5 153 123)" filter="url(#shadow)">
    ${rect(72, 40, 178, 159, "#c4b9a6", 20)}${rect(65, 33, 178, 159, "url(#paper)", 20)}
    <path d="M85 67h136M85 100h136M85 133h136M85 166h136" stroke="#e5dfd2" stroke-width="2"/>
    ${rect(88, 127, 30, 44, "#c18a6c", 8)}${rect(84, 122, 30, 44, "url(#peach)", 8)}
    ${rect(137, 101, 30, 70, "#bb9c62", 8)}${rect(133, 96, 30, 70, "url(#gold)", 8)}
    ${rect(187, 71, 30, 100, "#759c84", 8)}${rect(183, 66, 30, 100, "url(#mint)", 8)}
    <path d="M90 137v16m49-41v40m50-70v70" stroke="#fff" stroke-width="3" stroke-opacity=".45" stroke-linecap="round"/>
  </g><g filter="url(#shadow)"><path d="m193 56 18-18 18 18m-18-18v39" stroke="#e9b28b" stroke-width="11" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>${badge(235, 181, "mint")}${star(52, 92, "#e2bd83", 0.6)}`,
  security: `<g filter="url(#shadow)">
    <path d="M92 165c-52 0-57-66-11-79 1-46 65-57 87-22 38-12 66 18 61 48 39 17 25 53-8 53Z" fill="#799f8c" transform="translate(3 8)"/>
    <path d="M92 165c-52 0-57-66-11-79 1-46 65-57 87-22 38-12 66 18 61 48 39 17 25 53-8 53Z" fill="url(#mint)"/>
    <path d="M91 84c7-26 37-31 54-17" stroke="#f0fff1" stroke-width="6" fill="none" stroke-linecap="round" opacity=".65"/>
    <path d="M69 107q-16 11-8 27" stroke="#e9f8e8" stroke-width="5" fill="none" stroke-linecap="round" opacity=".6"/>
  </g><g filter="url(#shadow)"><path d="m188 106 43 17v39c0 24-23 43-43 51-20-8-43-27-43-51v-39Z" fill="#bf9a61" transform="translate(5 4)"/><path d="m188 106 43 17v39c0 24-23 43-43 51-20-8-43-27-43-51v-39Z" fill="url(#gold)"/><path d="m188 116 33 13v30" stroke="#fff4cd" stroke-width="3" fill="none" stroke-linecap="round"/>${check(188, 158, 1.05)}</g>${star(252, 62, "#d8b27c", 0.75)}${star(60, 61, "#b0c6ae", 0.5)}`,
};

await mkdir(output, { recursive: true });
for (const [name, scene] of Object.entries(scenes)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 320 240"><defs>${gradients}</defs><ellipse cx="162" cy="211" rx="87" ry="9" fill="#685b48" opacity=".13" filter="url(#ground)"/>${scene}</svg>`;
  await writeFile(`${output}/${name}.svg`, svg);
  await sharp(Buffer.from(svg))
    .webp({ quality: 90, alphaQuality: 100 })
    .toFile(`${output}/${name}.webp`);
  console.log(`Created ${name}.svg and ${name}.webp`);
}
