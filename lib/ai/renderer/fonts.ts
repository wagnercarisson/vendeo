import { existsSync } from "fs";
import path from "path";

const FONT_FILES = [
  { family: "Inter", weight: "400", file: "Inter-Regular.ttf" },
  { family: "Inter", weight: "600", file: "Inter-SemiBold.ttf" },
  { family: "Inter", weight: "700", file: "Inter-Bold.ttf" },
  { family: "Inter", weight: "900", file: "Inter-Black.ttf" },
  { family: "Poppins", weight: "400", file: "Poppins-Regular.ttf" },
  { family: "Poppins", weight: "700", file: "Poppins-Bold.ttf" },
  { family: "Bebas Neue", weight: "700", file: "BebasNeue-Regular.ttf" },
  { family: "Montserrat", weight: "400", file: "Montserrat-Regular.ttf" },
  { family: "Montserrat", weight: "700", file: "Montserrat-Bold.ttf" },
  { family: "Roboto Condensed", weight: "400", file: "RobotoCondensed-Regular.ttf" },
  { family: "Roboto Condensed", weight: "700", file: "RobotoCondensed-Bold.ttf" },
] as const;

let fontsLoaded = false;

export function ensureRendererFontsLoaded(): void {
  if (fontsLoaded) {
    return;
  }

  const fontsDir = path.join(process.cwd(), "public", "fonts");

  for (const font of FONT_FILES) {
    const filePath = path.join(fontsDir, font.file);
    if (!existsSync(filePath)) {
      continue;
    }
  }

  fontsLoaded = true;
}