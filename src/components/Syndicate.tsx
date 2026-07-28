import * as React from "react";

import { useNavigate } from "react-router-dom";

import { Button, Divider, Flex, Modal, Pagination, Space } from "antd";

import { routes } from "../routes";

import { SYNDICATE_PAGES } from "./syndicate/constants";
import { SyndicatePageContent } from "./syndicate/SyndicatePageContent";

const Syndicate: React.FunctionComponent = () => {
    const navigate = useNavigate();
    const [pageIndex, setPageIndex] = React.useState(0);
    const page = SYNDICATE_PAGES[pageIndex];
    const isFirstPage = pageIndex === 0;
    const isLastPage = pageIndex === SYNDICATE_PAGES.length - 1;

    return (
        <Modal
            open
            centered
            width={960}
            destroyOnHidden
            getContainer={false}
            transitionName=""
            maskTransitionName=""
            title="Get your marketplace online"
            onCancel={() => navigate(routes.home.route)}
            maskClosable={false}
            className="SyndicateModal"
            footer={
                <Flex vertical gap={18} className="SyndicateModal__footer">
                    <Flex wrap gap={12} align="center" justify="space-between" className="SyndicateModal__footerRow">
                        <Space.Compact className="SyndicateModal__pagerControls">
                            <Button onClick={() => setPageIndex(pageIndex - 1)} disabled={isFirstPage}>
                                Back
                            </Button>
                            <Pagination
                                current={pageIndex + 1}
                                total={SYNDICATE_PAGES.length}
                                pageSize={1}
                                simple={false}
                                showSizeChanger={false}
                                onChange={(nextPage) => {
                                    setPageIndex(nextPage - 1);
                                }}
                                className="SyndicateModal__pagination"
                            />
                            <Button onClick={() => setPageIndex(pageIndex + 1)} disabled={isLastPage}>
                                Next
                            </Button>
                        </Space.Compact>
                    </Flex>
                    <Divider className="SyndicateModal__footerDivider" />
                    <Button
                        type="primary"
                        size="large"
                        block
                        className="SyndicateModal__browserButton"
                        disabled={!isLastPage}
                        onClick={() => navigate(routes.home.route)}
                    >
                        Browse web
                    </Button>
                </Flex>
            }
        >
            <SyndicatePageContent page={page} pageIndex={pageIndex} pageCount={SYNDICATE_PAGES.length} />
        </Modal>
    );
};

// eslint-disable-next-line import/no-default-export
export default Syndicate;
