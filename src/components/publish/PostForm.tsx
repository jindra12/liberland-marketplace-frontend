import * as React from "react";

import { useAuth } from "react-oidc-context";

import { Form, Input } from "antd";
import type { UploadFile } from "antd/es/upload/interface";

import { CompanyField } from "../CompanyField";
import {
    useCreatePostMutation,
    useUpdatePostMutation,
} from "../hooks";
import type { RelatedTargetSelection } from "../shared/post/types";

import { FormSubmitButtons } from "./FormSubmitButtons";
import { ImageUploadField } from "./ImageUploadField";
import { MarkdownEditor } from "./MarkdownEditor";
import { RelatedTargetField } from "./postForm/RelatedTargetField";
import { buildRelatedTargetSelection, buildSeoDescription, resolvePostSeoDescription, slugifyPostTitle } from "./postForm/utils";
import { useEntityForm } from "./useEntityForm";

interface PostFormValues {
    title: string | null;
    content?: string | null;
    seoDescription?: string | null;
    company?: string | null;
    relatedTarget?: RelatedTargetSelection | null;
    imageFile?: UploadFile[];
}

export interface PostFormProps {
    mode: "create" | "edit";
    url: string;
    initialValues?: Partial<PostFormValues> & {
        id?: string | null;
        slug?: string | null;
        existingImageUrl?: string | null;
        existingImageId?: string | null;
    };
}

export const PostForm: React.FunctionComponent<PostFormProps> = (props) => {
    const auth = useAuth();
    const createMutation = useCreatePostMutation();
    const updateMutation = useUpdatePostMutation();
    const userId = auth.user?.profile?.sub;
    const initialSeoDescription = props.initialValues?.seoDescription ?? buildSeoDescription(props.initialValues?.content ?? "");
    const defaults: Partial<PostFormValues> = {
        ...props.initialValues,
        seoDescription: initialSeoDescription,
    };
    const { form, draftRef, loading, onFinish } = useEntityForm({
        entityName: "Post",
        routePrefix: "/posts",
        mode: props.mode,
        existingImageId: props.initialValues?.existingImageId,
        editId: props.initialValues?.id,
        createMutation,
        updateMutation,
        url: props.url,
        buildData: (values: PostFormValues, imageId) => {
            const relatedTarget = buildRelatedTargetSelection(values.relatedTarget);
            const slug = props.initialValues?.slug || slugifyPostTitle(values.title || "");
            const seoDescription = resolvePostSeoDescription(
                values.content,
                values.seoDescription,
                initialSeoDescription,
            );

            return {
                title: values.title,
                slug,
                content: values.content ?? "",
                company: values.company,
                meta: {
                    title: values.title,
                    description: seoDescription,
                },
                ...(imageId !== undefined && {
                    heroImage: imageId,
                }),
                ...(relatedTarget && {
                    relatedPosts: [relatedTarget],
                }),
            };
        },
        getCreateId: (r) => r.createPost?.id,
        getUpdateId: (r) => r.updatePost?.id,
    });

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={defaults}
            className="Publish__form"
        >
            <Form.Item
                name="title"
                label="Title"
                rules={[
                    {
                        required: true,
                    },
                ]}
                className="Publish__postTitleField"
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="content"
                label="Content"
                rules={[
                    {
                        required: true,
                        message: "Please add post content",
                    },
                ]}
                className="Publish__postContentField"
            >
                <MarkdownEditor rows={10} placeholder="Supports Markdown formatting" />
            </Form.Item>
            <Form.Item
                name="seoDescription"
                label="Description"
                className="Publish__postDescriptionField"
            >
                <Input.TextArea rows={3} placeholder="Used as the snippet in lists and search" />
            </Form.Item>
            <Form.Item
                name="company"
                label="Company"
                rules={[
                    {
                        required: true,
                        message: "Please select a company",
                    },
                ]}
                className="Publish__postCompanyField"
            >
                <CompanyField serverURL={props.url} userId={userId} />
            </Form.Item>
            <Form.Item name="relatedTarget" label="Related content" className="Publish__postRelatedField">
                <RelatedTargetField />
            </Form.Item>
            <ImageUploadField existingImageUrl={props.initialValues?.existingImageUrl} serverUrl={props.url} />
            <Form.Item>
                <FormSubmitButtons mode={props.mode} entityName="Post" loading={loading} draftRef={draftRef} />
            </Form.Item>
        </Form>
    );
};
