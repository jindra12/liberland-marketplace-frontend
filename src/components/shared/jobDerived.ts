import uniqBy from "lodash-es/uniqBy";
import { formatBounty, formatPositions } from "./job/utils";
import { IdentityTagItem, JobDerivedInput, JobIdentityDedupeBy } from "../../types";

export const getJobMeta = (job?: JobDerivedInput | null) => {
    const companyIdentity = job?.company?.identity?.name
        ? {
              id: job.company.identity.id,
              name: job.company.identity.name,
          }
        : undefined;

    return {
        bounty: formatBounty(job?.bounty?.amount, job?.bounty?.currency),
        positions: formatPositions(job?.positions),
        companyIdentity,
    };
};

export const getJobIdentityAccess = (job?: JobDerivedInput | null, dedupeBy: JobIdentityDedupeBy = "id") => {
    const dedupeKey = (identity: IdentityTagItem) => (dedupeBy === "name" ? identity.name : identity.id);

    return {
        allowedIdentities: uniqBy(
            [...(job?.allowedIdentities || []), ...(job?.company?.allowedIdentities || [])],
            dedupeKey,
        ),
        disallowedIdentities: uniqBy(
            [...(job?.disallowedIdentities || []), ...(job?.company?.disallowedIdentities || [])],
            dedupeKey,
        ),
    };
};
