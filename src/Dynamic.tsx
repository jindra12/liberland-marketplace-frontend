import dynamic from "next/dynamic";

export const Dynamic = dynamic(() => import("./Main"), { ssr: false });
