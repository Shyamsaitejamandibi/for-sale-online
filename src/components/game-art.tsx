import { cn } from "@/lib/utils";
export const palette = [
  "#dc785b",
  "#dfb54e",
  "#9b92bc",
  "#77a7a1",
  "#83a578",
  "#d38eaa",
];
export function Avatar({
  color = 0,
  small = false,
}: {
  color?: number;
  small?: boolean;
}) {
  const c = palette[color % 6];
  return (
    <svg
      viewBox="0 0 100 110"
      className={cn("avatar", small && "avatar-small")}
      aria-hidden="true"
    >
      <ellipse cx="51" cy="104" rx="33" ry="5" fill="#252c2420" />
      <path
        d="M20 99V81c0-17 13-29 30-29s30 12 30 29v18"
        fill={c}
        stroke="#35433b"
        strokeWidth="2.5"
      />
      <path
        d="M34 91v12M66 91v12"
        stroke="#35433b"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M31 63c-13-2-17-17-10-25 0-20 15-29 31-27 19-1 31 13 28 30 7 9 2 21-10 23"
        fill={color === 2 ? "#514b65" : "#393a30"}
      />
      <path
        d="M27 40c0-16 48-17 48 0v16c0 18-12 29-24 29S27 74 27 56Z"
        fill={color === 1 ? "#d3996d" : color === 3 ? "#ae795b" : "#efbf98"}
        stroke="#35433b"
        strokeWidth="2.5"
      />
      <path d="M31 37c7-3 14-7 17-14 7 12 17 15 29 15" fill="#393a30" />
      <ellipse cx="41" cy="53" rx="2.6" ry="3.3" fill="#343d33" />
      <ellipse cx="62" cy="53" rx="2.6" ry="3.3" fill="#343d33" />
      <path
        d="M47 66q5 5 10 0"
        fill="none"
        stroke="#343d33"
        strokeWidth="2.3"
        strokeLinecap="round"
      />
      <ellipse cx="35" cy="62" rx="5" ry="3" fill="#d9857150" />
      <ellipse cx="68" cy="62" rx="5" ry="3" fill="#d9857150" />
      {color === 0 ? (
        <>
          <path
            d="M23 37c-1-22 11-31 29-31s28 13 27 31"
            fill={c}
            stroke="#35433b"
            strokeWidth="2.5"
          />
          <rect
            x="21"
            y="28"
            width="60"
            height="14"
            rx="6"
            fill="#e88c6b"
            stroke="#35433b"
            strokeWidth="2.5"
          />
          <path
            d="M35 30v9m9-9v9m9-9v9m9-9v9"
            stroke="#bb614c"
            strokeWidth="2"
          />
        </>
      ) : color === 1 ? (
        <>
          <path
            d="M22 32c3-20 18-25 34-21 16 3 22 10 22 23"
            fill="#dcb859"
            stroke="#35433b"
            strokeWidth="2.5"
          />
          <path
            d="M18 34h67"
            stroke="#35433b"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </>
      ) : color === 2 ? (
        <path
          d="M24 40c-9-25 18-42 37-30 20-4 29 27 16 38l-5-19c-16 8-26 7-39 1Z"
          fill="#514b65"
          stroke="#35433b"
          strokeWidth="2.5"
        />
      ) : color === 3 ? (
        <>
          <path
            d="M25 34c-4-23 21-35 38-24 13-1 22 12 16 28l-10-9-13 4-15-8Z"
            fill="#393a30"
          />
          <path
            d="M31 51h16m10 0h15m-25 0h10"
            stroke="#35433b"
            strokeWidth="2"
          />
          <rect
            x="31"
            y="46"
            width="16"
            height="13"
            rx="5"
            fill="none"
            stroke="#35433b"
            strokeWidth="2"
          />
          <rect
            x="56"
            y="46"
            width="16"
            height="13"
            rx="5"
            fill="none"
            stroke="#35433b"
            strokeWidth="2"
          />
        </>
      ) : null}
      <path
        d="M21 85c-9 3-9 13-3 14h13M80 85c9 3 9 13 3 14H70"
        fill={color === 3 ? "#ae795b" : "#efbf98"}
        stroke="#35433b"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
export const propertyNames = [
  "The Cardboard Club",
  "Cosy Camper",
  "Little Hideaway",
  "Garden Shed",
  "Tiny Cabin",
  "The Treehouse",
  "Lakeside Hut",
  "Sunny Bungalow",
  "Rose Cottage",
  "The A-frame",
  "Cedar Lodge",
  "Corner House",
  "Palm Retreat",
  "The Townhouse",
  "Bluebird Villa",
  "Courtyard House",
  "The Brownstone",
  "Seaside Escape",
  "Modern Manor",
  "Hilltop House",
  "The Glasshouse",
  "Garden Estate",
  "The Grand Hotel",
  "Skyline Lofts",
  "Coastal Mansion",
  "Royal Residence",
  "The Penthouse",
  "Cloud Nine",
  "The Castle",
  "Moon Base",
];
export function HouseArt({ value }: { value: number }) {
  const type =
    value <= 6
      ? 0
      : value <= 12
        ? 1
        : value <= 18
          ? 2
          : value <= 23
            ? 3
            : value <= 27
              ? 4
              : 5;
  const colors = [
    "#be9370",
    "#e8bc72",
    "#da8b76",
    "#edc993",
    "#9db6b3",
    "#ccc2df",
  ];
  const c = colors[type];
  return (
    <svg viewBox="0 0 200 155" role="img" aria-label={propertyNames[value - 1]}>
      <circle cx="149" cy="35" r="20" fill="#f4d480" />
      <path d="M10 126Q51 105 94 119t96 0v36H10Z" fill="#d9dfb5" />
      <ellipse cx="105" cy="136" rx="70" ry="9" fill="#758c6330" />
      <g stroke="#49554b" strokeWidth="2.2" strokeLinejoin="round">
        {value === 30 ? (
          <>
            <path d="M37 124V90a37 37 0 0 1 74 0v34Z" fill="#c8d5ce" />
            <path d="M36 91h77M72 53v71" fill="none" />
            <path d="M104 124V98h44v26Z" fill="#a5b9b0" />
            <circle cx="55" cy="104" r="10" fill="#85a6ad" />
            <circle cx="90" cy="104" r="10" fill="#85a6ad" />
            <path d="M137 97V67m-13 4 28-10-7-17-28 10Z" fill="#839aa6" />
            <path d="M158 130V85l10-22 10 22v45Z" fill="#f1e4cc" />
            <path
              d="m158 89 20 0M158 112l-8 15h8m20-15 8 15h-8"
              fill="#b87964"
            />
            <circle cx="168" cy="96" r="5" fill="#90acb0" />
            <path d="M84 53V29l18 7-18 7" fill="#c9805e" />
          </>
        ) : type === 0 ? (
          <>
            <path d="M45 128V78l49-35 49 35v50Z" fill={c} />
            <path d="m35 81 59-45 60 45-8 8-52-37-52 37Z" fill="#708778" />
            <path d="M111 128V94h19v34" fill="#7e6655" />
            <path d="M60 88h29v22H60Z" fill="#c4dfdd" />
            <path d="M75 88v22M60 99h29" />
            <path d="M94 43v-8h-9v14" fill="#786d61" />
            <path d="m38 128 113 1" />
          </>
        ) : type === 1 ? (
          <>
            <path d="M38 127V72h116v55Z" fill={c} />
            <path d="m29 76 29-40h77l29 40Z" fill="#bd7460" />
            <path d="M61 127V89h28v38" fill="#779c9b" />
            <path d="M107 88h29v23h-29Z" fill="#c4dcd4" />
            <path d="M121 88v23M107 99h29" />
            <path d="M58 36v-14h12v14" fill="#e8c9a0" />
            <path d="M38 122h116" />
            <circle cx="81" cy="110" r="1.4" fill="#f6d57e" />
          </>
        ) : type === 2 ? (
          <>
            <path d="M42 130V59h109v71Z" fill={c} />
            <path d="m34 63 24-30h76l25 30Z" fill="#617d7b" />
            <path d="M87 130V101h25v29" fill="#657f78" />
            {[59, 111].map((x) => (
              <g key={x}>
                <path d={`M${x} 73h21v21h-21Z`} fill="#c9e0d7" />
                <path d={`M${x + 10} 73v21M${x} 83h21`} />
              </g>
            ))}
            <path d="M48 102h26v19H48Z" fill="#c9e0d7" />
            <path d="M128 110h30v20h-30Z" fill="#e8c18d" />
            <path
              d="M133 106c-7-16 11-27 19-10 10-6 16 13 2 17"
              fill="#7e996d"
            />
          </>
        ) : type === 3 ? (
          <>
            <path d="M31 129V58h132v71Z" fill={c} />
            <path d="M24 58h146l-13-15H39Z" fill="#6a8e88" />
            <path d="M44 30h102v15H44Z" fill="#e5c49b" />
            {[46, 78, 110, 142].map((x) => (
              <g key={x}>
                <path d={`M${x} 70h13v19h-13Z`} fill="#93b6af" />
                <path d={`M${x} 100h13v19h-13Z`} fill="#93b6af" />
              </g>
            ))}
            <path d="M88 99h22v30H88Z" fill="#687f79" />
            <path d="M28 92h138" />
          </>
        ) : type === 4 ? (
          <>
            <path d="M40 130V68h52v62Z" fill="#d4bda0" />
            <path d="M82 130V29h67v101Z" fill={c} />
            <path d="M87 21h57v8H87Z" fill="#5d7877" />
            {[41, 64, 87, 110].map((y) => (
              <g key={y}>
                <path
                  d={`M94 ${y}h16v13H94ZM120 ${y}h16v13h-16Z`}
                  fill="#d6e7dc"
                />
              </g>
            ))}
            <path d="M50 82h26v12H50ZM50 104h26v12H50Z" fill="#a2bdb7" />
            <path d="M33 131h122" />
          </>
        ) : (
          <>
            <path d="M42 130V62h28v68Zm83 0V62h28v68Z" fill="#a49dbb" />
            <path d="M68 130V70h60v60Z" fill={c} />
            <path d="m36 62 20-32 20 32Zm83 0 20-32 20 32Z" fill="#777890" />
            <path d="M84 70V47h27v23Z" fill="#d4c6db" />
            <path d="m79 47 19-25 19 25Z" fill="#777890" />
            <path d="M85 130v-21c0-17 26-17 26 0v21" fill="#697b7b" />
            <path
              d="M51 81h10v16H51Zm83 0h10v16h-10ZM91 79h13v13H91Z"
              fill="#efe0a0"
            />
            <path d="M98 25V10l18 6-18 6" fill="#d9876b" />
          </>
        )}
        <path d="M24 132v-19" fill="none" />
        <path d="M14 115c-8-17 16-30 21-10 13 6 1 19-10 14Z" fill="#8fa779" />
        <path d="M173 134v-15" />
        <path d="M164 117c-6-14 12-25 18-11 12 8-1 18-10 15Z" fill="#7e996d" />
      </g>
      <path d="M105 134q-10 10-3 21h31q-22-11-16-21" fill="#e6d4ae" />
    </svg>
  );
}
export function PropertyCard({
  value,
  compact = false,
  selected = false,
  onClick,
  disabled = false,
}: {
  value: number;
  compact?: boolean;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const content = (
    <>
      <div className="property-top">
        <span>{String(value).padStart(2, "0")}</span>
        <span className="card-star">✦</span>
      </div>
      <HouseArt value={value} />
      <div className="property-label">{propertyNames[value - 1]}</div>
      <div className="property-bottom">
        <span>PROPERTY</span>
        <span>{String(value).padStart(2, "0")}</span>
      </div>
    </>
  );
  return onClick ? (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "property-card",
        compact && "compact-card",
        selected && "selected-card",
      )}
      aria-label={`Select ${propertyNames[value - 1]}, value ${value}`}
      aria-pressed={selected}
    >
      {content}
    </button>
  ) : (
    <div className={cn("property-card", compact && "compact-card")}>
      {content}
    </div>
  );
}
