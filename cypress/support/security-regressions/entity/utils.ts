import type { EntityFormTestConfig } from "../types";
import type { RcFile } from "antd/es/upload/interface";

export class FixtureUploadFile extends File implements RcFile {
    uid = "fixture";

    get lastModifiedDate(): Date {
        return new Date(this.lastModified);
    }
}

export const createEntityFormConfig = (): EntityFormTestConfig => {
    const create = cy.stub().as("createCompany");
    create.resolves({ id: "company" });
    return {
        entityName: "Company",
        routePrefix: "/companies",
        url: "https://selected-market.example",
        mode: "create",
        createMutation: { isPending: false, mutateAsync: create },
        updateMutation: { isPending: false, mutateAsync: cy.stub().resolves({ id: "company" }) },
        buildData: (values) => ({ name: values.name }),
        getCreateId: (result) => result.id,
        getUpdateId: (result) => result.id,
    };
};
