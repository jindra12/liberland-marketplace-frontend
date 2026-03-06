import * as React from "react";
import { Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

export const DetailBackButton: React.FunctionComponent = () => {
    const navigate = useNavigate();
    return (
        <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="DetailBackButton"
        >
            Back
        </Button>
    );
};
