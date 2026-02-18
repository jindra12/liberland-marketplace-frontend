import React, { useState } from "react";
import { Form, Modal, Upload } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import { BACKEND_URL } from "../../gqlFetcher";

const normFile = (e: { fileList?: UploadFile[] } | UploadFile[]) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
};

interface ImageUploadFieldProps {
    existingImageUrl?: string | null;
}

export const ImageUploadField: React.FunctionComponent<ImageUploadFieldProps> = ({ existingImageUrl }) => {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewSrc, setPreviewSrc] = useState("");

    const defaultFileList: UploadFile[] = existingImageUrl
        ? [{
            uid: "-1",
            name: "Current image",
            status: "done",
            url: `${BACKEND_URL}${existingImageUrl}`,
        }]
        : [];

    const handlePreview = async (file: UploadFile) => {
        const src = file.url || URL.createObjectURL(file.originFileObj as File);
        setPreviewSrc(src);
        setPreviewOpen(true);
    };

    return (
        <>
            <Form.Item
                name="imageFile"
                label="Image"
                valuePropName="fileList"
                getValueFromEvent={normFile}
                initialValue={defaultFileList}
            >
                <Upload
                    listType="picture-card"
                    maxCount={1}
                    accept="image/*"
                    beforeUpload={() => false}
                    onPreview={handlePreview}
                >
                    <div>
                        <PlusOutlined />
                        <div className="ImageUpload__label">Upload</div>
                    </div>
                </Upload>
            </Form.Item>
            <Modal open={previewOpen} footer={null} onCancel={() => setPreviewOpen(false)}>
                <img alt="preview" className="ImageUpload__preview" src={previewSrc} />
            </Modal>
        </>
    );
};
