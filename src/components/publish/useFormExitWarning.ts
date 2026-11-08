import { useContext } from "react";
import { Form } from "antd";
import { UNSAFE_DataRouterContext, useBeforeUnload } from "react-router-dom";

export const useFormExitWarning = () => {
    const form = Form.useFormInstance();
    const dataRouter = useContext(UNSAFE_DataRouterContext);
    useBeforeUnload((event) => {
        if (form.isFieldsTouched()) {
            event.preventDefault();
            event.returnValue = "";
        }
    });
    return { form, dataRouter };
};
