import styles from "./mascot.module.css";

type Character =
  "invoice" | "clients" | "team" | "revenue" | "search" | "complete";

function Face({ happy = false }: { happy?: boolean }) {
  return (
    <g>
      <g className={styles.eyes} fill="#493d35">
        {happy ? (
          <path
            d="M-22-2q5-8 10 0m24 0q5-8 10 0"
            fill="none"
            stroke="#493d35"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        ) : (
          <>
            <ellipse cx="-16" cy="-3" rx="6.5" ry="8" />
            <ellipse cx="16" cy="-3" rx="6.5" ry="8" />
            <g fill="#fffdf5">
              <circle cx="-18" cy="-6" r="2.6" />
              <circle cx="14" cy="-6" r="2.6" />
              <circle cx="-13" cy="0" r="1.2" />
              <circle cx="19" cy="0" r="1.2" />
            </g>
          </>
        )}
      </g>
      <g fill="#f09eaa" opacity=".8">
        <ellipse cx="-26" cy="10" rx="10" ry="6" />
        <ellipse cx="26" cy="10" rx="10" ry="6" />
      </g>
      <path
        d="m-30 9 1 3m4-3 1 3m46-3 1 3m4-3 1 3"
        stroke="#fff1e8"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d={happy ? "M-8 9q8 18 16 0Z" : "M-9 10q3 7 9 1 6 6 9-1"}
        stroke="#665043"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill={happy ? "#ee9a9f" : "none"}
      />
    </g>
  );
}

function CharacterArt({ character }: { character: Character }) {
  switch (character) {
    case "invoice":
      return (
        <g className={styles.character}>
          <path
            d="M94 32C73 7 99 1 108 29m22 0c9-28 35-22 14 3"
            fill="#fff8e9"
            stroke="#665043"
            strokeWidth="2.5"
          />
          <path
            d="m95 17 7 11m37-11-5 11"
            stroke="#f1b4b8"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="m97 145-10 12m56-12 10 12M80 98q-23 6-18 27"
            stroke="#665043"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <g className={styles.hand}>
            <path
              d="M161 98q28-2 27-27m-3 2-4-7m7 7 1-9m2 11 5-5"
              stroke="#665043"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </g>
          <path
            d="M75 49q0-21 21-21h47q22 0 22 21v88q0 17-14 9-10 11-20 0-10 11-20 0-10 11-20 0-16 8-16-9Z"
            fill="#fff8e9"
            stroke="#665043"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="M93 45h16m-16 7h27m-23 67h43m-34 9h25"
            stroke="#d8c5a7"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <rect x="135" y="42" width="13" height="13" rx="4" fill="#e6a387" />
          <g transform="translate(119 82)">
            <Face />
          </g>
          <ellipse
            cx="89"
            cy="153"
            rx="10"
            ry="6"
            fill="#fff0da"
            stroke="#665043"
            strokeWidth="2"
          />
          <ellipse
            cx="151"
            cy="153"
            rx="10"
            ry="6"
            fill="#fff0da"
            stroke="#665043"
            strokeWidth="2"
          />
        </g>
      );
    case "clients":
      return (
        <g className={styles.sway}>
          <path
            d="m95 145-6 13m53-13 7 13M77 93q-16 1-21 18m109-18q17-5 20-19"
            stroke="#665043"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <rect
            x="79"
            y="37"
            width="87"
            height="112"
            rx="15"
            fill="#b8d7c3"
            stroke="#496d60"
            strokeWidth="2.5"
          />
          <path d="M92 38v110" stroke="#8aaa95" strokeWidth="3" />
          <path
            d="M75 55h12m-12 23h12m-12 23h12m-12 23h12"
            stroke="#665043"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path d="M146 37v24l-8-5-8 5V37" fill="#f4dfad" />
          <g transform="translate(128 88) scale(.8)">
            <Face />
          </g>
          <path
            d="M117 122h26"
            stroke="#729783"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path d="M178 48c-12-12-22 5 0 17 22-12 12-29 0-17Z" fill="#e6a387" />
        </g>
      );
    case "team":
      return (
        <>
          <g className={styles.companion}>
            <rect
              x="40"
              y="76"
              width="57"
              height="72"
              rx="25"
              fill="#b8d7c3"
              stroke="#496d60"
              strokeWidth="2.5"
            />
            <g transform="translate(68 106) scale(.6)">
              <Face />
            </g>
            <path
              d="m55 147-4 10m31-10 4 10"
              stroke="#665043"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </g>
          <g className={styles.sway}>
            <rect
              x="145"
              y="76"
              width="57"
              height="72"
              rx="25"
              fill="#eab49e"
              stroke="#946653"
              strokeWidth="2.5"
            />
            <g transform="translate(174 106) scale(.6)">
              <Face happy />
            </g>
            <path
              d="m161 147-4 10m31-10 4 10"
              stroke="#665043"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </g>
          <g className={styles.character}>
            <path
              d="M91 108q-16 18-27 8m88-8q16 18 27 8"
              stroke="#665043"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <rect
              x="86"
              y="45"
              width="70"
              height="106"
              rx="30"
              fill="#f4dfad"
              stroke="#9a8052"
              strokeWidth="2.5"
            />
            <g transform="translate(121 91) scale(.85)">
              <Face />
            </g>
            <path
              d="m105 151-4 9m35-9 4 9"
              stroke="#665043"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M113 43q-5-14 4-16m4 17q9-14 15-8"
              stroke="#9a8052"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>
        </>
      );
    case "revenue":
      return (
        <g className={styles.character}>
          <path
            d="m96 138-8 20m55-20 8 20M75 100q-16 10-15 23m105-23q18 0 23-16"
            stroke="#665043"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <circle
            cx="120"
            cy="96"
            r="51"
            fill="#e9bd70"
            stroke="#9a8052"
            strokeWidth="3"
          />
          <circle
            cx="120"
            cy="96"
            r="42"
            fill="#f4dfad"
            stroke="#d2aa66"
            strokeWidth="2"
          />
          <g transform="translate(120 92)">
            <Face />
          </g>
          <path
            d="M120 43V26"
            stroke="#496d60"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M120 33q-23 1-23-18 22-2 23 18Z"
            fill="#8fbc9f"
            stroke="#496d60"
            strokeWidth="2"
          />
          <path
            d="M121 29q2-22 23-19-1 20-23 19Z"
            fill="#b8d7c3"
            stroke="#496d60"
            strokeWidth="2"
          />
        </g>
      );
    case "search":
      return (
        <g className={styles.inspect}>
          <path
            d="m93 140-10 15m59-15 10 15"
            stroke="#665043"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M72 89q0-34 29-41l18 12 18-12q29 7 29 41v36q0 24-47 24t-47-24Z"
            fill="#d4dce7"
            stroke="#67768c"
            strokeWidth="2.5"
          />
          <path
            d="m72 57 5-26 25 19m34 0 25-19 5 26"
            fill="#d4dce7"
            stroke="#67768c"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <circle cx="101" cy="84" r="17" fill="#fff8e9" />
          <circle cx="137" cy="84" r="17" fill="#fff8e9" />
          <g transform="translate(119 87)">
            <Face />
          </g>
          <path d="m114 99 5 7 5-7" fill="#d3a260" />
          <path
            d="M80 113q-15 4-16 17m97-17-10 9"
            stroke="#67768c"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle
            cx="158"
            cy="119"
            r="20"
            fill="#d2e4d6"
            fillOpacity=".8"
            stroke="#496d60"
            strokeWidth="5"
          />
          <path
            d="m173 135 17 18"
            stroke="#496d60"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="m149 115 7-7"
            stroke="#fff8e9"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      );
    case "complete":
      return (
        <g className={styles.celebrate}>
          <path
            d="m97 139-10 17m56-17 10 17M76 88 59 67m105 21 17-21"
            stroke="#665043"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M112 37q8-16 16 0l16 29 32 6q17 3 5 16l-22 24 3 32q2 17-14 10l-28-13-28 13q-16 7-14-10l3-32-22-24q-12-13 5-16l32-6Z"
            fill="#f4dfad"
            stroke="#b08b51"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <g transform="translate(120 92) scale(.85)">
            <Face happy />
          </g>
          <circle cx="166" cy="137" r="19" fill="#496d60" />
          <path
            d="m157 137 6 6 12-13"
            stroke="#fff8e9"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="m66 33-5-8m113 12 7-8m-62-14v-7"
            stroke="#e6a387"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>
      );
  }
}

export function Mascot({
  character = "invoice",
  compact = false,
}: {
  character?: Character;
  compact?: boolean;
}) {
  return (
    <span
      className={`${styles.scene} ${compact ? styles.compact : ""}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 240 190" fill="none" focusable="false">
        <ellipse
          cx="121"
          cy="167"
          rx="61"
          ry="9"
          fill="currentColor"
          opacity=".08"
        />
        <circle cx="120" cy="94" r="73" fill="currentColor" opacity=".05" />
        <g
          className={styles.sparkles}
          stroke="#c58a50"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M39 53v10m-5-5h10M207 115v10m-5-5h10" />
          <circle cx="195" cy="42" r="3" />
          <circle cx="34" cy="128" r="2" />
        </g>
        <CharacterArt character={character} />
        <g className={styles.hearts} fill="#e99b9d">
          <path d="M44 81c-10-10-18 4 0 14 18-10 10-24 0-14Z" />
          <path d="M191 65c-8-8-15 3 0 12 15-9 8-20 0-12Z" />
        </g>
      </svg>
    </span>
  );
}
