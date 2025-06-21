import Link from "next/link";
import { styled } from "@mui/material";
import Image from "next/image";

const LinkStyled = styled(Link)(() => ({
  height: "40px",
  width: "auto",
  position: "relative",
  display: "block",
  marginTop: "16px",
  marginBottom: "32px",
}));

const Logo = () => {
  return (
    <LinkStyled href="/">
      <Image
        src="/images/logos/smart-news-logo.png"
        alt="logo"
        fill
        style={{
          objectFit: "contain", // Keeps ratio, fits within container
        }}
        priority
      />
    </LinkStyled>
  );
};

export default Logo;

