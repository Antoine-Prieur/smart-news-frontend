import Link from "next/link";
import { styled } from "@mui/material";
import Image from "next/image";

// ✅ FIXED: Proper container with explicit dimensions
const LinkStyled = styled(Link)(() => ({
  height: "40px",
  width: "180px", // Give it a fixed width
  position: "relative",
  margin: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const Logo = () => {
  return (
    <LinkStyled href="/">
      <Image
        src="/images/logos/smart-news-logo.png"
        alt="logo"
        // ✅ FIXED: Use explicit width/height instead of fill
        width={180}
        height={40}
        style={{
          objectFit: "contain",
          maxWidth: "100%",
          height: "auto",
        }}
        priority
      />
    </LinkStyled>
  );
};

export default Logo;
