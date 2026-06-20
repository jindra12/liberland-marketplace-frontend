import * as React from "react";

import { mount } from "cypress/react";
import { MemoryRouter } from "react-router-dom";
import { useSessionStorage } from "usehooks-ts";

import { AntProvider } from "../../src/components/AntProvider";
import { LoginSuccessMessageService } from "../../src/components/auth/LoginSuccessMessageService";
import { LOGIN_SUCCESS_MESSAGE_STORAGE_KEY } from "../../src/components/auth/constants";
import { routes } from "../../src/routes";

const LoginSuccessMessageSeeder: React.FunctionComponent = () => {
    const [, setLoginSuccessPending] = useSessionStorage<boolean>(LOGIN_SUCCESS_MESSAGE_STORAGE_KEY, false);

    React.useEffect(() => {
        setLoginSuccessPending(true);
    }, [setLoginSuccessPending]);

    return null;
};

const mountLoginSuccessMessageService = (pathname: string) => {
    mount(
        <AntProvider>
            <MemoryRouter initialEntries={[pathname]}>
                <LoginSuccessMessageSeeder />
                <LoginSuccessMessageService />
            </MemoryRouter>
        </AntProvider>,
    );
};

describe("login success message", () => {
    it("shows a success message after the app lands on a normal page", () => {
        mountLoginSuccessMessageService(routes.home.route);

        cy.contains(".ant-message-notice", "You were logged in successfully.", { timeout: 20000 }).should("be.visible");
    });

    it("waits while the app is still on the auth callback route", () => {
        mountLoginSuccessMessageService(routes.authCallback.route);

        cy.contains(".ant-message-notice", "You were logged in successfully.").should("not.exist");
    });
});
