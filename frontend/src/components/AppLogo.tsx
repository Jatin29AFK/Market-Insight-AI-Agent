import { LineChart } from "lucide-react";

type AppLogoProps = {
  size?: "sm" | "lg";
};

export function AppLogo({ size = "sm" }: AppLogoProps) {
  const wrapperSize = size === "lg" ? "h-24 w-24 rounded-[2rem]" : "h-11 w-11 rounded-2xl";
  const iconSize = size === "lg" ? "h-12 w-12" : "h-5 w-5";

  return (
    <div
      className={`${wrapperSize} flex items-center justify-center border border-cyan-300/25 bg-cyan-300/10 shadow-lg shadow-cyan-950/30`}
    >
      <LineChart className={`${iconSize} text-cyan-200`} />
    </div>
  );
}
