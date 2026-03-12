export function Logo({ size = "default" }: { size?: "small" | "default" }) {
  const imgSize = size === "small" ? 24 : 30;
  const textSize = size === "small" ? "text-lg" : "text-xl";
  const toSize = size === "small" ? "text-xs" : "text-sm";

  return (
    <div className="flex items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="" width={imgSize} height={imgSize} />
      <span className={`${textSize} inline-flex items-center font-extrabold`} style={{ fontFamily: "'Nunito', sans-serif" }}>
        Push
        <span className={`${toSize} mx-1 font-bold text-primary underline underline-offset-2`}>to</span>
        Start
      </span>
    </div>
  );
}
