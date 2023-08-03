import React, { ReactNode } from "react";
import Tilt from "react-parallax-tilt";
import { useColorMode } from "@docusaurus/theme-common";

type MainTitleProps = {
  children: ReactNode;
};

export const MainTitle = ({ children }: MainTitleProps) => {
  const { colorMode } = useColorMode();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        marginBottom: "30px",
      }}
    >
      <Tilt
        tiltAxis="y"
        tiltMaxAngleY={5}
        transitionSpeed={2500}
        glareEnable={true}
        glareMaxOpacity={0.08}
        glareColor={colorMode === "dark" ? "#1b8aff" : "#498cd5"}
        glarePosition="all"
        glareBorderRadius="9px"
      >
        <div
          style={{ display: "flex", alignItems: "center", columnGap: "6px" }}
        >
          <img src="https://raw.githubusercontent.com/mkosir/typescript-style-guide/main/misc/typescript-logo-30.png" />{" "}
          <h1 style={{ marginBottom: 0 }}>{children}</h1>
        </div>
      </Tilt>
    </div>
  );
};
