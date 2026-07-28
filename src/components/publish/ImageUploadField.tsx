import * as React from "react";

import { PlusOutlined } from "@ant-design/icons";
import { Form, Modal, Upload } from "antd";
import type { UploadFile } from "antd/es/upload/interface";

import { getImage } from "../shared/image/utils";

const normFile = (
    e:
        | {
              fileList?: UploadFile[];
          }
        | UploadFile[],
) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
};
interface ImageUploadFieldProps {
    existingImageUrl?: string | null;
    serverUrl: string;
}
export const ImageUploadField: React.FunctionComponent<ImageUploadFieldProps> = (props) => {
    const [previewOpen, setPreviewOpen] = React.useState(false);
    const [previewSrc, setPreviewSrc] = React.useState("");
    const existingImageSrc = props.existingImageUrl
        ? getImage({
              __typename: "Product",
              image: {
                  url: props.existingImageUrl,
              },
              serverURL: props.serverUrl,
          })
        : undefined;
    const defaultFileList: UploadFile[] = existingImageSrc
        ? [
              {
                  uid: "-1",
                  name: "Current image",
                  status: "done",
                  url: existingImageSrc,
              },
          ]
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
                    multiple={false}
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
