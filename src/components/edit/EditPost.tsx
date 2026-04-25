import * as React from "react";

import { useParams } from "react-router-dom";

import { Typography } from "antd";

import { decodeServerUrlSegment } from "../../routes";
import { DetailPageTracker } from "../analytics/DetailPageTracker";
import { AuthGuard } from "../AuthGuard";
import { usePostByIdQuery } from "../hooks";
import { Loader } from "../Loader";
import { OwnerGuard } from "../OwnerGuard";
import { PostForm } from "../publish/PostForm";
import { getRelatedTargetSelection } from "../shared/post/utils";

const EditPost: React.FunctionComponent = () => {
    const { id, serverUrl } = useParams<{ id: string; serverUrl: string }>();
    const routeServerURL = decodeServerUrlSegment(serverUrl ?? "");
    const query = usePostByIdQuery({ id: id!, draft: true, url: routeServerURL });

    return (
        <AuthGuard>
            <div className="Publish">
                <Loader query={query}>
                    {(data) => {
                        const post = data.Post;
                        const createdById = post?.createdBy?.id;

                        return (
                            <OwnerGuard createdById={createdById}>
                                <DetailPageTracker serverUrl={post?.company?.serverURL ?? routeServerURL} />
                                <Typography.Title level={3}>Edit Post</Typography.Title>
                                <PostForm
                                    mode="edit"
                                    initialValues={{
                                        id: post?.id,
                                        slug: post?.slug,
                                        title: post?.title,
                                        content: post?.content,
                                        seoDescription: post?.meta?.description,
                                        company: post?.company?.id,
                                        relatedTarget: getRelatedTargetSelection(post?.relatedPosts?.[0]),
                                        existingImageUrl: post?.heroImage?.url,
                                        existingImageId: post?.heroImage?.id,
                                    }}
                                    url={post?.company?.serverURL ?? routeServerURL}
                                />
                            </OwnerGuard>
                        );
                    }}
                </Loader>
            </div>
        </AuthGuard>
    );
};

export default EditPost;
