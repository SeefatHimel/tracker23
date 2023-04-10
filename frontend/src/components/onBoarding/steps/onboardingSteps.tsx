import React, { useState } from "react";
import { Button, message, Steps, theme } from "antd";
import PurposeStep from "./components/purpose";
import NamingStep from "./components/namingSection";

const steps = [
  {
    title: "Purpose",
    content: <PurposeStep />,
  },
  {
    title: "Name",
    content: <NamingStep />,
  },
  {
    title: "Invite Your TeamMates",
    content: "Last-content",
  },
];

const OnboardingSteps: React.FC = () => {
  const { token } = theme.useToken();
  const [current, setCurrent] = useState(0);

  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const items = steps.map((item) => ({ key: item.title, title: item.title }));

  const contentStyle: React.CSSProperties = {
    // textAlign: "center",
    color: token.colorTextTertiary,
    backgroundColor: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    // border: `1px dashed ${token.colorBorder}`,
    marginTop: 16,
    padding: 30,
  };

  return (
    <div className="w-[560px]">
      <Steps current={current} items={items} />
      <div style={contentStyle}>{steps[current].content}</div>
      <div style={{ marginTop: 24 }}>
        {current < steps.length - 1 && (
          <Button type="primary" onClick={() => next()}>
            Continue
          </Button>
        )}
        {current === steps.length - 1 && (
          <Button
            type="primary"
            onClick={() => message.success("Processing complete!")}
          >
            Done
          </Button>
        )}
        {current > 0 && (
          <Button style={{ margin: "0 8px" }} onClick={() => prev()}>
            Previous
          </Button>
        )}
      </div>
    </div>
  );
};

export default OnboardingSteps;