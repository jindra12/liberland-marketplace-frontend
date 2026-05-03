import type {
    CartBySecretQueryVariables,
    CreateCommentMutationVariables,
    CreateCompanyMutationVariables,
    CreateInformationRequestMutationVariables,
    CreateJobMutationVariables,
    CreateOrderMutationVariables,
    CreatePostCommentMutationVariables,
    CreatePostMutationVariables,
    CreatePostReplyCommentMutationVariables,
    CreateProductMutationVariables,
    CreateReplyToCommentMutationVariables,
    CreateReportMutationVariables,
    CreateStartupMutationVariables,
    SubscribeToCompanyUpdatesMutationVariables,
    SubscribeToJobUpdatesMutationVariables,
    SubscribeToProductUpdatesMutationVariables,
    SubscribeToTribeUpdatesMutationVariables,
    SubscribeToVentureUpdatesMutationVariables,
    UpdateCommentContentMutationVariables,
    UpdateCompanyMutationVariables,
    UpdateJobMutationVariables,
    UpdateOrderMutationVariables,
    UpdatePostCommentContentMutationVariables,
    UpdatePostMutationVariables,
    UpdateProductMutationVariables,
    UpdateStartupMutationVariables,
    UpdateUserByIdMutationVariables,
} from "../../generated/graphql";

type JsonValue = string | number | boolean | null | undefined | JsonValue[] | { [key: string]: JsonValue };

const redactValue = "[redacted]" as const;

const redactKeys = <T extends JsonValue>(value: T, keys: readonly string[]): T => {
    if (Array.isArray(value)) {
        return value.map((entry) => redactKeys(entry, keys)) as T;
    }

    if (!value || typeof value !== "object") {
        return value;
    }

    return Object.fromEntries(
        Object.entries(value).map(([key, entry]) => {
            if (keys.includes(key)) {
                return [key, redactValue];
            }

            return [key, redactKeys(entry as JsonValue, keys)];
        }),
    ) as T;
};

const createAnonymizer = <TVariables extends JsonValue>(keys: readonly string[]) => {
    return (variables: TVariables): TVariables => redactKeys(variables, keys);
};

export const anonymizeCartBySecretVariables = createAnonymizer<CartBySecretQueryVariables>(["secret"]);
export const anonymizeCreateOrderVariables = createAnonymizer<CreateOrderMutationVariables>([
    "customerEmail",
    "payerAddress",
    "shippingAddress",
]);
export const anonymizeUpdateOrderVariables = createAnonymizer<UpdateOrderMutationVariables>([
    "customerEmail",
    "payerAddress",
    "shippingAddress",
]);
export const anonymizeUpdateUserByIdVariables = createAnonymizer<UpdateUserByIdMutationVariables>([
    "name",
    "email",
    "phone",
    "shippingAddress",
]);
export const anonymizeCreateCompanyVariables = createAnonymizer<CreateCompanyMutationVariables>(["email", "phone"]);
export const anonymizeUpdateCompanyVariables = createAnonymizer<UpdateCompanyMutationVariables>(["email", "phone"]);
export const anonymizeCreateJobVariables = createAnonymizer<CreateJobMutationVariables>(["email", "phone"]);
export const anonymizeUpdateJobVariables = createAnonymizer<UpdateJobMutationVariables>(["email", "phone"]);
export const anonymizeCreateProductVariables = createAnonymizer<CreateProductMutationVariables>(["email", "phone"]);
export const anonymizeUpdateProductVariables = createAnonymizer<UpdateProductMutationVariables>(["email", "phone"]);
export const anonymizeCreateStartupVariables = createAnonymizer<CreateStartupMutationVariables>(["email", "phone"]);
export const anonymizeUpdateStartupVariables = createAnonymizer<UpdateStartupMutationVariables>(["email", "phone"]);
export const anonymizeSubscribeToCompanyUpdatesVariables = createAnonymizer<SubscribeToCompanyUpdatesMutationVariables>([
    "email",
]);
export const anonymizeSubscribeToJobUpdatesVariables = createAnonymizer<SubscribeToJobUpdatesMutationVariables>([
    "email",
]);
export const anonymizeSubscribeToProductUpdatesVariables = createAnonymizer<SubscribeToProductUpdatesMutationVariables>([
    "email",
]);
export const anonymizeSubscribeToTribeUpdatesVariables = createAnonymizer<SubscribeToTribeUpdatesMutationVariables>([
    "email",
]);
export const anonymizeSubscribeToVentureUpdatesVariables = createAnonymizer<SubscribeToVentureUpdatesMutationVariables>([
    "email",
]);
export const anonymizeCreateCommentVariables = createAnonymizer<CreateCommentMutationVariables>(["content"]);
export const anonymizeCreateReplyToCommentVariables = createAnonymizer<CreateReplyToCommentMutationVariables>([
    "content",
]);
export const anonymizeCreatePostCommentVariables = createAnonymizer<CreatePostCommentMutationVariables>(["content"]);
export const anonymizeCreatePostReplyCommentVariables = createAnonymizer<CreatePostReplyCommentMutationVariables>([
    "content",
]);
export const anonymizeUpdateCommentContentVariables = createAnonymizer<UpdateCommentContentMutationVariables>([
    "content",
]);
export const anonymizeUpdatePostCommentContentVariables = createAnonymizer<UpdatePostCommentContentMutationVariables>([
    "content",
]);
export const anonymizeCreatePostVariables = createAnonymizer<CreatePostMutationVariables>([
    "title",
    "content",
    "description",
]);
export const anonymizeUpdatePostVariables = createAnonymizer<UpdatePostMutationVariables>([
    "title",
    "content",
    "description",
]);
export const anonymizeReportVariables = createAnonymizer<CreateReportMutationVariables>(["reason"]);
export const anonymizeCreateInformationRequestVariables = createAnonymizer<CreateInformationRequestMutationVariables>([
    "reason",
]);
