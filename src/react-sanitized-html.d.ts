declare module "react-sanitized-html" {
    import { ComponentType } from "react";
    const SanitizedHTML: ComponentType<{ html: string }>;
    export default SanitizedHTML;
}
