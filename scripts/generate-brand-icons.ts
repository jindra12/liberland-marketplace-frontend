import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import pngToIco from "png-to-ico";
import sharp from "sharp";

const generateBrandIcons = async () => {
    const source = await readFile(resolve("public/logo.svg"));

    await Promise.all(
        [192, 512].map((size) =>
            sharp(source)
                .resize(size, size)
                .png()
                .toFile(resolve(`public/logo${size}.png`)),
        ),
    );

    const faviconImages = await Promise.all(
        [16, 24, 32, 64].map((size) => sharp(source).resize(size, size).png().toBuffer()),
    );
    await writeFile(resolve("public/favicon.ico"), await pngToIco(faviconImages));
};

generateBrandIcons();
