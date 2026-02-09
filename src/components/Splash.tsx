import * as React from "react";
import { Card, Col, Row, Typography } from "antd";

const Splash: React.FunctionComponent = () => {
    return (
        <div className="SplashPage">
            <Row gutter={[16, 16]} align="middle">
                <Col xs={24} lg={12}>
                    <Typography.Title className="SplashPage__title">
                        Liberland Market
                    </Typography.Title>
                </Col>

                <Col xs={24} lg={12}>
                    <Card className="SplashPage__card" bordered={false}>
                        <picture className="SplashPage__picture">
                            <source
                                media="(max-width: 768px)"
                                srcSet="/hero/hero-mobile-900x1200.png 1x, /hero/hero-mobile-1350x1800.png 2x"
                            />
                            <source
                                media="(min-width: 769px)"
                                srcSet="/hero/hero-desktop-1600x900.png 1x, /hero/hero-desktop-2400x1350.png 2x"
                            />
                            <img
                                className="SplashPage__img"
                                src="/hero/hero-desktop-1600x900.png"
                                alt="Liberland Market"
                            />
                        </picture>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Splash;
